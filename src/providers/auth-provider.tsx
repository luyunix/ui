'use client'

import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {toast} from 'sonner'
import {authApi} from '@/lib/api/auth'
import {AUTH_TOKEN_STORAGE_KEY} from '@/lib/api/fetch'
import type {AuthResponse, LoginParams, RegisterParams, UserInfo} from '@/lib/api/types'

type AuthContextValue = {
  user: UserInfo | null
  token: string | null
  loading: boolean
  login: (params: LoginParams) => Promise<void>
  register: (params: RegisterParams) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function persistAuth(auth: AuthResponse) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, auth.access_token)
}

export function AuthProvider({children}: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const storedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (!storedToken) {
      setLoading(false)
      return
    }

    setToken(storedToken)
    try {
      const currentUser = await authApi.me()
      setUser(currentUser)
    } catch {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
      toast.error('登录已失效，请重新登录')
    }

    window.addEventListener('faber:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('faber:unauthorized', handleUnauthorized)
  }, [logout])

  const login = useCallback(async (params: LoginParams) => {
    const auth = await authApi.login(params)
    persistAuth(auth)
    setToken(auth.access_token)
    setUser(auth.user)
  }, [])

  const register = useCallback(async (params: RegisterParams) => {
    const auth = await authApi.register(params)
    persistAuth(auth)
    setToken(auth.access_token)
    setUser(auth.user)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
  }), [user, token, loading, login, register, logout, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
