'use client'

import {PrinciplesEventsStorage} from '@/components/principles/principles-events-storage'
import {PrinciplesOverview} from '@/components/principles/principles-overview'
import {PrinciplesRecovery} from '@/components/principles/principles-recovery'
import {PrinciplesStateMachines} from '@/components/principles/principles-state-machines'
import {SidebarTrigger, useSidebar} from '@/components/ui/sidebar'

export default function PrinciplesPage() {
  const {open, isMobile} = useSidebar()

  return <div className="flex h-full flex-col overflow-hidden">
    <header className="flex flex-shrink-0 items-center gap-3 px-5 py-3">
      {(!open || isMobile) && <SidebarTrigger className="cursor-pointer"/>}
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-zinc-800">系统原理</h1>
        <p className="text-sm text-zinc-500">Faber 从任务输入到结果交付的执行链路</p>
      </div>
    </header>
    <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PrinciplesOverview/>
        <PrinciplesStateMachines/>
        <PrinciplesEventsStorage/>
        <PrinciplesRecovery/>
      </div>
    </main>
  </div>
}
