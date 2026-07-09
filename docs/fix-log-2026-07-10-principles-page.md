# Fix Log - 2026-07-10 - Principles Page

## Summary

新增面向学习者的前端系统原理讲解页面，帮助深入理解 Faber 的一次任务处理流程、状态机、事件流和模块边界。

## Changes

- 新增 `/principles` 页面。
- 在左侧栏增加「系统原理」入口。
- 页面内容覆盖：
  - 一次任务从创建会话、发送消息、创建任务实例到总结结束的完整流程。
  - 会话状态机：`PENDING`、`RUNNING`、`WAITING`、`COMPLETED`。
  - `PlannerReActFlow` 状态机：`IDLE`、`PLANNING`、`EXECUTING`、`UPDATING`、`SUMMARIZING`、`COMPLETED`。
  - Planner/ReAct/Sandbox 的职责分工。
  - `Session`、`Plan`、`Step`、`ToolEvent` 等关键数据结构。
  - `message`、`plan`、`step`、`tool`、`wait`、`done` 事件如何驱动 UI。
  - 前端如何通过事件归一化恢复时间线、任务进度和工具预览。
  - 工具超时、重规划保留步骤、历史事件兼容、early-complete 解析等稳定性保护。

## Verification

- `npm run lint`: `0 errors, 21 warnings`
- `npm run build`: passed
