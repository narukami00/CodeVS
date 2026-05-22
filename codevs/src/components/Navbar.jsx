import { NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-cyan-400 text-slate-950'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ')

function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 text-slate-100">
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <NavLink to="/" className="text-lg font-bold tracking-wide">
          CodeVS
        </NavLink>
        <div className="flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>
            Leaderboard
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
