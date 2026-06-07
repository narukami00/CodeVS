import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ref, onValue, set, update, onDisconnect, remove, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { languageOptions } from '../data/languages'

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
  // If player is null (waiting for opponent)
  if (!player) {
    return (
      <article className="cyber-card flex items-center justify-center p-6 sm:p-7 min-h-[250px]">
        <div className="flex flex-col items-center gap-4 opacity-50 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400"></div>
          <div className="font-mono text-sm tracking-widest text-slate-400">WAITING FOR OPPONENT...</div>
        </div>
      </article>
    )
  }

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
                  'font-mono text-lg uppercase text-slate-100',
                  ready ? 'shadow-[var(--shadow-glow)]' : 'shadow-none',
                ].join(' ')
              }
              aria-hidden="true"
            >
              {player.username.charAt(0)}
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
        {player.isCurrentUser ? (
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
        ) : (
          <div className="rounded border border-white/10 bg-slate-950/35 p-3 text-center text-sm text-slate-400">
            Waiting for opponent to signal ready...
          </div>
        )}

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
  const roomId = searchParams.get('roomId')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [roomData, setRoomData] = useState(null)
  const [opponentProfile, setOpponentProfile] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [isStarting, setIsStarting] = useState(false)
  const hasLeftRef = useRef(false)

  // 1. Sync room data
  useEffect(() => {
    if (!user || !roomId) {
      navigate('/')
      return
    }

    const roomRef = ref(db, `rooms/${roomId}`)
    let disconnectRef = null

    // Setup Disconnect Hook ONCE
    const playerRef = ref(db, `rooms/${roomId}/players/${user.uid}`)
    disconnectRef = onDisconnect(playerRef)
    disconnectRef.remove()

    const unsubscribe = onValue(roomRef, async (snap) => {
      const data = snap.val()
      
      if (!data) {
        if (!hasLeftRef.current && !isStarting) {
          hasLeftRef.current = true
          navigate('/')
        }
        return
      }

      const playersList = data.players || {}
      const playerUids = Object.keys(playersList)

      // Ensure we are in this room
      if (!playerUids.includes(user.uid)) {
        if (!hasLeftRef.current && !isStarting) {
           hasLeftRef.current = true
           navigate('/')
        }
        return
      }

      setRoomData(data)

      // Handle opponent disconnect
      if (data.status === 'full' && playerUids.length < 2) {
        hasLeftRef.current = true
        await remove(roomRef) // Clean up the room
        navigate('/')
        return
      }

      // Fetch opponent profile if they joined
      const opponentUid = playerUids.find(uid => uid !== user.uid)
      if (opponentUid) {
        setOpponentProfile(prev => {
          if (prev?.uid === opponentUid) return prev // Avoid state update if already set
          return {
            uid: opponentUid,
            username: "Opponent", // TODO: Fetch real username from Firestore
          }
        })
      }
    })

    return () => {
      unsubscribe()
      if (disconnectRef) {
        disconnectRef.cancel()
      }
    }
  }, [user, roomId, navigate, isStarting])

  const handleLeaveLobby = async () => {
    if (locked || hasLeftRef.current) return
    hasLeftRef.current = true
    
    // Deleting the entire room ensures both players are kicked back to home instantly
    await remove(ref(db, `rooms/${roomId}`))
    navigate('/')
  }

  // Process players for rendering
  const players = useMemo(() => {
    if (!roomData) return []
    const playerArray = []
    
    // Add Self
    playerArray.push({
      id: user.uid,
      username: user.username || user?.email?.split('@')[0] || 'Player',
      label: 'Player 1',
      isCurrentUser: true,
      ready: roomData.players[user.uid]?.ready || false
    })

    // Add Opponent
    if (opponentProfile) {
      playerArray.push({
        id: opponentProfile.uid,
        username: opponentProfile.username || 'Opponent',
        label: 'Player 2',
        isCurrentUser: false,
        ready: roomData.players[opponentProfile.uid]?.ready || false
      })
    } else {
      playerArray.push(null) // Represents waiting for opponent
    }

    return playerArray
  }, [roomData, user, opponentProfile])

  const languageLabel = useMemo(() => {
    if (!roomData) return 'Loading...'
    const val = roomData.resolvedLanguage || roomData.language
    return languageOptions.find((opt) => opt.value === val)?.label || val
  }, [roomData])

  const bothReady = useMemo(() => {
    if (players.length < 2 || !players[0] || !players[1]) return false
    return players[0].ready && players[1].ready
  }, [players])

  const locked = countdown !== null || isStarting || !players[1]

  const handleStartGame = useCallback(async () => {
    setIsStarting(true)
    
    // Update room status to active if we are creator
    if (roomData?.creatorUID === user.uid) {
       await update(ref(db, `rooms/${roomId}`), { status: 'active' })
    }
    
    navigate(`/game?roomId=${roomId}`)
  }, [roomId, navigate, roomData, user])

  const handleToggleReady = async () => {
    if (locked) return
    const currentState = roomData.players[user.uid]?.ready || false
    await update(ref(db, `rooms/${roomId}/players/${user.uid}`), { ready: !currentState })
  }

  // Handle countdown automatically when both ready
  useEffect(() => {
    if (bothReady && countdown === null && !isStarting) {
      if (roomData?.creatorUID === user.uid && !roomData.countdownStart) {
         update(ref(db, `rooms/${roomId}`), { countdownStart: serverTimestamp() })
      }
      setCountdown(3)
    } else if (!bothReady && countdown !== null && !isStarting) {
      setCountdown(null)
      if (roomData?.creatorUID === user.uid && roomData.countdownStart) {
         update(ref(db, `rooms/${roomId}`), { countdownStart: null })
      }
    }
  }, [bothReady, countdown, isStarting, roomId, roomData, user])

  // Tick countdown
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

  if (!roomData) return null

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

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-12 sm:py-14">
        <div className="cyber-entrance w-full">
          
          {/* Action Bar */}
          <div className="mb-8 flex justify-start">
            <button
              onClick={handleLeaveLobby}
              className="group flex items-center gap-2 rounded-full border border-red-500/30 bg-slate-950/50 px-5 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
            >
              <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span> 
              <span className="font-mono tracking-widest">ABORT MATCH</span>
            </button>
          </div>

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
                ready={players[0]?.ready}
                locked={locked}
                onToggleReady={handleToggleReady}
              />

              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full border border-cyan-400/30 bg-slate-950/50 px-5 py-2 font-mono text-lg font-semibold tracking-widest text-cyan-300 shadow-[var(--shadow-glow-cyan)]">
                    VS
                  </div>
                  <div className="font-mono text-xs text-slate-400 text-center">
                    {!players[1] 
                      ? 'WAITING FOR OPPONENT'
                      : bothReady
                        ? 'SYNCED: READY'
                        : 'WAITING: READY SIGNALS'}
                  </div>
                </div>
              </div>

              <PlayerCard
                player={players[1]}
                ready={players[1]?.ready}
                locked={locked}
                onToggleReady={() => {}}
              />
            </div>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-mono text-base font-semibold tracking-wide text-slate-100">
                    LOBBY STATUS
                  </h2>
                  <p className="mt-1.5 text-base text-slate-300">
                    {!players[1]
                      ? 'Waiting for a second player to join...'
                      : isStarting
                        ? 'Initializing match. Stand by.'
                        : bothReady
                          ? 'Both players are ready. Countdown engaged.'
                          : 'Waiting for both players to press Ready.'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3.5">
                  <div className="text-xs text-slate-400">Signals</div>
                  <div className="mt-1 font-mono text-base text-slate-100">
                    {players.filter(p => p?.ready).length}/2 READY
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
                  <div className="mt-1.5 font-mono text-slate-100 text-cyan-300">LIVE</div>
                </div>
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
