import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, authApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      const { access_token, user: userData } = response.data
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      toast({
        title: "Success",
        description: "Logged in successfully!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register({ email, password, name })
      const { access_token, user: userData } = response.data
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      toast({
        title: "Success",
        description: "Account created successfully!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast({
      title: "Success",
      description: "Logged out successfully!",
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 