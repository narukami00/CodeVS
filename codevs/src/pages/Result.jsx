import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { languageOptions } from '../data/languages'

const mockResult = {
  matchType: 'private',
  language: 'javascript',
  roomId: 'A3X9KP',
  currentUserId: 'player1',
  winnerId: 'player1',
  players: [
    {
      id: 'player1',
      username: 'You',
      avatarText: 'Y',
      wpm: 82,
      accuracy: 96.5,
    },
    {
      id: 'player2',
      username: 'Opponent',
      avatarText: 'O',
      wpm: 74,
      accuracy: 93.2,
    },
  ],
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(1)}%`
}

function StatRow({ label, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-200'
      : tone === 'bad'
        ? 'text-rose-200'
        : 'text-slate-200'

  return (
    <div className="flex items-baseline justify-between gap-4 rounded-xl border border-white/5 bg-slate-950/35 px-4 py-3">
      <div className="font-mono text-xs tracking-widest text-slate-400">
        {label}
      </div>
      <div className={['font-mono text-base', toneClass].join(' ')}>{value}</div>
    </div>
  )
}

function PlayerResultCard({ player, isWinner, isCurrentUser }) {
  const badgeTone = isWinner
    ? 'border-emerald-400/25 text-emerald-200'
    : 'border-white/10 text-slate-200'

  const cardGlow = isWinner
    ? 'ring-1 ring-emerald-400/30 shadow-[var(--shadow-glow)]'
    : 'ring-1 ring-white/5'

  return (
    <article className={['cyber-card relative overflow-hidden p-6 sm:p-7', cardGlow].join(' ')}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(520px_240px_at_50%_0%,var(--color-secondary-soft),transparent_65%)] hover:opacity-100"
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={
              [
                'grid h-11 w-11 place-items-center rounded-full border',
                'border-white/10 bg-slate-950/45 font-mono text-lg text-slate-100',
                isWinner ? 'shadow-[var(--shadow-glow)]' : 'opacity-90',
              ].join(' ')
            }
            aria-hidden="true"
          >
            {player.avatarText}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-semibold text-slate-100">
                {player.username}
              </div>
              {isCurrentUser ? (
                <span className="rounded-full border border-cyan-400/30 bg-slate-950/50 px-2.5 py-1 font-mono text-[10px] tracking-widest text-cyan-300">
                  YOU
                </span>
              ) : null}
            </div>
            <div className="mt-1 font-mono text-xs tracking-widest text-slate-400">
              {isWinner ? 'WINNER' : 'RUNNER-UP'}
            </div>
          </div>
        </div>

        <span
          className={
            [
              'inline-flex items-center rounded-full border px-3 py-1.5',
              'bg-slate-950/50 font-mono text-xs tracking-widest',
              badgeTone,
            ].join(' ')
          }
        >
          {isWinner ? 'VICTORY' : 'DEFEAT'}
        </span>
      </header>

      <div className="relative mt-6 grid gap-3">
        <StatRow label="WPM" value={player.wpm ?? '—'} tone={isWinner ? 'good' : 'neutral'} />
        <StatRow label="ACCURACY" value={formatPercent(player.accuracy)} tone={player.accuracy >= 95 ? 'good' : 'neutral'} />
      </div>
    </article>
  )
}

function Result() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // TODO: Load winner ID from /rooms/{roomId}/winner.
  // TODO: Load player results from /rooms/{roomId}/results/{uid}.
  // TODO: Load language from room resolvedLanguage.
  // TODO: Show Rematch button only for private room matches.
  // TODO: Trigger stat update only through backend API.

  const resolvedMatchType = searchParams.get('matchType') || mockResult.matchType
  const resolvedRoomId = searchParams.get('roomId') || mockResult.roomId
  const resolvedWinnerId = searchParams.get('winnerId') || mockResult.winnerId
  const resolvedCurrentUserId =
    searchParams.get('currentUserId') || mockResult.currentUserId

  const resolvedLanguage =
    searchParams.get('language') || searchParams.get('lang') || mockResult.language

  const languageLabel = useMemo(() => {
    const byValue = languageOptions.find((opt) => opt.value === resolvedLanguage)
    if (byValue) return byValue.label

    const byLabel = languageOptions.find(
      (opt) => opt.label.toLowerCase() === String(resolvedLanguage).toLowerCase(),
    )
    return byLabel?.label || String(resolvedLanguage)
  }, [resolvedLanguage])

  const players = mockResult.players
  const winner = players.find((p) => p.id === resolvedWinnerId) || players[0]
  const currentPlayer =
    players.find((p) => p.id === resolvedCurrentUserId) || players[0]
  const opponent = players.find((p) => p.id !== currentPlayer.id) || players[1]

  const didCurrentUserWin = currentPlayer.id === winner.id
  const showRematch = resolvedMatchType === 'private'

  const title = didCurrentUserWin ? 'Victory Secured' : 'Defeat Logged'
  const headline = didCurrentUserWin ? 'You Win!' : 'You Lose!'
  const headlineTone = didCurrentUserWin
    ? 'text-emerald-300'
    : 'text-rose-300'

  const handleRematch = () => {
    // TODO: Request rematch flow for private rooms.
    console.log('[Result] Request Rematch (placeholder)', { roomId: resolvedRoomId })
  }

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background overlays (grid + scanlines) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-cyan-400/20">
        <div className="cyber-grid absolute inset-0" />
        <div className="cyber-scanlines absolute inset-0" />
        <div className="cyber-vignette absolute inset-0" />
      </div>

      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-10 sm:py-12">
        <div className="cyber-entrance">
          <header className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5">
                  <span className="font-mono text-xs tracking-widest text-slate-200">
                    MATCH RESULTS
                  </span>
                  <span className="h-1 w-1 rounded-full bg-cyan-300/90" />
                  <span className="font-mono text-xs text-slate-300">
                    ROOM: <span className="text-slate-100">{resolvedRoomId}</span>
                  </span>
                  <span className="font-mono text-xs text-slate-300">
                    LANG: <span className="text-cyan-300">{languageLabel}</span>
                  </span>
                  <span className="font-mono text-xs text-slate-300">
                    TYPE: <span className="text-slate-100">{resolvedMatchType}</span>
                  </span>
                </div>

                <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
                  {title}
                  <span className="cyber-cursor ml-2 align-middle" aria-hidden="true">
                    _
                  </span>
                </h1>
                <p className="mt-2 text-sm text-slate-300">Match results are ready.</p>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className={['text-2xl font-bold', headlineTone].join(' ')}>
                  {headline}
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-left">
                  <div className="font-mono text-[10px] tracking-[0.22em] text-slate-400">
                    WINNER
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-100">
                    {winner.username}
                  </div>
                  <div className="mt-1 font-mono text-sm text-cyan-300">
                    {winner.wpm} WPM
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto mt-8 grid w-full max-w-6xl gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <PlayerResultCard
                player={currentPlayer}
                isWinner={currentPlayer.id === winner.id}
                isCurrentUser
              />
              <PlayerResultCard
                player={opponent}
                isWinner={opponent.id === winner.id}
                isCurrentUser={false}
              />
            </div>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-mono text-base font-semibold tracking-wide text-slate-100">
                    MATCH SUMMARY
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-300">
                    Winner is determined by who finishes first.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="cyber-button cyber-button-primary w-full font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 sm:w-auto"
                  >
                    Back to Home
                  </button>

                  {showRematch ? (
                    <button
                      type="button"
                      onClick={handleRematch}
                      className="cyber-button cyber-button-secondary w-full font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 sm:w-auto"
                    >
                      Request Rematch
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <StatRow label="FINAL RESULT" value={didCurrentUserWin ? 'WIN' : 'LOSS'} tone={didCurrentUserWin ? 'good' : 'bad'} />
                <StatRow label="WINNER WPM" value={`${winner.wpm} WPM`} tone="info" />
                <StatRow label="ACCURACIES" value={`${formatPercent(currentPlayer.accuracy)} / ${formatPercent(opponent.accuracy)}`} />
              </div>

              <div className="mt-4 text-xs text-slate-400">
                Rematch is available only for private room matches.
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Result
