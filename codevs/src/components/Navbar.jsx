import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navLinkClass = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-cyan-400 text-slate-950'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ')

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Failed to log out', err)
    }
  }

  return (
    <header className="h-16 border-b border-white/5 bg-[var(--color-bg)] text-[var(--color-text)]">
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <NavLink to="/" className="text-lg font-bold tracking-wide">
          CodeVS
        </NavLink>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/" className={navLinkClass}>
                Play
              </NavLink>
              <NavLink to="/leaderboard" className={navLinkClass}>
                Leaderboard
              </NavLink>
              {/* <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink> */}
              <div className="hidden sm:flex flex-col items-end ml-4 mr-2 pr-4 border-r border-slate-700">
                <span className="text-sm font-bold text-cyan-300">{user.username || 'Operative'}</span>
                <span className="text-xs font-mono text-slate-400">WPM: {user.average_wpm || 0}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/leaderboard" className={navLinkClass}>
                Leaderboard
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
