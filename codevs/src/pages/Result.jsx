import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ref, get, onValue, update } from 'firebase/database'
import { doc, runTransaction } from 'firebase/firestore'
import { db, firestore } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { languageOptions } from '../data/languages'

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
  const { user } = useAuth()
  
  const roomId = searchParams.get('roomId')
  
  const [roomData, setRoomData] = useState(null)
  const [opponentProfile, setOpponentProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rematchRequested, setRematchRequested] = useState(false)
  const [opponentRematchRequested, setOpponentRematchRequested] = useState(false)
  
  const leaderboardUpdatedRef = useRef(false)
  const hasLoadedWinnerRef = useRef(false)

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/')
      return
    }

    const roomRef = ref(db, `rooms/${roomId}`)
    const unsubscribe = onValue(roomRef, async (snap) => {
      if (!snap.exists()) {
        navigate('/')
        return
      }

      const data = snap.val()
      
      // DETECT ROOM RESET (Rematch Triggered)
      // If we previously loaded a winner, but now data.winner is gone, 
      // it means the room was successfully wiped for a rematch!
      if (hasLoadedWinnerRef.current && !data.winner) {
        navigate(`/lobby?roomId=${roomId}`)
        return
      }

      setRoomData(data)

      const playerUids = Object.keys(data.players || {})
      const oppUid = playerUids.find(uid => uid !== user.uid)
      
      if (oppUid) {
         setOpponentProfile({
           uid: oppUid,
           username: 'Opponent',
           avatarText: 'O'
         })
      }
      
      // Handle Rematch Requests State
      const requests = data.rematchRequests || {}
      setRematchRequested(!!requests[user.uid])
      if (oppUid) setOpponentRematchRequested(!!requests[oppUid])

      // Execute Room Wipe if BOTH requested
      const reqUids = Object.keys(requests)
      if (reqUids.length >= 2) {
         const updates = {}
         updates[`rooms/${roomId}/winner`] = null
         updates[`rooms/${roomId}/reason`] = null
         updates[`rooms/${roomId}/countdownStart`] = null
         updates[`rooms/${roomId}/snippetId`] = null
         updates[`rooms/${roomId}/rematchRequests`] = null
         
         Object.keys(data.players || {}).forEach(uid => {
             updates[`rooms/${roomId}/players/${uid}/ready`] = false
             updates[`rooms/${roomId}/players/${uid}/progress`] = 0
             updates[`rooms/${roomId}/players/${uid}/stats`] = null
         })
         
         await update(ref(db), updates)
         // The onValue hook will fire again, see !data.winner, and navigate everyone!
      }

      if (data.winner) {
         hasLoadedWinnerRef.current = true
      }
      
      setLoading(false)

      // LEADERBOARD STORAGE PIPELINE
      if (data.matchType === 'quickmatch' && !leaderboardUpdatedRef.current && data.winner) {
         leaderboardUpdatedRef.current = true;
         
         const myStats = data.players[user.uid]?.stats
         if (myStats && myStats.wpm > 0) {
             const userDocRef = doc(firestore, 'users', user.uid)
             try {
                await runTransaction(firestore, async (transaction) => {
                   const userDoc = await transaction.get(userDocRef)
                   if (!userDoc.exists()) return
                   
                   const userData = userDoc.data()
                   const oldAvgWpm = userData.average_wpm || 0
                   const oldGames = userData.quick_match_count || 0
                   
                   const newGames = oldGames + 1
                   const newAvgWpm = ((oldAvgWpm * oldGames) + myStats.wpm) / newGames
                   
                   transaction.update(userDocRef, {
                       quick_match_count: newGames,
                       average_wpm: newAvgWpm
                   })
                })
             } catch (err) {
                console.error("Leaderboard transaction failed:", err)
             }
         }
      }
    })

    return () => unsubscribe()
  }, [user, roomId, navigate])

  const languageLabel = useMemo(() => {
    if (!roomData) return '—'
    const lang = roomData.resolvedLanguage || roomData.language
    const byValue = languageOptions.find((opt) => opt.value === lang)
    if (byValue) return byValue.label

    const byLabel = languageOptions.find(
      (opt) => opt.label.toLowerCase() === String(lang).toLowerCase(),
    )
    return byLabel?.label || String(lang)
  }, [roomData])

  if (loading || !roomData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="cyber-panel p-8 text-center">
          <div className="mx-auto grid h-12 w-12 animate-spin place-items-center rounded-full border border-cyan-400/30 border-t-cyan-300 bg-slate-950/50"></div>
          <h2 className="mt-4 text-xl font-bold text-white">Decrypting results...</h2>
        </div>
      </div>
    )
  }

  const myRawStats = roomData.players[user.uid]?.stats || { wpm: 0, accuracy: 0 }
  const oppRawStats = roomData.players[opponentProfile?.uid]?.stats || { wpm: 0, accuracy: 0 }

  const currentPlayer = {
    id: user.uid,
    username: user.username || user.email?.split('@')[0] || 'You',
    avatarText: (user.username || user.email || 'Y').charAt(0).toUpperCase(),
    wpm: myRawStats.wpm,
    accuracy: myRawStats.accuracy,
  }

  const opponentPlayer = {
    id: opponentProfile?.uid,
    username: opponentProfile?.username || 'Opponent',
    avatarText: opponentProfile?.avatarText || 'O',
    wpm: oppRawStats.wpm,
    accuracy: oppRawStats.accuracy,
  }

  const winnerId = roomData.winner
  const winner = currentPlayer.id === winnerId ? currentPlayer : opponentPlayer

  const didCurrentUserWin = currentPlayer.id === winnerId
  const showRematch = roomData.matchType === 'private'

  const title = didCurrentUserWin ? 'Victory Secured' : 'Defeat Logged'
  const headline = didCurrentUserWin ? 'You Win!' : 'You Lose!'
  const headlineTone = didCurrentUserWin
    ? 'text-emerald-300'
    : 'text-rose-300'

  const handleRematch = async () => {
    if (rematchRequested) return
    const updates = {}
    updates[`rooms/${roomId}/rematchRequests/${user.uid}`] = true
    await update(ref(db), updates)
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
                    ROOM: <span className="text-slate-100">{roomId}</span>
                  </span>
                  <span className="font-mono text-xs text-slate-300">
                    LANG: <span className="text-cyan-300">{languageLabel}</span>
                  </span>
                  <span className="font-mono text-xs text-slate-300">
                    TYPE: <span className="text-slate-100">{roomData.matchType}</span>
                  </span>
                </div>

                <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
                  {title}
                  <span className="cyber-cursor ml-2 align-middle" aria-hidden="true">
                    _
                  </span>
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                  {roomData.reason === 'opponent_disconnected' 
                    ? 'Opponent fled the arena. Default victory.'
                    : 'Match results have been successfully encrypted and logged.'}
                </p>
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
                isWinner={currentPlayer.id === winnerId}
                isCurrentUser
              />
              <PlayerResultCard
                player={opponentPlayer}
                isWinner={opponentPlayer.id === winnerId}
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
                      disabled={rematchRequested}
                      className={[
                        "cyber-button w-full font-mono text-sm focus-visible:outline-none focus-visible:ring-2 sm:w-auto transition-all",
                        rematchRequested 
                           ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10 cursor-not-allowed"
                           : opponentRematchRequested
                             ? "border-amber-400/50 text-amber-300 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.3)] motion-safe:animate-pulse focus-visible:ring-amber-400/70"
                             : "cyber-button-secondary focus-visible:ring-cyan-400/70"
                      ].join(" ")}
                    >
                      {rematchRequested 
                        ? (opponentRematchRequested ? "Resetting Room..." : "Waiting for opponent...") 
                        : (opponentRematchRequested ? "Accept Rematch" : "Request Rematch")}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <StatRow label="FINAL RESULT" value={didCurrentUserWin ? 'WIN' : 'LOSS'} tone={didCurrentUserWin ? 'good' : 'bad'} />
                <StatRow label="WINNER WPM" value={`${winner.wpm} WPM`} tone="info" />
                <StatRow label="ACCURACIES" value={`${formatPercent(currentPlayer.accuracy)} / ${formatPercent(opponentPlayer.accuracy)}`} />
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
