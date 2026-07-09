'use client'

import {useRouter} from 'next/navigation'
import {Sidebar, SidebarContent, SidebarHeader, SidebarTrigger} from '@/components/ui/sidebar'
import {Button} from '@/components/ui/button'
import {BookOpenText, LogOut, Plus} from 'lucide-react'
import {Kbd, KbdGroup} from '@/components/ui/kbd'
import {SessionList} from '@/components/session-list'
import {FaberSettings} from '@/components/faber-settings'
import {useAuth} from '@/providers/auth-provider'

export function LeftPanel() {
  const router = useRouter()
  const {user, logout} = useAuth()

  return (
    <Sidebar>
      {/* 顶部的切换按钮 */}
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 p-4">
        <SidebarTrigger className="cursor-pointer"/>
        <FaberSettings/>
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
        <Button
          variant="ghost"
          className="cursor-pointer mb-3 w-full justify-start text-zinc-600 hover:text-zinc-900"
          onClick={() => router.push('/principles')}
        >
          <BookOpenText className="size-4"/>
          系统原理
        </Button>
        {/* 会话列表 */}
        <SessionList/>
      </SidebarContent>
      <div className="border-t p-3">
        <div className="mb-2 min-w-0">
          <div className="truncate text-sm font-medium text-zinc-800">{user?.username}</div>
          <div className="truncate text-xs text-zinc-500">{user?.email}</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full cursor-pointer justify-start"
          onClick={logout}
        >
          <LogOut className="size-4"/>
          退出登录
        </Button>
      </div>
    </Sidebar>
  )
}
