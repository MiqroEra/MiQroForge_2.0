"""agents/node_generator/shared/parsing.py — 生成/评估共用的文本解析工具。

prefab 与 ephemeral 两种模式的 generator/evaluator 共享
从 LLM 输出中提取代码块与 JSON 的逻辑，避免四处复制。
"""

from __future__ import annotations


def extract_script(text: str) -> str:
    """从 LLM 纯文本响应中提取脚本。"""
    script = text.strip()

    if "```python" in script:
        try:
            start = script.index("```python") + 9
            end = script.index("```", start)
            return script[start:end].strip()
        except ValueError:
            pass
    elif "```bash" in script:
        try:
            start = script.index("```bash") + 7
            end = script.index("```", start)
            return script[start:end].strip()
        except ValueError:
            pass
    elif "```" in script:
        try:
            start = script.index("```") + 3
            end = script.index("```", start)
            return script[start:end].strip()
        except ValueError:
            pass

    return script


def extract_json(text: str) -> str:
    """从 LLM 响应中提取 JSON 字符串（容忍 markdown 代码块与前后散文）。"""
    if "```json" in text:
        start = text.index("```json") + 7
        end = text.index("```", start)
        return text[start:end].strip()
    if "```" in text:
        start = text.index("```") + 3
        end = text.index("```", start)
        return text[start:end].strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return text[start:end + 1].strip()
    return text.strip()
