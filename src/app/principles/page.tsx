'use client'

import {ArrowRight, Boxes, Brain, Cable, CheckCircle2, Clock3, Database, GitBranch, MonitorDot, Radio, Route, ServerCog, Workflow} from 'lucide-react'
import {SidebarTrigger, useSidebar} from '@/components/ui/sidebar'

const pipeline = [
  {
    title: '前端发起任务',
    body: '用户在输入框提交目标和附件，前端创建会话并通过 SSE 订阅后续事件。',
    icon: Route,
  },
  {
    title: 'API 编排会话',
    body: '后端校验用户、保存消息、创建任务实例，并把用户消息写入任务输入流。',
    icon: ServerCog,
  },
  {
    title: 'Planner 拆解计划',
    body: '规划 Agent 将目标拆成可执行步骤，生成 plan 事件供前端展示任务进度。',
    icon: Workflow,
  },
  {
    title: 'ReAct 执行步骤',
    body: '执行 Agent 逐步调用浏览器、文件、Shell、搜索、MCP、A2A 等工具完成任务。',
    icon: Boxes,
  },
  {
    title: 'Sandbox 落地操作',
    body: '浏览器与命令在隔离环境中运行，生成的文件再通过 API 交付给前端。',
    icon: MonitorDot,
  },
  {
    title: '事件实时回放',
    body: 'message、plan、step、tool、wait、done 等事件持续进入时间线和任务进度面板。',
    icon: Cable,
  },
]

const taskFlow = [
  ['1. 创建会话', '前端调用 `POST /sessions`，得到 session_id。这个会话是后续所有消息、事件、文件、状态的聚合根。'],
  ['2. 发送用户消息', '前端调用 `POST /sessions/{id}/chat` 建立 SSE。后端保存 latest_message，并把 MessageEvent 写入任务输入流。'],
  ['3. 创建任务实例', '如果会话不是 running 或没有 task，AgentService 创建 Sandbox、Browser、AgentTaskRunner 和 RedisStreamTask。'],
  ['4. Planner 生成计划', 'PlannerAgent 输出 PlanEvent，包含 title、goal、steps、success_criteria。前端用 plan 事件初始化任务进度面板。'],
  ['5. ReAct 执行步骤', 'PlannerReActFlow 取第一个未完成 step，ReActAgent 调用工具循环执行，期间持续产生 tool/message 事件。'],
  ['6. Step 完成/失败', 'ReAct 输出结构化 JSON，后端更新 Step.status/result/attachments，并推送 StepEvent。'],
  ['7. 更新计划', 'Planner 根据当前 step 结果更新后续计划；系统保留已展示步骤，避免进度条缩水。'],
  ['8. 总结与结束', '所有步骤完成后 ReAct 汇总，输出最终 MessageEvent 和 DoneEvent，会话进入 completed。'],
]

const states = [
  ['PENDING', '会话空闲或尚未开始。收到用户消息后进入 RUNNING。'],
  ['RUNNING', '任务执行中。前端显示「正在思考中」，并持续消费 plan/step/tool 事件。'],
  ['WAITING', 'Agent 通过 message_ask_user 请求用户补充输入，任务暂停等待。'],
  ['COMPLETED', '任务完成、停止或失败后进入结束态。前端停止当前流式 loading。'],
]

const flowStates = [
  ['IDLE', 'Flow 初始态或一轮任务结束后的空闲态。'],
  ['PLANNING', '调用 Planner 创建或重新规划任务步骤。'],
  ['EXECUTING', '取下一个未完成 Step，交给 ReAct 执行。'],
  ['UPDATING', '一个 Step 完成后，Planner 根据执行结果更新后续步骤。'],
  ['SUMMARIZING', '所有 Step 完成后，ReAct 生成最终总结。'],
  ['COMPLETED', '写入最终 plan/done 事件，并回到 IDLE。'],
]

const eventTypes = [
  ['message', '用户或 Agent 的对话消息，也是新一轮任务的边界。'],
  ['plan', '任务步骤列表，创建、更新、完成时都会推送。'],
  ['step', '单个步骤的 running/completed/failed 状态。'],
  ['tool', '工具调用的 calling/called 状态、参数和结果。'],
  ['wait', 'Agent 等待用户补充输入。'],
  ['done', '本轮任务结束，前端停止流式加载态。'],
]

const safeguards = [
  '工具调用有统一超时保护，搜索工具还有更短的专用超时。',
  '重规划只更新已有步骤或追加新步骤，不删除已经展示过的进度。',
  '历史详情同时兼容 SSE 事件结构和领域事件结构。',
  'ReAct 结果解析会从混合 JSON 中提取有效步骤结果，避免 early-complete 标记打断任务。',
]

export default function PrinciplesPage() {
  const {open, isMobile} = useSidebar()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex flex-shrink-0 items-center gap-3 px-5 py-3">
        {(!open || isMobile) && <SidebarTrigger className="cursor-pointer"/>}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-zinc-800">系统原理</h1>
          <p className="text-sm text-zinc-500">Faber 从任务输入到结果交付的执行链路</p>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="border-y bg-white/55 px-1 py-5">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <Brain className="size-4"/>
                  核心模型
                </div>
                <h2 className="mb-3 text-2xl font-semibold text-zinc-900">计划、执行、观察、修正</h2>
                <p className="max-w-3xl text-sm leading-7 text-zinc-600">
                  Faber 把一次用户请求变成一个可追踪的任务会话。核心不是“问一次答一次”，而是把目标拆成计划、让 Agent 逐步使用工具执行、把每一步产生的事件写入流和数据库，再由前端把这些事件重建成时间线、进度条和最终交付物。
                </p>
              </div>
              <div className="grid content-start gap-3 text-sm text-zinc-600">
                <div className="flex items-start gap-3 rounded-lg border bg-white p-3">
                  <Clock3 className="mt-0.5 size-4 text-zinc-500"/>
                  <span>长任务不会阻塞页面，前端持续消费 SSE 事件。</span>
                </div>
                <div className="flex items-start gap-3 rounded-lg border bg-white p-3">
                  <Database className="mt-0.5 size-4 text-zinc-500"/>
                  <span>事件会落库，刷新页面后可以重新构建时间线和任务进度。</span>
                </div>
                <div className="flex items-start gap-3 rounded-lg border bg-white p-3">
                  <CheckCircle2 className="mt-0.5 size-4 text-zinc-500"/>
                  <span>任务完成后，消息、附件和报告文件一起回到会话中。</span>
                </div>
              </div>
            </div>
          </div>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-800">一次任务的完整处理流程</h2>
            <div className="rounded-lg border bg-white">
              {taskFlow.map(([title, body], index) => (
                <div key={title} className="grid gap-3 border-b px-4 py-4 last:border-b-0 md:grid-cols-[160px_1fr]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                    <span className="flex size-6 items-center justify-center rounded-md bg-zinc-100 text-xs tabular-nums text-zinc-600">{index + 1}</span>
                    {title}
                  </div>
                  <p className="text-sm leading-6 text-zinc-600">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-800">执行链路</h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {pipeline.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-lg border bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                        <Icon className="size-4"/>
                        {item.title}
                      </div>
                      <span className="text-xs tabular-nums text-zinc-400">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="text-sm leading-6 text-zinc-600">{item.body}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-800">
                <GitBranch className="size-4"/>
                会话状态机
              </h2>
              <div className="rounded-lg border bg-white p-4">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-md border px-2 py-1">PENDING</span>
                  <ArrowRight className="size-3"/>
                  <span className="rounded-md border px-2 py-1">RUNNING</span>
                  <ArrowRight className="size-3"/>
                  <span className="rounded-md border px-2 py-1">WAITING / COMPLETED</span>
                </div>
                <div className="grid gap-3">
                  {states.map(([name, body]) => (
                    <div key={name} className="grid gap-2 rounded-md bg-zinc-50 p-3 md:grid-cols-[110px_1fr]">
                      <span className="font-mono text-xs font-semibold text-zinc-700">{name}</span>
                      <span className="text-sm leading-6 text-zinc-600">{body}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-800">
                <Workflow className="size-4"/>
                PlannerReActFlow 状态机
              </h2>
              <div className="rounded-lg border bg-white p-4">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  {flowStates.map(([name], index) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className="rounded-md border px-2 py-1">{name}</span>
                      {index < flowStates.length - 1 && <ArrowRight className="size-3"/>}
                    </div>
                  ))}
                </div>
                <div className="grid gap-3">
                  {flowStates.map(([name, body]) => (
                    <div key={name} className="grid gap-2 rounded-md bg-zinc-50 p-3 md:grid-cols-[120px_1fr]">
                      <span className="font-mono text-xs font-semibold text-zinc-700">{name}</span>
                      <span className="text-sm leading-6 text-zinc-600">{body}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-800">
                <Radio className="size-4"/>
                事件如何驱动界面
              </h2>
              <div className="rounded-lg border bg-white">
                {eventTypes.map(([name, body], index) => (
                  <div key={name} className="flex gap-3 border-b px-4 py-3 last:border-b-0">
                    <span className="w-16 shrink-0 font-mono text-xs text-zinc-500">{name}</span>
                    <span className="text-sm leading-6 text-zinc-600">{body}</span>
                    {index < eventTypes.length - 1 && <ArrowRight className="ml-auto mt-1 size-3 shrink-0 text-zinc-300"/>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-base font-semibold text-zinc-800">关键数据结构</h2>
              <div className="rounded-lg border bg-white p-4">
                <div className="grid gap-4 text-sm leading-6 text-zinc-600">
                  <p><span className="font-mono text-xs font-semibold text-zinc-800">Session</span>：会话聚合根，保存 user_id、sandbox_id、task_id、status、events、files、memories。</p>
                  <p><span className="font-mono text-xs font-semibold text-zinc-800">Plan</span>：任务计划，包含 title、goal、language、steps、status。</p>
                  <p><span className="font-mono text-xs font-semibold text-zinc-800">Step</span>：单个可执行步骤，包含 id、description、success_criteria、status、result、attachments。</p>
                  <p><span className="font-mono text-xs font-semibold text-zinc-800">ToolEvent</span>：工具调用轨迹，包含 tool_call_id、function、args、content、status。</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="mb-3 text-base font-semibold text-zinc-800">前端如何从事件恢复页面</h2>
              <div className="rounded-lg border bg-white p-4">
                <ol className="grid gap-3 text-sm leading-6 text-zinc-600">
                  <li><span className="font-semibold text-zinc-800">归一化：</span>历史接口和 SSE 可能返回不同结构，前端先统一成 type + data。</li>
                  <li><span className="font-semibold text-zinc-800">时间线：</span>message 直接展示，step 聚合 tool，tool 根据 tool_call_id 更新 calling/called。</li>
                  <li><span className="font-semibold text-zinc-800">进度面板：</span>合并 plan 和 step 事件，running 计入当前进度，刷新后也能恢复。</li>
                  <li><span className="font-semibold text-zinc-800">预览面板：</span>浏览器、文件、Shell 等工具结果可以在右侧持续追踪。</li>
                </ol>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-base font-semibold text-zinc-800">稳定性保护</h2>
              <div className="grid gap-3">
                {safeguards.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border bg-white p-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600"/>
                    <span className="text-sm leading-6 text-zinc-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-800">模块边界</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['UI', '会话列表、输入框、时间线、工具预览、任务进度面板。'],
                ['API', '认证、会话、事件映射、AgentService、任务生命周期。'],
                ['Agent Core', 'Planner/ReAct、记忆压缩、工具路由、结果解析。'],
                ['Sandbox', '浏览器、Shell、文件系统、Supervisor 生命周期。'],
              ].map(([name, body]) => (
                <div key={name} className="rounded-lg border bg-white p-4">
                  <div className="mb-2 text-sm font-semibold text-zinc-800">{name}</div>
                  <p className="text-sm leading-6 text-zinc-600">{body}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}
