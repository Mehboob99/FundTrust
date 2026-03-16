import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

axios.defaults.withCredentials = true

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('https://fundtrust.onrender.com/api/me').then(r => {
      setUser(r.data.user)
    }).catch(() => {
      setUser(null)
    }).finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const r = await axios.post('/api/login', { email, password })
    setUser(r.data.user)
    return r.data
  }

  const register = async (data) => {
    const r = await axios.post('/api/register', data)
    return r.data
  }

  const logout = async () => {
    await axios.post('/api/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
