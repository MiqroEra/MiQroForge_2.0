"""Generate Node 示例项目（全局共享、只读）。

示例不落盘到任何用户的 projects 目录，仅由 ProjectService 在列表与读取
路径中合成返回，因此对所有用户可见、且删除/更新/保存会因目录不存在天然失败。
"""

from __future__ import annotations

from typing import Any

DEMO_PROJECT_ID = "demo-generate-node"

DEMO_NAME = "Generate Node"
DEMO_DESCRIPTION = ""
DEMO_ICON = "✨"
DEMO_TS = "2025-01-01T00:00:00+08:00"

DEMO_NODE_DESCRIPTION = ""

DEMO_CANVAS: dict[str, Any] = {
    "meta": {
        "name": DEMO_NAME,
        "description": DEMO_DESCRIPTION,
    },
    "nodes": [
        {
            "id": "nodegen-demo",
            "type": "mfNode",
            "position": {"x": 200, "y": 140},
            "data": {
                "name": "node-generator",
                "version": "\u2014",
                "display_name": "Generate Node",
                "description": "",
                "node_type": "lightweight",
                "category": "node_generator",
                "nodespec_path": "",
                "stream_inputs": [],
                "stream_outputs": [],
                "onboard_inputs": [],
                "onboard_outputs": [],
                "onboard_params": {},
                "node_generator": {
                    "generating": False,
                    "software": "orca",
                    "description": DEMO_NODE_DESCRIPTION,
                },
                "ports": {"inputs": [], "outputs": []},
            },
        },
    ],
    "edges": [],
}


def demo_meta() -> dict[str, Any]:
    return {
        "id": DEMO_PROJECT_ID,
        "name": DEMO_NAME,
        "description": DEMO_DESCRIPTION,
        "icon": DEMO_ICON,
        "created_at": DEMO_TS,
        "updated_at": DEMO_TS,
        "order": -1,
        "canvas_node_count": len(DEMO_CANVAS["nodes"]),
        "run_count": 0,
        "conversation_count": 0,
        "readonly": True,
    }
