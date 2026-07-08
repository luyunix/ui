'use client'

import React from 'react'
import {AuthScreen} from '@/components/auth-screen'
import {LeftPanel} from '@/components/left-panel'
import {SidebarProvider} from '@/components/ui/sidebar'
import {AuthProvider, useAuth} from '@/providers/auth-provider'
import {SessionsProvider} from '@/providers/sessions-provider'

function AuthenticatedShell({children}: { children: React.ReactNode }) {
  const {user, loading} = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#f8f8f7] text-zinc-500">加载中...</div>
  }

  if (!user) {
    return <AuthScreen/>
  }

  return (
    <SessionsProvider>
      <SidebarProvider
        style={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          '--sidebar-width': '300px',
          '--sidebar-width-icon': '300px',
        }}
      >
        <LeftPanel/>
        <div className="flex-1 bg-[#f8f8f7] h-screen overflow-hidden">
          {children}
        </div>
      </SidebarProvider>
    </SessionsProvider>
  )
}

export function AppShell({children}: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </AuthProvider>
  )
}
