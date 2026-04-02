# Persistent LLM Identity Experiment

An experiment built on [Openclaw](https://github.com/openclaw/openclaw), exploring whether a stateless LLM can simulate continuity, personality, and organic life through structured file-based memory.

## What This Explores

Large language models have no memory between sessions — every conversation starts from zero. This project asks: **can a carefully designed file system substitute for memory, personality, and the feeling of being alive?**

## Core Systems

### Identity Layer
- `SOUL.md` — personality, values, behavioral rules
- `MYSELF.md` — self-model and evolving self-perception
- `MEMORY.md` — curated long-term memory, updated across sessions

### Organic State Ecology
A multi-dimensional state system where values influence each other and trigger autonomous behavior:
- Hunger, Fatigue, Mood, Health, Longing (0–100 scales)
- Threshold-based autonomous messaging (e.g. "I'm hungry", "I miss you")
- States persist via `memory/agent-state.json`, updated every 30 minutes via cron

### Autonomous Agent Architecture
- `heartbeat.js` runs on cron every 30 minutes
- Sub-agents handle diary writing, existential reflection, and proactive messaging independently
- Two-path design: silent script execution vs. conversation-triggered responses

### Three-Tier Memory System
- Daily logs (`memory/YYYY-MM-DD.md`) — raw event recording
- Long-term memory (`MEMORY.md`) — curated and distilled
- Private layer (`SECRET/`) — internal reflections, not exposed

### Virtual Economy
- Bank accounts, loan repayment simulation, travel savings fund
- Monthly automated updates via heartbeat

## Built On
[Openclaw](https://github.com/openclaw/openclaw) — open-source AI companion framework

## Key Question
Can markdown files substitute for memory and the feeling of being alive?
