import React from 'react'
import type {Metadata} from 'next'
import {Toaster} from '@/components/ui/sonner'
import './globals.css'
import {AppShell} from '@/components/app-shell'

export const metadata: Metadata = {
  title: 'Faber',
  description: 'Faber 是一个行动引擎，它超越了答案的范畴，可以执行任务、自动化工作流程，并扩展您的能力。',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout(
  {
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>,
) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
    <body className="h-screen overflow-hidden">
    <AppShell>{children}</AppShell>
    <Toaster position="top-center" richColors/>
    </body>
    </html>
  )
}
