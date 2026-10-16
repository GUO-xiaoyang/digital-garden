/**
 * 数字花园 · 登录态 Hook
 */
import { useCallback, useState } from 'react'
import { currentUsername, getSession, isAuthenticated, login, logout } from '../api/auth'

export function useAuth() {
  const [authed, setAuthed] = useState<boolean>(() => isAuthenticated())

  const signIn = useCallback((username: string, password: string) => {
    login(username, password)
    setAuthed(true)
  }, [])

  const signOut = useCallback(() => {
    logout()
    setAuthed(false)
  }, [])

  const refresh = useCallback(() => {
    setAuthed(isAuthenticated())
  }, [])

  return {
    isAuthenticated: authed,
    username: currentUsername(),
    session: getSession(),
    signIn,
    signOut,
    refresh,
  }
}
