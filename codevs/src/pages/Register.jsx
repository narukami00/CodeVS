import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    try {
      setError('')
      setLoading(true)
      await register(email, password, username)
      // Navigation is handled declaratively via <Navigate> once user state updates
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create an account')
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
              Create Account
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Join CodeVS to compete with other developers
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
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input bg-slate-950/70 border-slate-800/80 focus:border-indigo-500"
                placeholder="your_username"
                maxLength={30}
                pattern="^[a-zA-Z0-9_]+$"
                title="Alphanumeric and underscores only"
              />
            </div>

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
                minLength={6}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input bg-slate-950/70 border-slate-800/80 focus:border-indigo-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="btn btn-primary mt-3 w-full justify-center py-2.5 font-medium transition-all duration-200"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

