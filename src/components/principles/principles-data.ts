import {Boxes, Cable, MonitorDot, Route, ServerCog, Workflow} from 'lucide-react'

export const pipeline = [
  ['前端发起任务', '用户提交目标和附件，前端创建会话并通过 SSE 订阅事件。', Route],
  ['API 编排会话', '后端校验用户、保存消息、创建任务，并把用户消息写入任务输入流。', ServerCog],
  ['Planner 拆解计划', '规划 Agent 将目标拆成步骤，生成 plan 事件供前端展示进度。', Workflow],
  ['ReAct 执行步骤', '执行 Agent 调用浏览器、文件、Shell、搜索、MCP、A2A 等工具。', Boxes],
  ['Sandbox 落地操作', '浏览器与命令在隔离环境中运行，生成文件再由 API 交付。', MonitorDot],
  ['事件实时回放', 'message、plan、step、tool、wait、done 持续进入时间线。', Cable],
] as const

export const taskFlow = [
  ['创建会话', '前端调用 `POST /sessions` 得到 session_id。会话保存当前状态和任务摘要。'],
  ['发送用户消息', '前端调用 `POST /sessions/{id}/chat` 建立 SSE；消息落入 messages，并写入 Redis 任务输入流。'],
  ['创建任务实例', 'AgentService 创建 Sandbox、Browser、AgentTaskRunner 和 RedisStreamTask。'],
  ['Planner 生成计划', 'PlannerAgent 输出 PlanEvent，前端用 plan 事件初始化任务进度。'],
  ['ReAct 执行步骤', 'Flow 取未完成 Step，ReActAgent 循环调用工具并产生执行事件。'],
  ['Step 完成或失败', '后端更新 Step 的状态、结果和附件，并推送 StepEvent。'],
  ['更新计划', 'Planner 根据结果更新后续计划，同时保留已展示的步骤。'],
  ['总结与结束', 'ReAct 输出最终 MessageEvent 和 DoneEvent，会话进入 completed。'],
] as const

export const sessionStates = [
  ['PENDING', '会话空闲或尚未开始。收到用户消息后进入 RUNNING。'],
  ['RUNNING', '任务执行中，前端持续消费 plan、step 和 tool 事件。'],
  ['WAITING', 'Agent 请求用户补充输入，任务暂停等待。'],
  ['COMPLETED', '任务完成、停止或失败，前端结束当前加载状态。'],
] as const

export const flowStates = [
  ['IDLE', 'Flow 初始态或一轮任务结束后的空闲态。'],
  ['PLANNING', '调用 Planner 创建或重新规划步骤。'],
  ['EXECUTING', '取下一个未完成 Step，交给 ReAct 执行。'],
  ['UPDATING', 'Step 完成后，Planner 更新后续步骤。'],
  ['SUMMARIZING', '所有 Step 完成后生成最终总结。'],
  ['COMPLETED', '写入最终事件，并回到 IDLE。'],
] as const

export const eventTypes = [
  ['message', '用户或 Agent 的可见消息，持久化到 messages。'],
  ['plan', '任务步骤列表，创建、更新、完成时都会推送。'],
  ['step', '单个步骤的 running、completed、failed 状态。'],
  ['tool', '工具调用的 calling、called 状态、参数和结果。'],
  ['wait', 'Agent 等待用户补充输入。'],
  ['done', '本轮任务结束，前端停止流式加载。'],
] as const

export const safeguards = [
  '消息和执行事件分表保存，并通过 sequence 恢复原始顺序。',
  '工具调用有统一超时保护，搜索工具还有更短的专用超时。',
  '重规划只更新已有步骤或追加新步骤，不删除已经展示过的进度。',
  'ReAct 从混合 JSON 中提取有效结果，避免提前完成标记打断任务。',
] as const
