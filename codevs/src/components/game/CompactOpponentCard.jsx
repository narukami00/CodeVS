import { ProgressBar } from './ProgressBar'
import { formatPercent } from '../../utils/formatters'

export function CompactOpponentCard({ player, progressPercent }) {
  return (
    <section className="glass-card relative overflow-hidden p-4 sm:p-5" aria-label="Opponent progress">
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wider">OPPONENT</div>
          <div className="mt-0.5 text-base font-semibold text-slate-200">{player.username}</div>
          <div className="mt-1 text-xs text-slate-400">
            Progress <span className="text-indigo-400 font-semibold">{formatPercent(progressPercent)}</span>
          </div>
        </div>

        <div
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-800 bg-slate-950 font-semibold text-sm text-slate-300"
          aria-hidden="true"
        >
          {Math.round(progressPercent)}%
        </div>
      </div>

      <div className="relative mt-4">
        <ProgressBar percent={progressPercent} tone="info" />
      </div>
    </section>
  )
}
