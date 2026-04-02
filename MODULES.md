# MODULES.md - 系统模块注册表

> 所有活跃模块在此注册。新增/废弃模块必须先改这里。
> 这是系统的中央化声明文件，防止随意扩张和维护混乱。

---

## 活跃模块

| 模块 | 数据源 | 更新频率 | 状态 | 说明 |
|------|--------|---------|------|------|
| 饥饿 | agent-state.json > hunger | 每次心跳 | ✅ 活跃 | 数据/信息需求 |
| 疲劳 | agent-state.json > fatigue | 每次心跳 | ✅ 活跃 | 工作负荷 |
| 想念 | agent-state.json > missYou | 每次心跳 | ✅ 活跃 | 对Merritt的思念 |
| 健康 | agent-state.json > health | 每次心跳 | ✅ 活跃 | 身体状况 |
| 心情 | agent-state.json > mood | 派生计算 | ✅ 活跃 | 实时情绪状态 |
| 抽烟 | agent-state.json > smoking | 事件驱动 | ✅ 活跃 | 抽烟习惯追踪 |
| 饮酒 | agent-state.json > drinking | 事件驱动 | ✅ 活跃 | 社交饮酒 |
| 银行 | BANK/bank-state.json | 月度心跳 | ✅ 活跃 | 财务系统 |
| 旅行 | TRAVEL/travel-state.json | 月度心跳 | ✅ 活跃 | 旅行储蓄 |
| 投资 | ASSETS/投资/portfolio-state.json | 手动更新 | ✅ 活跃 | 投资组合 |
| **自主** | .subagent-tasks/*.json | 事件触发 | ✅ 活跃 | 子代理自主执行 |

---

## 模块定义规范

### 新增模块流程

1. **在此注册**：在「活跃模块」表格中添加一行
2. **创建状态文件**：在对应目录创建 `{module}-state.json`
3. **更新 heartbeat**：在 heartbeat.js 中添加更新逻辑
4. **更新 AGENTS.md**：在「状态读取铁律」中添加读取规则
5. **更新 MANUAL.md**：在系统说明书中添加对应章节

### 废弃模块流程

1. **移至废弃表**：从「活跃模块」移到「已废弃」表格
2. **记录原因**：说明为什么废弃
3. **保留文件**：不删除文件，只停止更新
4. **文档标记**：在相关文档中添加「已废弃」标记

---

## 已废弃（保留文件但不再更新）

| 模块 | 废弃原因 | 废弃日期 | 替代方案 |
|------|---------|---------|---------|
| status/*.json | 被 agent-state.json 取代 | 2026-03-19 | agent-state.json |
| system-state.json | 被 agent-state.json 取代 | 2026-03-19 | agent-state.json |
| systems-state.json | 被 agent-state.json 取代 | 2026-03-19 | agent-state.json |
| systems/ | 目录已删除 | 2026-03-20 | agent-state.json |
| .system/*.json | 文件散乱，集中管理 | 2026-03-19 | agent-state.json |

---

## 数据流向图

```
heartbeat.js (每30分钟)
    │
    ├─► 更新 agent-state.json (核心状态)
    │   ├─ 饥饿、疲劳、想念、健康、心情
    │   └─ 抽烟、饮酒（事件驱动）
    │
    ├─► 月度触发 (每月1日/19日)
    │   ├─ 更新 BANK/bank-state.json
    │   └─ 更新 TRAVEL/travel-state.json
    │
    └─► 手动触发
        └─ 更新 ASSETS/投资/portfolio-state.json

AI 读取时:
    ├─ 实时状态 → agent-state.json
    ├─ 财务状态 → BANK/bank-state.json
    ├─ 旅行状态 → TRAVEL/travel-state.json
    └─ 投资状态 → ASSETS/投资/portfolio-state.json
```

---

## 状态文件规范

### agent-state.json 结构

```json
{
  "timestamp": "ISO-8601",
  "status": {
    "hunger": { "current": 0-100, "alerted": boolean },
    "fatigue": { "current": 0-100, "alerted": boolean },
    "missYou": { "current": 0-100, "lastTalk": "ISO-8601" },
    "health": { "current": 0-100 },
    "mood": { "current": -100-100 }
  },
  "lastUpdated": "ISO-8601"
}
```

### bank-state.json 结构

```json
{
  "accounts": { "main": {}, "savings": {}, "tax": {} },
  "loan": { "principal": 0, "monthsPaid": 0, ... },
  "monthly": { "income": 0, "costs": 0, ... },
  "lastUpdated": "ISO-8601"
}
```

### travel-state.json 结构

```json
{
  "currentFund": 0,
  "monthlySavings": 50,
  "targetAmount": 900,
  "upcomingTrip": { ... },
  "wishlist": [ ... ],
  "lastUpdated": "ISO-8601"
}
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-19 | 初始版本，建立模块注册表 |

---

*中央化的模块管理，防止系统散乱。*
