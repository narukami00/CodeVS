import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function StatBlock({ label, value, subtext }) {
  return (
    <div className="glass-card flex flex-col p-6 border-slate-800/60 bg-slate-900/40 relative overflow-hidden group">
      <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider relative z-10">{label}</div>
      <div className="mt-2 text-4xl font-bold font-mono text-slate-100 relative z-10">{value}</div>
      {subtext && <div className="mt-1 text-xs text-slate-400 relative z-10">{subtext}</div>}
    </div>
  )
}

function Profile() {
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

  if (!user) return null

  // Format creation date
  let joinDateStr = 'Unknown'
  if (user.created_at) {
    const dateObj = user.created_at.toDate ? user.created_at.toDate() : new Date(user.created_at)
    joinDateStr = dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const avgWpm = Math.round(user.average_wpm || 0)
  const gamesPlayed = user.quick_match_count || 0

  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)]">
      {/* Background overlays */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-grid absolute inset-0" />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="animate-entrance flex flex-col gap-6">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Developer Console
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
                System Profile
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Access your platform credentials and monitor performance metrics.
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white text-xs font-semibold px-6 py-2.5 transition-all w-full sm:w-auto cursor-pointer"
            >
              Terminate Session
            </button>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            
            {/* Developer ID Card */}
            <div className="glass-card p-6 flex flex-col border-slate-700/50 relative overflow-hidden bg-slate-950/60">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </div>

              <div className="mb-8">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Auth_ID
                </div>
                <div className="font-mono text-xs text-slate-400 break-all">
                  {user.uid || 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'}
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Handle
                  </div>
                  <div className="text-xl font-bold text-slate-100">
                    {user.username || 'Developer'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Contact_URI
                  </div>
                  <div className="text-sm font-medium text-slate-300">
                    {user.email}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Clearance_Date
                  </div>
                  <div className="text-sm font-medium text-slate-300">
                    {joinDateStr}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Sys_Status
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="flex flex-col gap-6">
              
              <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  </div>
                  <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                    Performance Telemetry
                  </h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <StatBlock 
                    label="Terminal Velocity" 
                    value={avgWpm} 
                    subtext="Average Words Per Minute" 
                  />
                  <StatBlock 
                    label="Execution Count" 
                    value={gamesPlayed} 
                    subtext="Total Matches Played" 
                  />
                </div>
              </div>



            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
