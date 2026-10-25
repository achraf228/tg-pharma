import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { tokenStore } from '../services/api'
import * as authApi from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!tokenStore.get())

  useEffect(() => {
    if (!tokenStore.get()) return
    authApi.fetchMe().then(setUser).catch(() => tokenStore.clear()).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener('tp:unauthorized', onUnauthorized)
    return () => window.removeEventListener('tp:unauthorized', onUnauthorized)
  }, [])

  const signIn = useCallback(async (fn) => {
    const { token, user: u } = await fn()
    tokenStore.set(token)
    setUser(u)
    return u
  }, [])

  const value = useMemo(() => ({
    user, loading,
    isPharmacist: user?.role === 'pharmacien',
    login: (username, password) => signIn(() => authApi.login(username, password)),
    register: (payload) => signIn(() => authApi.register(payload)),
    logout: async () => {
      try { await authApi.logout() } catch { /* session déjà expirée */ }
      tokenStore.clear()
      setUser(null)
    },
  }), [user, loading, signIn])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
