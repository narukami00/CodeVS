import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { languageOptions } from '../data/languages'

const mockLobby = {
  roomId: 'A3X9KP',
  language: 'python',
  players: [
    {
      id: 'player1',
      username: 'You',
      label: 'Player 1',
      avatarText: 'Y',
      isCurrentUser: true,
    },
    {
      id: 'player2',
      username: 'Opponent',
      label: 'Player 2',
      avatarText: 'O',
      isCurrentUser: false,
    },
  ],
}

function StatusBadge({ ready }) {
  const label = ready ? 'Ready' : 'Not Ready'
  const tone = ready
    ? 'border-emerald-400/30 text-emerald-300'
    : 'border-white/10 text-slate-300'

  return (
    <span
      className={
        [
          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
          'bg-slate-950/50 font-mono text-xs tracking-widest',
          tone,
        ].join(' ')
      }
    >
      <span
        className={
          [
            'h-1.5 w-1.5 rounded-full',
            ready ? 'bg-emerald-300' : 'bg-slate-500',
          ].join(' ')
        }
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  )
}

function PlayerCard({ player, ready, locked, onToggleReady }) {
  const buttonLabel = locked
    ? ready
      ? 'Ready ✓'
      : 'Not Ready'
    : ready
      ? 'Cancel Ready'
      : 'Ready'

  const buttonTone = ready ? 'cyber-button-secondary' : 'cyber-button-primary'

  return (
    <article
      className="cyber-card group relative overflow-hidden p-6 sm:p-7"
      aria-label={`${player.label} lobby panel`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(480px_220px_at_50%_0%,var(--color-secondary-soft),transparent_65%)] group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs tracking-widest text-slate-400">
              {player.label.toUpperCase()}
            </span>
            {player.isCurrentUser ? (
              <span className="rounded-full border border-cyan-400/30 bg-slate-950/50 px-2.5 py-1 font-mono text-[10px] tracking-widest text-cyan-300">
                YOU
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div
              className={
                [
                  'grid h-12 w-12 place-items-center rounded-full',
                  'border border-white/10 bg-slate-950/40',
                  'font-mono text-lg text-slate-100',
                  ready ? 'shadow-[var(--shadow-glow)]' : 'shadow-none',
                ].join(' ')
              }
              aria-hidden="true"
            >
              {player.avatarText}
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-100">
                {player.username}
              </div>
              <div className="mt-0.5 text-sm text-slate-300">
                Status: <span className="font-mono">{ready ? 'READY' : 'NOT READY'}</span>
              </div>
            </div>
          </div>
        </div>

        <StatusBadge ready={ready} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          disabled={locked}
          onClick={onToggleReady}
          className={
            [
              'cyber-button w-full font-mono text-base',
              buttonTone,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70',
            ].join(' ')
          }
          aria-pressed={ready}
        >
          {buttonLabel}
        </button>

        <div className="rounded-xl border border-white/5 bg-slate-950/35 p-3 text-left">
          <div className="font-mono text-xs tracking-widest text-slate-400">
            READY SIGNAL
          </div>
          <div className="mt-1 text-sm text-slate-300">
            {locked
              ? 'Countdown locked. Await match start.'
              : ready
                ? 'Ready state armed. Waiting for opponent.'
                : 'Press Ready when you are prepared.'}
          </div>
        </div>
      </div>
    </article>
  )
}

function CountdownOverlay({ countdown, isStarting }) {
  const visible = countdown !== null || isStarting
  if (!visible) return null

  const headline = isStarting
    ? 'Starting match...'
    : countdown === 0
      ? 'Start!'
      : 'Match starts in'

  const big = isStarting ? null : countdown === 0 ? 'START' : String(countdown)

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 backdrop-blur"
      role="status"
      aria-live="polite"
    >
      <div className="cyber-card w-full max-w-md p-7 text-center sm:p-8">
        <div className="font-mono text-xs tracking-[0.22em] text-slate-400">
          COUNTDOWN
        </div>
        <div className="mt-3 text-xl font-semibold text-slate-100">
          {headline}
        </div>
        {big ? (
          <div className="glow-text mt-5 font-mono text-6xl font-bold text-cyan-300 sm:text-7xl">
            {big}
          </div>
        ) : (
          <div className="mt-5 font-mono text-sm text-slate-300">
            Loading arena protocols...
          </div>
        )}
        <div className="mt-6 text-sm text-slate-300">
          Don’t leave the lobby — the match is about to begin.
        </div>
      </div>
    </div>
  )
}

function Lobby() {
  const [searchParams] = useSearchParams()

  // TODO: Replace mock lobby data with Firebase room players.
  // TODO: Read roomId from route param (e.g. /room/:roomId/lobby) once routing is added.
  const roomId = searchParams.get('roomId') || mockLobby.roomId
  const languageValue =
    searchParams.get('language') || searchParams.get('lang') || mockLobby.language

  const languageLabel = useMemo(() => {
    return (
      languageOptions.find((opt) => opt.value === languageValue)?.label ||
      languageValue
    )
  }, [languageValue])

  const players = mockLobby.players

  const [readyStates, setReadyStates] = useState(() => ({
    [players[0].id]: false,
    [players[1].id]: false,
  }))
  const [countdown, setCountdown] = useState(null)
  const [isStarting, setIsStarting] = useState(false)

  const bothReady = readyStates[players[0].id] && readyStates[players[1].id]
  const locked = countdown !== null || isStarting

  const handleStartGame = useCallback(() => {
    setIsStarting(true)

    // TODO: Navigate to Game screen when countdown finishes.
    // TODO: Replace local countdown with Firebase serverTimestamp countdownStart.
    console.log('[Lobby] Starting match...', { roomId, language: languageValue })
  }, [roomId, languageValue])

  const handleToggleReady = (playerId) => {
    if (locked) return

    setReadyStates((prev) => {
      const next = {
        ...prev,
        [playerId]: !prev[playerId],
      }

      const nextBothReady = next[players[0].id] && next[players[1].id]
      if (nextBothReady) {
        // Both ready: begin 3-second countdown.
        setCountdown((prevCountdown) => (prevCountdown === null ? 3 : prevCountdown))
      }

      // TODO: Write current user's ready state to /rooms/{roomId}/players/{uid}/ready.
      return next
    })
  }

  // Tick countdown.
  useEffect(() => {
    if (countdown === null || isStarting) return

    if (countdown === 0) {
      const startTimer = window.setTimeout(() => {
        setCountdown(null)
        handleStartGame()
      }, 700)

      return () => window.clearTimeout(startTimer)
    }

    const tickTimer = window.setTimeout(() => {
      setCountdown((prev) => (prev === null ? prev : Math.max(0, prev - 1)))
    }, 1000)

    return () => window.clearTimeout(tickTimer)
  }, [countdown, handleStartGame, isStarting])

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background overlays (grid + scanlines) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-cyan-400/20"
      >
        <div className="cyber-grid absolute inset-0" />
        <div className="cyber-scanlines absolute inset-0" />
        <div className="cyber-vignette absolute inset-0" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-12 sm:py-14">
        <div className="cyber-entrance w-full">
          <header className="mx-auto max-w-3xl text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-950/40 px-4 py-1.5 text-sm text-slate-200 backdrop-blur">
              <span className="font-mono text-cyan-300/90">BATTLE LOBBY</span>
              <span className="h-1 w-1 rounded-full bg-cyan-300/90" />
              <span className="text-slate-300">
                Both players must be ready before the match begins.
              </span>
            </div>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-slate-100 sm:text-6xl">
              Match Lobby
              <span className="cyber-cursor ml-2 align-middle" aria-hidden="true">
                _
              </span>
            </h1>

            <div className="mx-auto mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-left backdrop-blur">
                <div className="font-mono text-xs tracking-widest text-slate-400">
                  SELECTED LANGUAGE
                </div>
                <div className="mt-1 font-mono text-base text-cyan-300">
                  {languageLabel}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-left backdrop-blur">
                <div className="font-mono text-xs tracking-widest text-slate-400">
                  ROOM ID
                </div>
                <div className="mt-1 font-mono text-base text-slate-100">
                  {roomId}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto mt-10 grid w-full max-w-5xl gap-6">
            <div
              className="grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]"
              aria-label="Players ready panel"
            >
              <PlayerCard
                player={players[0]}
                ready={readyStates[players[0].id]}
                locked={locked}
                onToggleReady={() => handleToggleReady(players[0].id)}
              />

              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full border border-cyan-400/30 bg-slate-950/50 px-5 py-2 font-mono text-lg font-semibold tracking-widest text-cyan-300 shadow-[var(--shadow-glow-cyan)]">
                    VS
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    {bothReady
                      ? 'SYNCED: READY'
                      : 'WAITING: READY SIGNALS'}
                  </div>
                </div>
              </div>

              <PlayerCard
                player={players[1]}
                ready={readyStates[players[1].id]}
                locked={locked}
                onToggleReady={() => handleToggleReady(players[1].id)}
              />
            </div>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-mono text-base font-semibold tracking-wide text-slate-100">
                    LOBBY STATUS
                  </h2>
                  <p className="mt-1.5 text-base text-slate-300">
                    {isStarting
                      ? 'Initializing match. Stand by.'
                      : bothReady
                        ? 'Both players are ready. Countdown engaged.'
                        : 'Waiting for both players to press Ready.'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3.5">
                  <div className="text-xs text-slate-400">Signals</div>
                  <div className="mt-1 font-mono text-base text-slate-100">
                    {Object.values(readyStates).filter(Boolean).length}/2 READY
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-slate-950/35 p-4">
                  <div className="font-mono text-xs tracking-widest text-slate-400">
                    READY STATE
                  </div>
                  <div className="mt-1.5 font-mono text-slate-100">
                    {bothReady ? 'ARMED' : 'WAITING'}
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-950/35 p-4">
                  <div className="font-mono text-xs tracking-widest text-slate-400">
                    COUNTDOWN
                  </div>
                  <div className="mt-1.5 font-mono text-slate-100">
                    {countdown === null
                      ? '—'
                      : countdown === 0
                        ? 'START'
                        : `${countdown}s`}
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-950/35 p-4">
                  <div className="font-mono text-xs tracking-widest text-slate-400">
                    SYNC
                  </div>
                  <div className="mt-1.5 font-mono text-slate-100">LOCAL DEMO</div>
                </div>
              </div>

              <div className="mt-5 text-xs text-slate-400">
                TODO: Listen to both players’ ready states from Firebase RTDB at
                <span className="font-mono"> /rooms/{'{roomId}'}/players/{'{uid}'}/ready</span> and trigger countdown from
                <span className="font-mono"> /rooms/{'{roomId}'}/countdownStart</span>.
              </div>
            </section>
          </div>
        </div>
      </div>

      <CountdownOverlay countdown={countdown} isStarting={isStarting} />
    </section>
  )
}

export default Lobby
