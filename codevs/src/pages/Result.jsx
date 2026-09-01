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
      ? 'text-emerald-400 font-bold'
      : tone === 'bad'
        ? 'text-rose-400 font-bold'
        : 'text-slate-300'

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-2.5">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </div>
      <div className={['font-mono text-xs font-semibold', toneClass].join(' ')}>{value}</div>
    </div>
  )
}

function PlayerResultCard({ player, isWinner, isCurrentUser }) {
  const badgeTone = isWinner
    ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
    : 'border-slate-800 text-slate-400 bg-slate-900/30'

  const cardBorder = isWinner
    ? 'border-emerald-500/25 bg-slate-900/10 shadow-sm'
    : 'border-slate-850 bg-slate-950/20'

  return (
    <article className={['glass-card relative overflow-hidden p-6 sm:p-7 transition-all duration-300', cardBorder].join(' ')}>
      <header className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={
              [
                'grid h-10 w-10 place-items-center rounded-full border border-slate-850 bg-slate-900 font-semibold text-sm text-slate-350',
                isWinner ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/5' : 'border-slate-800',
              ].join(' ')
            }
            aria-hidden="true"
          >
            {player.avatarText}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-base font-semibold text-slate-200">
                {player.username}
              </div>
              {isCurrentUser ? (
                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/5 px-2 py-0.5 text-[9px] font-semibold text-indigo-400 tracking-wider">
                  You
                </span>
              ) : null}
            </div>
            <div className="mt-0.5 text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
              {isWinner ? 'Victorious' : 'Defeated'}
            </div>
          </div>
        </div>

        <span
          className={
            [
              'inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-semibold',
              badgeTone,
            ].join(' ')
          }
        >
          {isWinner ? 'Winner' : 'Runner-up'}
        </span>
      </header>

      <div className="relative mt-5 grid gap-2">
        <StatRow label="Speed" value={`${player.wpm ?? '—'} WPM`} tone={isWinner ? 'good' : 'neutral'} />
        <StatRow label="Accuracy" value={formatPercent(player.accuracy)} tone={player.accuracy >= 95 ? 'good' : 'neutral'} />
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
        <div className="dialog-panel p-8 text-center border-slate-850">
          <div className="mx-auto grid h-10 w-10 animate-spin place-items-center rounded-full border-2 border-indigo-500 border-t-transparent bg-slate-950/50"></div>
          <h2 className="mt-4 text-sm font-semibold text-slate-400">Loading results...</h2>
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
    ? 'text-emerald-400'
    : 'text-rose-450'

  const handleRematch = async () => {
    if (rematchRequested) return
    const updates = {}
    updates[`rooms/${roomId}/rematchRequests/${user.uid}`] = true
    await update(ref(db), updates)
  }

  return (
    <section className="relative isolate">
      {/* Background overlays (grid + vignette) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-8 sm:py-12">
        <div className="animate-entrance">
          <header className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-3.5 py-1 text-xs text-slate-400">
                  <span className="text-indigo-400 font-semibold">Match Results</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span>Room: {roomId}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span>Language: <span className="font-semibold text-slate-200">{languageLabel}</span></span>
                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  {roomData.reason === 'opponent_disconnected' 
                    ? 'Your opponent left the match.'
                    : 'Match completed. Results successfully saved.'}
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className={['text-2xl font-bold tracking-tight', headlineTone].join(' ')}>
                  {headline}
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 min-w-[160px] text-left">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    Match Winner
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-200">
                    {winner.username}
                  </div>
                  <div className="mt-0.5 text-xs text-indigo-400 font-bold font-mono">
                    {winner.wpm} WPM
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto mt-8 grid w-full max-w-5xl gap-6">
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

            <section className="rounded-2xl border border-slate-800 bg-slate-950/30 p-6 backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Summary Log
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Match completed. Stats compiled and saved.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn btn-primary text-xs font-semibold py-2.5 px-4 w-full sm:w-auto cursor-pointer"
                  >
                    Back to Dashboard
                  </button>

                  {showRematch ? (
                    <button
                      type="button"
                      onClick={handleRematch}
                      disabled={rematchRequested}
                      className={[
                        "btn text-xs font-semibold py-2.5 px-4 w-full sm:w-auto transition-all duration-200 cursor-pointer",
                        rematchRequested 
                           ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 cursor-not-allowed"
                           : opponentRematchRequested
                             ? "border-amber-500/20 text-amber-400 bg-amber-500/5 animate-pulse"
                             : "btn-secondary"
                      ].join(" ")}
                    >
                      {rematchRequested 
                        ? (opponentRematchRequested ? "Resetting Room..." : "Waiting for Opponent...") 
                        : (opponentRematchRequested ? "Accept Rematch" : "Request Rematch")}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
                <StatRow label="Result Status" value={didCurrentUserWin ? 'Victory' : 'Defeated'} tone={didCurrentUserWin ? 'good' : 'bad'} />
                <StatRow label="Top Speed" value={`${winner.wpm} WPM`} tone="info" />
                <StatRow label="Accuracies (You / Opp)" value={`${formatPercent(currentPlayer.accuracy)} / ${formatPercent(opponentPlayer.accuracy)}`} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Result
