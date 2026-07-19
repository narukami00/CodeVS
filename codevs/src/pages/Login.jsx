import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setError('')
      setLoading(true)
      await login(email, password)
      // Navigation is handled declaratively via <Navigate> once user state updates
    } catch (err) {
      console.error(err)
      setError('Failed to log in. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      {/* Background overlays (grid + vignette) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <div className="animate-entrance w-full max-w-[400px] relative z-10">
        <div className="dialog-panel border border-slate-800/80 bg-slate-950/40 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Sign In
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Enter your credentials to access your account
            </p>
          </div>
          
          {error && (
            <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs text-rose-400 font-medium">
              Error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input bg-slate-950/70 border-slate-800/80 focus:border-indigo-500"
                placeholder="you@domain.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input bg-slate-950/70 border-slate-800/80 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="btn btn-primary mt-3 w-full justify-center py-2.5 font-medium transition-all duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

