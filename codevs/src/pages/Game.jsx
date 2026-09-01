import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ref, onValue, update, onDisconnect, remove } from 'firebase/database'
import { doc, getDoc } from 'firebase/firestore'

import { db, firestore } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { languageOptions } from '../data/languages'
import { useGameEngine } from '../hooks/useGameEngine'

import { PlayerPanel } from '../components/game/PlayerPanel'
import { CompactOpponentCard } from '../components/game/CompactOpponentCard'

const mockSnippet = `function calculateScore(hits, attempts) {
  const accuracy = hits / attempts;
  return Math.round(accuracy * 100);
}`

function Game() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const roomId = searchParams.get('roomId')
  const [roomData, setRoomData] = useState(null)
  const [opponentProfile, setOpponentProfile] = useState(null)
  
  const hasLeftRef = useRef(false)
  const typingRef = useRef(null)
  
  const [gameCountdown, setGameCountdown] = useState(3)

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
        if (!hasLeftRef.current) {
          hasLeftRef.current = true
          navigate('/')
        }
        return
      }

      setRoomData(data)

      const playersList = data.players || {}
      const playerUids = Object.keys(playersList)

      // Ensure we are in this room
      if (!playerUids.includes(user.uid)) {
        if (!hasLeftRef.current) {
           hasLeftRef.current = true
           navigate('/')
        }
        return
      }

      // Handle opponent disconnect (ragequit)
      if (playerUids.length < 2 && !data.winner) {
        // Opponent left, we win by default
        await update(roomRef, { winner: user.uid, reason: 'opponent_disconnected' })
        return
      }

      // Fetch opponent profile if they joined
      const oppUid = playerUids.find(uid => uid !== user.uid)
      if (oppUid) {
        setOpponentProfile(prev => {
          if (prev?.uid === oppUid) return prev
          return { uid: oppUid, username: "Opponent" }
        })
      }
    })

    return () => {
      unsubscribe()
      if (disconnectRef) {
        disconnectRef.cancel()
      }
    }
  }, [user, roomId, navigate])

  const languageValue = roomData?.resolvedLanguage || roomData?.language || searchParams.get('language') || 'javascript'
  const languageLabel = useMemo(() => {
    return languageOptions.find((opt) => opt.value === languageValue)?.label || languageValue
  }, [languageValue])

  const [snippet, setSnippet] = useState(null)

  useEffect(() => {
    if (!roomData?.snippetId) return
    let isMounted = true

    const fetchSnippet = async () => {
      try {
        const snap = await getDoc(doc(firestore, 'snippets', roomData.snippetId))
        if (!isMounted) return
        
        if (snap.exists()) {
          setSnippet(snap.data().code)
        } else {
          setSnippet(mockSnippet)
        }
      } catch (err) {
        console.error("Failed to load snippet:", err)
        if (isMounted) setSnippet(mockSnippet)
      }
    }

    fetchSnippet()
    
    return () => {
      isMounted = false
    }
  }, [roomData?.snippetId])

  // Extract game logic to hook
  const {
    cursorIndex,
    charStates,
    isError,
    wpmValue,
    accuracyValue,
    elapsedLabel,
    currentProgressPercent,
    handleKeyDown,
    rawStats
  } = useGameEngine(snippet, roomId, user, roomData?.winner, gameCountdown !== null)

  // In-Game Local Countdown
  useEffect(() => {
    if (snippet && gameCountdown !== null) {
      if (gameCountdown === 0) {
        const timer = setTimeout(() => {
          setGameCountdown(null)
          typingRef.current?.focus()
        }, 1000)
        return () => clearTimeout(timer)
      }
      
      const timer = setTimeout(() => {
        setGameCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [snippet, gameCountdown])

  const [isFocused, setIsFocused] = useState(false)
  const handleFocusTyping = () => {
    typingRef.current?.focus()
    setIsFocused(true)
  }
  const handleTypingFocus = () => setIsFocused(true)
  const handleTypingBlur = () => setIsFocused(false)

  // Derive opponent progress from Firebase
  const opponentProgressIndex = roomData?.players?.[opponentProfile?.uid]?.progress || 0
  const opponentProgressPercent = snippet ? (opponentProgressIndex / snippet.length) * 100 : 0

  // 2. Handle Game End & Save Stats
  useEffect(() => {
    if (roomData?.winner && !hasLeftRef.current) {
      hasLeftRef.current = true

      const { elapsedSeconds, correctChars, totalKeystrokes, correctKeystrokes } = rawStats

      const minutes = elapsedSeconds / 60
      const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0
      const acc = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 1000) / 10 : 0

      // Write final stats to RTDB
      update(ref(db, `rooms/${roomId}/players/${user.uid}`), {
        stats: { wpm, accuracy: acc }
      }).then(() => {
        navigate(`/result?roomId=${roomId}`)
      }).catch((err) => {
        console.error("Failed to save final stats:", err)
        navigate(`/result?roomId=${roomId}`)
      })
    }
  }, [roomData?.winner, roomId, user, rawStats, navigate])

  const handleExit = async () => {
    if (hasLeftRef.current) return
    hasLeftRef.current = true
    
    // If we exit voluntarily during a game, we are conceding.
    await remove(ref(db, `rooms/${roomId}/players/${user.uid}`))
    navigate('/')
  }

  if (!roomData || !snippet) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-indigo-400">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <div className="text-sm font-semibold text-slate-400">Loading code snippets...</div>
        </div>
      </div>
    )
  }

  const currentPlayer = {
    username: user?.username || user?.email?.split('@')[0] || 'Player',
    avatarText: (user?.username || user?.email || 'P').charAt(0).toUpperCase(),
  }

  const oppPlayer = {
    username: opponentProfile?.username || 'Opponent',
    avatarText: (opponentProfile?.username || 'O').charAt(0).toUpperCase(),
  }

  return (
    <section className="relative isolate">
      {/* Background overlays (grid + vignette) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 sm:py-12 relative z-10">
        <div className="animate-entrance">
          <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/50 px-3.5 py-1 text-xs text-slate-300">
                <span className="font-semibold text-emerald-400">Live Match</span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <span>Language: <span className="text-indigo-400 font-semibold">{languageLabel}</span></span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <span>Room Code: <span className="text-slate-200 font-semibold">{roomId}</span></span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl flex items-center gap-4">
                Typing Challenge
                {gameCountdown !== null && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-mono text-indigo-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    {gameCountdown === 0 ? "GO!" : `Starts in ${gameCountdown}...`}
                  </span>
                )}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Type the correct characters to progress. Cursor only advances on correct key presses.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleExit}
                className="btn text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 sm:w-auto py-2.5 px-4 cursor-pointer"
              >
                Forfeit Match
              </button>
            </div>
          </header>

          <div className="mx-auto mt-8 grid w-full max-w-6xl gap-6">
            <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-[1fr_auto_1fr]">
              <PlayerPanel
                side="current"
                title="YOU"
                player={currentPlayer}
                snippet={snippet}
                progressPercent={currentProgressPercent}
                wpm={wpmValue}
                accuracy={accuracyValue}
                elapsed={elapsedLabel}
                isActive
                isFocused={isFocused}
                onClickFocus={handleFocusTyping}
                onFocus={handleTypingFocus}
                onBlur={handleTypingBlur}
                typingAreaRef={typingRef}
                onKeyDown={handleKeyDown}
                charStates={charStates}
                cursorIndex={cursorIndex}
                opponentProgressIndex={opponentProgressIndex}
                isError={isError}
              />

              <div className="hidden items-center justify-center xl:flex">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 font-mono text-xs font-bold text-slate-400">
                    VS
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    {Math.round(currentProgressPercent)}% / {Math.round(opponentProgressPercent)}%
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <PlayerPanel
                  side="opponent"
                  title="OPPONENT"
                  player={oppPlayer}
                  snippet={snippet}
                  progressPercent={opponentProgressPercent}
                  wpm="—"
                  accuracy="—"
                  elapsed={elapsedLabel}
                  isActive={false}
                  isFocused={false}
                  onClickFocus={undefined}
                  onFocus={undefined}
                  onBlur={undefined}
                  typingAreaRef={undefined}
                  onKeyDown={undefined}
                  charStates={charStates}
                  cursorIndex={cursorIndex}
                  opponentProgressIndex={opponentProgressIndex}
                  isError={false}
                />
              </div>
            </div>

            <div className="md:hidden">
              <CompactOpponentCard
                player={oppPlayer}
                progressPercent={opponentProgressPercent}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Game
