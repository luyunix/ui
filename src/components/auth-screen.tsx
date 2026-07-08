'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Loader2, Lock, UserPlus} from 'lucide-react'
import {toast} from 'sonner'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {useAuth} from '@/providers/auth-provider'

type AuthMode = 'login' | 'register'

export function AuthScreen() {
  const router = useRouter()
  const {login, register} = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isRegister = mode === 'register'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isRegister) {
        await register({email, password, username: username || undefined})
        toast.success('注册成功')
      } else {
        await login({email, password})
        toast.success('登录成功')
      }
      router.replace('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '认证失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f7] flex items-center justify-center px-4">
      <section className="w-full max-w-[420px] rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-zinc-900 text-white">
            {isRegister ? <UserPlus className="size-5"/> : <Lock className="size-5"/>}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">{isRegister ? '创建账号' : '登录 Faber'}</h1>
            <p className="text-sm text-zinc-500">继续使用你的行动引擎工作区</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="留空则使用邮箱前缀"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <Button type="submit" className="w-full cursor-pointer" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin"/>}
            {isRegister ? '注册并进入' : '登录'}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-zinc-500">
          {isRegister ? '已有账号？' : '还没有账号？'}
          <button
            type="button"
            className="ml-1 font-medium text-zinc-900 underline-offset-4 hover:underline"
            onClick={() => setMode(isRegister ? 'login' : 'register')}
          >
            {isRegister ? '去登录' : '注册'}
          </button>
        </div>
      </section>
    </main>
  )
}
