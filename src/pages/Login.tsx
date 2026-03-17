import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'

export function Login() {
  async function handleGoogleLogin() {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Erro ao fazer login:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex">

      {/* Lado esquerdo — visual */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#1B4FDE] to-[#0F172A]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <span className="text-white text-2xl font-bold tracking-tight">Cashly</span>
        </div>

        <div>
          <h1 className="text-white text-5xl font-bold leading-tight mb-6">
            Controle seu<br />
            dinheiro com<br />
            <span className="text-[#00C48C]">inteligência.</span>
          </h1>
          <p className="text-slate-300 text-lg">
            Visualize gastos, defina metas e acompanhe<br />
            sua evolução financeira em um só lugar.
          </p>
        </div>

        {/* Cards decorativos */}
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 flex-1">
            <p className="text-slate-400 text-sm mb-1">Saldo do mês</p>
            <p className="text-white text-2xl font-bold">R$ 4.250,00</p>
            <p className="text-[#00C48C] text-sm mt-1">↑ 12% vs mês anterior</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 flex-1">
            <p className="text-slate-400 text-sm mb-1">Meta atingida</p>
            <p className="text-white text-2xl font-bold">78%</p>
            <p className="text-[#00C48C] text-sm mt-1">↑ Viagem Europa</p>
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <span className="text-3xl">💰</span>
            <span className="text-white text-2xl font-bold">Cashly</span>
          </div>

          <h2 className="text-white text-4xl font-bold mb-2">Bem-vindo</h2>
          <p className="text-slate-400 text-base mb-10">
            Faça login para acessar seu painel financeiro
          </p>

          {/* Botão Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          <p className="text-slate-600 text-center text-sm mt-8">
            Ao entrar, você concorda com os{' '}
            <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">
              Termos de Uso
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}