import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ref, onValue, set, update, onDisconnect, remove, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { languageOptions } from '../data/languages'
import { getRandomSnippetId } from '../data/snippetBank'

function StatusBadge({ ready }) {
  const label = ready ? 'Ready' : 'Waiting'
  const tone = ready
    ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
    : 'border-slate-800 text-slate-400 bg-slate-900/30'

  return (
    <span
      className={
        [
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold',
          tone,
        ].join(' ')
      }
    >
      <span
        className={
          [
            'h-1.5 w-1.5 rounded-full',
            ready ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500',
          ].join(' ')
        }
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  )
}

function PlayerCard({ player, ready, locked, onToggleReady }) {
  if (!player) {
    return (
      <article className="glass-card flex items-center justify-center p-6 sm:p-7 min-h-[250px] border-dashed border-slate-800 bg-slate-950/20">
        <div className="flex flex-col items-center gap-3 opacity-60 text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500"></div>
          <div className="text-xs text-slate-400 font-medium">Waiting for opponent to connect...</div>
        </div>
      </article>
    )
  }

  const buttonLabel = ready ? 'Cancel Ready' : 'I am Ready'

  const cardBorder = ready 
    ? 'border-emerald-500/20 bg-slate-900/10 shadow-sm' 
    : 'border-slate-800 bg-slate-950/20'

  return (
    <article
      className={['glass-card group relative overflow-hidden p-6 sm:p-7 min-h-[250px] transition-all duration-300', cardBorder].join(' ')}
      aria-label={`${player.label} panel`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {player.label}
            </span>
            {player.isCurrentUser ? (
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-0.5 text-[9px] font-semibold text-indigo-400 tracking-wider">
                You
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div
              className={
                [
                  'grid h-12 w-12 place-items-center rounded-full',
                  'border bg-slate-900 font-semibold text-base text-slate-200',
                  ready ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-slate-800',
                ].join(' ')
              }
              aria-hidden="true"
            >
              {player.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-base font-semibold text-slate-100">
                {player.username}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 font-mono">
                ID: <span className="text-slate-400">{player.id.substring(0, 8)}</span>
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
                'btn w-full text-xs font-semibold cursor-pointer py-2.5 transition-all duration-200',
                ready 
                  ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' 
                  : 'btn-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
              ].join(' ')
            }
            aria-pressed={ready}
          >
            {buttonLabel}
          </button>
        ) : (
          <div className="rounded-lg border border-slate-850 bg-slate-900/15 py-2.5 text-center text-xs text-slate-500 font-medium">
            Awaiting opponent action...
          </div>
        )}

        <div className="rounded-lg border border-slate-900 bg-slate-950/15 p-3 text-left">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Status Message
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {locked
              ? 'Handshake completed. Loading game.'
              : ready
                ? 'Ready. Waiting for opponent.'
                : 'Click the button above to signal you are ready.'}
          </div>
        </div>
      </div>
    </article>
  )
}



function Lobby() {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('roomId')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [roomData, setRoomData] = useState(null)
  const [opponentProfile, setOpponentProfile] = useState(null)
  const [isStarting, setIsStarting] = useState(false)
  const hasLeftRef = useRef(false)
  const isFetchingSnippetRef = useRef(false)

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
            username: "Opponent", // Fetch fallback or sync later
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
      ready: roomData.players?.[user.uid]?.ready || false
    })

    // Add Opponent
    if (opponentProfile) {
      playerArray.push({
        id: opponentProfile.uid,
        username: opponentProfile.username || 'Opponent',
        label: 'Player 2',
        isCurrentUser: false,
        ready: roomData.players?.[opponentProfile.uid]?.ready || false
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

  const locked = isStarting || !players[1]

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
    const currentState = roomData.players?.[user.uid]?.ready || false
    await update(ref(db, `rooms/${roomId}/players/${user.uid}`), { ready: !currentState })
  }

  // Handle transition automatically when both ready
  useEffect(() => {
    if (bothReady && !isStarting) {
      if (roomData?.creatorUID === user.uid && !roomData.countdownStart) {
         if (isFetchingSnippetRef.current) return
         isFetchingSnippetRef.current = true

         const assignSnippetAndStart = async () => {
            try {
               const lang = roomData.resolvedLanguage || roomData.language || 'javascript'
               const randomSnippetId = await getRandomSnippetId(lang)
               await update(ref(db, `rooms/${roomId}`), { 
                  countdownStart: serverTimestamp(),
                  snippetId: randomSnippetId || null
               })
            } finally {
               isFetchingSnippetRef.current = false
            }
         }
         assignSnippetAndStart()
      }
      
      // If snippet and timestamp exist, transition to game
      if (roomData?.countdownStart && roomData?.snippetId) {
         handleStartGame()
      }
    }
  }, [bothReady, isStarting, roomId, roomData, user, handleStartGame])

  // Ghost Lobby Timeout for Quick Matches
  useEffect(() => {
    if (roomData?.matchType === 'quickmatch' && !opponentProfile && !isStarting) {
      const timer = window.setTimeout(async () => {
        if (!hasLeftRef.current) {
           hasLeftRef.current = true
           await remove(ref(db, `rooms/${roomId}`))
           alert("Opponent failed to connect. Returning to home.")
           navigate('/')
        }
      }, 15000)
      return () => window.clearTimeout(timer)
    }
  }, [roomData?.matchType, opponentProfile, isStarting, roomId, navigate])

  if (!roomData) return null

  return (
    <section className="relative isolate">
      {/* Background overlays (grid + vignette) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-8 sm:py-12">
        <div className="animate-entrance w-full">
          
          {/* Action Bar */}
          <div className="mb-6 flex justify-start">
            <button
              onClick={handleLeaveLobby}
              className="group flex items-center gap-2 rounded-lg border border-rose-500/20 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
            >
              <span aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">←</span> 
              <span>Leave Lobby</span>
            </button>
          </div>

          <header className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/40 px-4 py-1.5 text-xs text-slate-300 backdrop-blur font-medium">
              <span>Match Lobby</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span className="text-slate-400">
                Both players must be ready before the match begins.
              </span>
            </div>

            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
              Match Lobby
            </h1>

            <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-left backdrop-blur">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Language Context
                </div>
                <div className="mt-1 font-mono text-base font-semibold text-indigo-400">
                  {languageLabel}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-left backdrop-blur">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Lobby Room Code
                </div>
                <div className="mt-1 font-mono text-base font-semibold text-slate-200">
                  {roomId}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto mt-10 grid w-full max-w-4xl gap-6">
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
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 font-mono text-sm font-bold text-slate-300">
                    VS
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 text-center">
                    {!players[1] 
                      ? 'WAITING ON PEER'
                      : bothReady
                        ? 'SYNC READY'
                        : 'PENDING ACTION'}
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

            <section className="rounded-2xl border border-slate-800 bg-slate-950/30 p-6 backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
                    Match Status
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {!players[1]
                      ? 'Waiting for an opponent to join...'
                      : isStarting
                        ? 'Initializing match. Preparing playground...'
                        : bothReady
                          ? 'All players ready. Initiating countdown...'
                          : 'Awaiting readiness from both developers.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Ready count</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-slate-200">
                    {players.filter(p => p?.ready).length}/2 READY
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800/40 bg-slate-950/20 p-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="mt-1 font-semibold text-slate-300">
                    {bothReady ? 'Ready' : 'Pending'}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800/40 bg-slate-950/20 p-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Players
                  </div>
                  <div className="mt-1 font-mono font-semibold text-slate-300">
                    {players.length}/2 Joined
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800/40 bg-slate-950/20 p-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Connection
                  </div>
                  <div className="mt-1 font-semibold text-emerald-400">Synced</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

    </section>
  )
}

export default Lobby
