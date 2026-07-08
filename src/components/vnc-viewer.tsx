'use client'

import { useEffect, useRef, useState } from 'react'
import RFB from '@novnc/novnc/lib/rfb'

export type VNCStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface VNCViewerProps {
  url: string
  viewOnly?: boolean
  onStatusChange?: (status: VNCStatus, detail?: string) => void
  reconnect?: boolean
}

export function VNCViewer({ url, viewOnly, onStatusChange, reconnect = true }: VNCViewerProps) {
  const displayRef = useRef<HTMLDivElement>(null)
  const onStatusChangeRef = useRef(onStatusChange)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  useEffect(() => {
    if (!displayRef.current) return

    onStatusChangeRef.current?.('connecting')

    let rfb: RFB | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let disposed = false

    const scheduleReconnect = (detail: string) => {
      if (!reconnect || disposed || attempt >= 3) {
        onStatusChangeRef.current?.('error', detail)
        return
      }

      onStatusChangeRef.current?.('connecting')
      retryTimer = setTimeout(() => {
        if (!disposed) setAttempt((n) => n + 1)
      }, 800 + attempt * 600)
    }

    try {
      rfb = new RFB(displayRef.current, url, {
        credentials: { password: '', username: '', target: '' },
      })

      rfb.viewOnly = viewOnly || false
      rfb.scaleViewport = true
      rfb.background = '#000'

      rfb.addEventListener('connect', () => onStatusChangeRef.current?.('connected'))
      rfb.addEventListener('disconnect', (e: CustomEvent) => {
        if (disposed) return
        if (e.detail?.clean) {
          onStatusChangeRef.current?.('disconnected', '连接已断开')
        } else {
          scheduleReconnect('沙箱环境可能已关闭或连接异常断开')
        }
      })
      rfb.addEventListener('securityfailure', () => {
        onStatusChangeRef.current?.('error', '认证失败，无法连接到沙箱')
      })
    } catch {
      scheduleReconnect('无法建立连接，沙箱环境可能未启动')
    }

    return () => {
      disposed = true
      if (retryTimer) clearTimeout(retryTimer)
      try { rfb?.disconnect() } catch { /* noop */ }
    }
  }, [url, viewOnly, reconnect, attempt])

  return (
    <div
      ref={displayRef}
      style={{ width: '100%', height: '100%', background: '#000' }}
    />
  )
}
