export function formatPercent(value) {
  if (!Number.isFinite(value)) return '—'
  return `${Math.round(value)}%`
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
