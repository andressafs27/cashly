import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { Toaster } from 'sonner'
import { auth } from '@/services/firebase'
import { Login } from '@/pages/Login'
import { router } from './router'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </>
  )
}

export default App