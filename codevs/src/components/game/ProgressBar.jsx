function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export function ProgressBar({ percent, tone = 'info' }) {
  const clamped = clamp(percent, 0, 100)
  const barTone =
    tone === 'good'
      ? 'bg-emerald-500'
      : 'bg-indigo-500'

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950">
      <div
        className={['h-full transition-[width] duration-300', barTone].join(' ')}
        style={{ width: `${clamped}%` }}
        aria-hidden="true"
      />
    </div>
  )
}
