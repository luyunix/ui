import {ArrowRight, GitBranch, Workflow} from 'lucide-react'
import {flowStates, sessionStates} from './principles-data'

function StateCard({title, states}: {title: string; states: ReadonlyArray<readonly [string, string]>}) {
  return <div><h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-800">{title === '会话状态机' ? <GitBranch className="size-4"/> : <Workflow className="size-4"/>}{title}</h2><div className="rounded-lg border bg-white p-4"><div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">{states.map(([name], index) => <div key={name} className="flex items-center gap-2"><span className="rounded-md border px-2 py-1">{name}</span>{index < states.length - 1 && <ArrowRight className="size-3"/>}</div>)}</div><div className="grid gap-3">{states.map(([name, body]) => <div key={name} className="grid gap-2 rounded-md bg-zinc-50 p-3 md:grid-cols-[120px_1fr]"><span className="font-mono text-xs font-semibold text-zinc-700">{name}</span><span className="text-sm leading-6 text-zinc-600">{body}</span></div>)}</div></div></div>
}

export function PrinciplesStateMachines() {
  return <section className="grid gap-5 xl:grid-cols-2"><StateCard title="会话状态机" states={sessionStates}/><StateCard title="PlannerReActFlow 状态机" states={flowStates}/></section>
}
