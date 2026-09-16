"""agents/common/timeutil.py — 北京时间（Asia/Shanghai, UTC+8）时间工具。

统一后端所有用户可读时间戳到北京时间，输出带 ``+08:00`` 偏移的 ISO 8601 字符串。
Argo/K8s 时间戳（UTC）在 API 边界统一转北京时间。

用法：
    from agents.common.timeutil import now_cn, now_cn_iso, to_cn_iso, parse_argo_ts
"""

from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

BEIJING = ZoneInfo("Asia/Shanghai")


def now_cn() -> datetime:
    """当前北京时间（aware）。"""
    return datetime.now(BEIJING)


def now_cn_iso() -> str:
    """当前北京时间的 ISO 8601 字符串，例如 2026-05-26T16:00:00+08:00。"""
    return now_cn().isoformat()


def to_cn_iso(dt: datetime) -> str:
    """将 aware datetime 转为北京时间 ISO 8601 字符串。

    调用方必须传入 aware（带时区）datetime，naive 会抛 ValueError。
    """
    if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
        raise ValueError("to_cn_iso requires an aware datetime")
    return dt.astimezone(BEIJING).isoformat()


def parse_argo_ts(ts: str | None) -> str | None:
    """解析 Argo/存储的 ISO 8601 时间戳，返回北京时间 ISO 字符串。

    支持 ``Z`` 后缀、``+00:00`` 偏移、以及 naive（无时区）格式。
    naive 一律按 UTC 解释（Argo 约定 + 历史遗留数据）。
    无法解析或 falsy 输入返回 None。
    """
    if not ts:
        return None
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(BEIJING).isoformat()
