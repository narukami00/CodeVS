import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navLinkClass = ({ isActive }) =>
  [
    'relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-slate-800 text-white shadow-sm'
      : 'text-slate-400 hover:bg-slate-900/60 hover:text-white',
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
    <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md text-[var(--color-text)] relative z-50">
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="text-xl font-bold tracking-tight flex items-center gap-1">
            <span className="text-violet-500 font-mono font-semibold opacity-80">&lt;</span>
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-cyan-300 transition-all duration-300">CodeVS</span>
            <span className="text-violet-500 font-mono font-semibold opacity-80">/&gt;</span>
          </div>
        </NavLink>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/leaderboard" className={navLinkClass}>
                Leaderboard
              </NavLink>
              <NavLink to="/profile" className={navLinkClass + " sm:hidden"}>
                Profile
              </NavLink>
              
              <NavLink to="/profile" className="hidden sm:flex flex-col items-end ml-4 mr-2 pr-4 border-r border-slate-800/80 group">
                <span className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{user.username || 'User'}</span>
                <span className="text-[11px] text-slate-400">Avg WPM: <span className="text-indigo-400 font-bold font-mono">{Math.round(user.average_wpm || 0)}</span></span>
              </NavLink>
              
              <button
                onClick={handleLogout}
                className="text-xs font-semibold rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2 text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
              >
                Log Out
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
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar

