'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Sidebar, SidebarContent, SidebarHeader, SidebarTrigger} from '@/components/ui/sidebar'
import {Button} from '@/components/ui/button'
import {Plus, Settings} from 'lucide-react'
import {Kbd, KbdGroup} from '@/components/ui/kbd'
import {SessionList} from '@/components/session-list'
import {SettingsDialog} from '@/components/settings-dialog'

export function LeftPanel() {
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <Sidebar>
      {/* 顶部的切换按钮 */}
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 p-4">
        <SidebarTrigger className="cursor-pointer"/>
        <Button
          variant="outline"
          size="icon-sm"
          className="cursor-pointer"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings/>
        </Button>
      </SidebarHeader>
      {/* 中间内容 */}
      <SidebarContent className="p-2">
        {/* 新建任务 */}
        <Button
          variant="outline"
          className="cursor-pointer mb-3"
          onClick={() => router.push('/')}
        >
          <Plus/>
          新建任务
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
        {/* 会话列表 */}
        <SessionList/>
      </SidebarContent>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen}/>
    </Sidebar>
  )
}
