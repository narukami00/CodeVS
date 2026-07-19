export function StatPill({ label, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-500/20 text-emerald-400'
      : tone === 'info'
        ? 'border-indigo-500/20 text-indigo-400'
        : 'border-slate-800 text-slate-300'

  return (
    <div className={['rounded-xl border bg-slate-900/35 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm', tone === 'good' ? 'shadow-sm' : tone === 'info' ? 'shadow-sm' : ''].join(' ')}>
      <div className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
        {label}
      </div>
      <div className={['mt-0.5 font-mono text-xs sm:text-sm font-bold', toneClass].join(' ')}>
        {value}
      </div>
    </div>
  )
}
