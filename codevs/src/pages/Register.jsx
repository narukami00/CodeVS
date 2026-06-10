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
    <div className="flex h-full min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="cyber-panel w-full max-w-md p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-white text-shadow-glow">
          NEW OPERATIVE
        </h2>
        
        {error && (
          <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cyber-input"
              placeholder="hacker@codevs.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="cyber-input"
              placeholder="neo"
              maxLength={30}
              pattern="^[a-zA-Z0-9_]+$"
              title="Alphanumeric and underscores only"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cyber-input"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="cyber-input"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="cyber-button cyber-button-primary mt-4 w-full justify-center"
          >
            {loading ? 'REGISTERING...' : 'ESTABLISH LINK'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an access code?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  )
}
