import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './services/firebase'
import { Login } from './pages/Login'

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
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-2xl font-bold mb-2">
          Olá, {user.displayName}! 👋
        </p>
        <p className="text-slate-400">Login realizado com sucesso.</p>
        <p className="text-slate-500 text-sm mt-2">{user.email}</p>
      </div>
    </div>
  )
}

export default App