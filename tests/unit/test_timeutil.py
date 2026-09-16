"""agents/common/timeutil.py 单元测试。

覆盖：
- now_cn() 返回 +8 小时时区偏移
- now_cn_iso() 携带 +08:00 后缀
- parse_argo_ts: Z 后缀 / +00:00 / naive（按 UTC）→ 北京时间
- parse_argo_ts: None / 垃圾输入 → None
- to_cn_iso: naive 抛异常、aware 正确转换
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from agents.common.timeutil import BEIJING, now_cn, now_cn_iso, parse_argo_ts, to_cn_iso


def test_now_cn_utcoffset_is_plus_8h():
    """Given 系统任意时刻, When 调用 now_cn(), Then utcoffset 为 +8 小时。"""
    dt = now_cn()
    assert dt.utcoffset() == timedelta(hours=8)


def test_now_cn_iso_carries_beijing_offset():
    """Given 系统任意时刻, When 调用 now_cn_iso(), Then 后缀为 +08:00。"""
    iso = now_cn_iso()
    assert iso.endswith("+08:00")


def test_parse_argo_ts_z_suffix():
    """Given Argo 'Z' 后缀时间戳, When 解析, Then 转为北京时间。"""
    assert parse_argo_ts("2026-05-26T08:00:00Z") == "2026-05-26T16:00:00+08:00"


def test_parse_argo_ts_plus_zero_offset():
    """Given '+00:00' 偏移时间戳, When 解析, Then 转为北京时间。"""
    assert parse_argo_ts("2026-05-26T08:00:00+00:00") == "2026-05-26T16:00:00+08:00"


def test_parse_argo_ts_naive_assumed_utc():
    """Given naive 时间戳, When 解析, Then 按 UTC 解释并转为北京时间。"""
    assert parse_argo_ts("2026-05-26T08:00:00") == "2026-05-26T16:00:00+08:00"


def test_parse_argo_ts_none_returns_none():
    """Given None 输入, When 解析, Then 返回 None。"""
    assert parse_argo_ts(None) is None


def test_parse_argo_ts_garbage_returns_none():
    """Given 无法解析的字符串, When 解析, Then 返回 None。"""
    assert parse_argo_ts("garbage") is None


def test_to_cn_iso_raises_on_naive():
    """Given naive datetime, When 调 to_cn_iso, Then 抛 ValueError。"""
    with pytest.raises(ValueError):
        to_cn_iso(datetime(2026, 5, 26, 8, 0, 0))


def test_to_cn_iso_converts_aware():
    """Given aware UTC datetime, When 调 to_cn_iso, Then 返回北京时间字符串。"""
    aware = datetime(2026, 5, 26, 8, 0, 0, tzinfo=timezone.utc)
    assert to_cn_iso(aware) == "2026-05-26T16:00:00+08:00"
