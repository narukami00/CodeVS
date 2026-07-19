import { useCallback, useEffect, useMemo, useState } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { firestore } from '../firebase'

function toNumber(value) {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function formatWpm(value) {
  const numeric = toNumber(value)
  if (!Number.isFinite(numeric)) return '—'
  const roundedToTenth = Math.round(numeric * 10) / 10
  return Number.isInteger(roundedToTenth)
    ? String(roundedToTenth)
    : roundedToTenth.toFixed(1)
}

function normalizePlayer(raw, index) {
  const username =
    raw?.username ?? raw?.name ?? raw?.user?.username ?? raw?.user?.name ?? null
  const averageWpm =
    raw?.average_wpm ??
    raw?.averageWpm ??
    raw?.avg_wpm ??
    raw?.avgWpm ??
    raw?.wpm ??
    raw?.avg
  const gamesPlayed =
    raw?.quick_match_count ??
    raw?.quickMatchCount ??
    raw?.gamesPlayed ??
    raw?.games_played ??
    raw?.matches ??
    raw?.count

  const resolvedUsername =
    typeof username === 'string' && username.trim() ? username.trim() : 'Unknown'

  return {
    key:
      raw?.id ??
      raw?.user_id ??
      raw?.uid ??
      `${resolvedUsername}-${index}`,
    username: resolvedUsername,
    averageWpm: toNumber(averageWpm),
    gamesPlayed: toNumber(gamesPlayed) ?? 0,
    raw,
  }
}

function sortByRankRules(players) {
  return [...players].sort((a, b) => {
    const wpmA = a.averageWpm ?? -Infinity
    const wpmB = b.averageWpm ?? -Infinity
    if (wpmB !== wpmA) return wpmB - wpmA

    const gamesA = a.gamesPlayed ?? 0
    const gamesB = b.gamesPlayed ?? 0
    if (gamesB !== gamesA) return gamesB - gamesA

    return a.username.localeCompare(b.username)
  })
}

function StatCard({ label, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-500/20 text-emerald-400'
      : tone === 'info'
        ? 'border-indigo-500/20 text-indigo-400'
        : 'border-slate-800 text-slate-350'

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-905/35 px-4 py-2.5 backdrop-blur-sm">
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </div>
      <div className={['mt-0.5 text-sm font-bold', toneClass].join(' ')}>
        {value}
      </div>
    </div>
  )
}

function MedalBadge({ rank }) {
  const map = {
    1: {
      label: 'Gold Tier',
      tone: 'border-amber-500/20 text-amber-400 bg-amber-500/5',
    },
    2: {
      label: 'Silver Tier',
      tone: 'border-slate-700 text-slate-300 bg-slate-800/30',
    },
    3: {
      label: 'Bronze Tier',
      tone: 'border-orange-500/20 text-orange-400 bg-orange-500/5',
    },
  }

  const { label, tone } = map[rank] ?? {
    label: `Rank ${rank}`,
    tone: 'border-slate-800 text-slate-400 bg-slate-950/20',
  }

  return (
    <span
      className={
        [
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide',
          tone,
        ].join(' ')
      }
    >
      {label}
    </span>
  )
}

function PodiumCard({ player, rank }) {
  const isChampion = rank === 1
  const glowRing =
    rank === 1
      ? 'border-amber-500/25 bg-slate-900/10 shadow-sm'
      : rank === 2
        ? 'border-indigo-500/20 bg-slate-950/20'
        : 'border-slate-800 bg-slate-950/20'

  const accent =
    rank === 1
      ? 'text-amber-400'
      : rank === 2
        ? 'text-indigo-400'
        : 'text-slate-400'

  const orderClass =
    rank === 1 ? 'md:order-2' : rank === 2 ? 'md:order-1' : 'md:order-3'

  return (
    <article
      className={
        [
          'glass-card group relative overflow-hidden p-6 sm:p-7 border transition-all duration-300',
          orderClass,
          glowRing,
        ].join(' ')
      }
    >
      <header className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Rank
            </span>
            <span className={['text-[10px] font-bold tracking-wide', accent].join(' ')}>
              #0{rank}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-slate-200">
            {player.username}
          </h3>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Avg Speed: <span className={['font-bold font-sans', accent].join(' ')}>{formatWpm(player.averageWpm)} WPM</span>
            <span className="mx-2 text-slate-700">•</span>
            <span>Games: <span className="text-slate-300 font-sans">{player.gamesPlayed}</span></span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <MedalBadge rank={rank} />
          <div
            className={
              [
                'grid h-8 w-8 place-items-center rounded-full border border-slate-800 bg-slate-950 font-bold text-xs',
                accent,
              ].join(' ')
            }
            aria-hidden="true"
            title={`Rank ${rank}`}
          >
            {rank === 1 ? '★' : rank === 2 ? '▲' : '◆'}
          </div>
        </div>
      </header>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
        <StatCard label="Average Speed" value={`${formatWpm(player.averageWpm)} WPM`} tone={rank === 1 ? 'good' : 'info'} />
        <StatCard label="Games Played" value={player.gamesPlayed} />
      </div>
    </article>
  )
}

const leaderboardStore = (() => {
  let snapshot = {
    status: 'idle',
    data: [],
    errorMessage: '',
    lastUpdatedIso: '',
  }

  const listeners = new Set()

  const emit = () => {
    for (const listener of listeners) listener()
  }

  const setSnapshot = (next) => {
    snapshot = next
    emit()
  }

  const getSnapshot = () => snapshot

  const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const refresh = async () => {
    setSnapshot({
      ...snapshot,
      status: 'loading',
      errorMessage: '',
    })

    try {
      const usersRef = collection(firestore, 'users')
      const q = query(usersRef, orderBy('average_wpm', 'desc'), limit(50))
      const querySnapshot = await getDocs(q)
      
      const list = []
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() })
      })

      setSnapshot({
        status: 'success',
        data: list,
        errorMessage: '',
        lastUpdatedIso: new Date().toISOString(),
      })
    } catch (err) {
      setSnapshot({
        status: 'error',
        data: [],
        errorMessage: 'Unable to load leaderboard. Try again.',
        lastUpdatedIso: '',
      })
      console.error('[Leaderboard] Failed to load', err)
    }
  }

  const ensureLoaded = () => {
    if (snapshot.status === 'idle') {
      void refresh()
    }
  }

  return {
    getSnapshot,
    subscribe,
    refresh,
    ensureLoaded,
  }
})()

function Leaderboard() {
  const [storeSnapshot, setStoreSnapshot] = useState(() =>
    leaderboardStore.getSnapshot(),
  )

  useEffect(() => {
    const unsubscribe = leaderboardStore.subscribe(() => {
      setStoreSnapshot(leaderboardStore.getSnapshot())
    })
    leaderboardStore.ensureLoaded()
    return unsubscribe
  }, [])

  const playersRaw = storeSnapshot.data
  const isLoading = storeSnapshot.status === 'loading'
  const errorMessage = storeSnapshot.errorMessage
  const lastUpdatedIso = storeSnapshot.lastUpdatedIso

  const normalizedPlayers = useMemo(() => {
    const normalized = playersRaw.map((row, i) => normalizePlayer(row, i))
    const qualifying = normalized.filter((p) => (p.gamesPlayed ?? 0) >= 1)
    const sorted = sortByRankRules(qualifying)
    return sorted.slice(0, 10)
  }, [playersRaw])

  const podium = normalizedPlayers.slice(0, 3)
  const rest = normalizedPlayers.slice(0, 10)

  const stats = useMemo(() => {
    if (normalizedPlayers.length === 0) {
      return {
        topWpm: '—',
        totalPlayers: 0,
        maxGames: '—',
      }
    }

    const topWpm = normalizedPlayers[0]?.averageWpm
    const maxGames = normalizedPlayers.reduce((acc, p) => {
      const next = p.gamesPlayed ?? 0
      return next > acc ? next : acc
    }, 0)

    return {
      topWpm: formatWpm(topWpm),
      totalPlayers: normalizedPlayers.length,
      maxGames: String(maxGames),
    }
  }, [normalizedPlayers])

  const handleRefresh = useCallback(() => {
    void leaderboardStore.refresh()
  }, [])

  return (
    <section className="relative isolate">
      {/* Background overlays (grid + vignette) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 sm:py-12">
        <div className="animate-entrance">
          <header className="mx-auto max-w-3xl text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/40 px-4 py-1.5 text-xs text-slate-300 backdrop-blur font-medium">
              <span>Global Rankings</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span className="text-slate-400">Top developers ranked by average WPM</span>
            </div>

            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
              Global Leaderboard
            </h1>
            <p className="mt-3 text-pretty text-sm text-slate-400 max-w-md mx-auto">
              Leaderboard rankings are updated dynamically after qualifying quick matches.
            </p>

            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="btn btn-secondary w-full text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 sm:w-auto py-2 px-5 cursor-pointer"
              >
                {isLoading ? 'Syncing…' : 'Refresh Leaderboard'}
              </button>

              <div className="text-xs text-slate-500" aria-live="polite">
                {lastUpdatedIso ? (
                  <span>
                    Last updated: <span className="text-slate-400 font-semibold">{new Date(lastUpdatedIso).toLocaleString()}</span>
                  </span>
                ) : (
                  <span>Last updated: <span className="text-slate-600">—</span></span>
                )}
              </div>
            </div>

            <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
              <StatCard label="Top Speed" value={stats.topWpm === '—' ? '—' : `${stats.topWpm} WPM`} tone="good" />
              <StatCard label="Developers Ranked" value={stats.totalPlayers} tone="info" />
              <StatCard label="Most Matches Played" value={stats.maxGames} />
            </div>
          </header>

          <div className="mx-auto mt-10 grid w-full max-w-5xl gap-6">
            {isLoading ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-center backdrop-blur sm:p-7" role="status" aria-live="polite">
                <div className="mx-auto grid h-10 w-10 animate-spin place-items-center rounded-full border-2 border-indigo-500 border-t-transparent bg-slate-950/50"></div>
                <div className="mt-4 text-sm font-semibold text-slate-350">Loading leaderboard stats…</div>
              </section>
            ) : errorMessage ? (
              <section className="rounded-2xl border border-rose-500/20 bg-slate-950/40 p-6 text-center backdrop-blur sm:p-7" role="alert">
                <div className="mt-2 text-sm font-semibold text-rose-450">Unable to load leaderboard</div>
                <p className="mt-1 text-xs text-slate-400">{errorMessage}</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="btn btn-primary text-xs font-semibold py-2 px-4 cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              </section>
            ) : normalizedPlayers.length === 0 ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-center backdrop-blur sm:p-7">
                <div className="text-sm font-semibold text-slate-350">No ranked developers yet</div>
                <p className="mt-1 text-xs text-slate-400">
                  Complete a qualifying quick match to claim your place on the board.
                </p>
              </section>
            ) : (
              <>
                <section aria-label="Top 3 podium" className="animate-fade-up">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-350 tracking-wider uppercase">
                        The Podium
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        The top three developers on the leaderboard.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {podium.map((player, i) => (
                      <PodiumCard key={player.key} player={player} rank={i + 1} />
                    ))}
                  </div>
                </section>

                <section
                  aria-label="Full leaderboard"
                  className="rounded-2xl border border-slate-800 bg-slate-950/30 p-6 backdrop-blur sm:p-7"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-350 tracking-wider uppercase">
                        Rankings Table
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Ranked list of qualified speed developers.
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Showing {rest.length} players
                    </div>
                  </div>

                  {/* Desktop table */}
                  <div className="mt-6 hidden md:block">
                    <div className="overflow-hidden rounded-xl border border-slate-800">
                      <table className="w-full border-collapse text-left">
                        <thead className="bg-slate-950">
                          <tr>
                            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Rank</th>
                            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Developer</th>
                            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Average Speed</th>
                            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Games Played</th>
                            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rest.map((player, i) => {
                            const rank = i + 1
                            const highlight =
                              rank === 1
                                ? 'bg-amber-500/[0.01]'
                                : rank === 2
                                  ? 'bg-indigo-500/[0.01]'
                                  : rank === 3
                                    ? 'bg-orange-500/[0.01]'
                                    : ''
                            return (
                              <tr
                                key={player.key}
                                className={[
                                  'group border-t border-slate-900 transition-colors hover:bg-slate-950/40',
                                  highlight,
                                ].join(' ')}
                              >
                                <td className="px-5 py-3.5">
                                  <div className="inline-flex items-center gap-2">
                                    <span
                                      className={
                                        [
                                          'grid h-6 w-6 place-items-center rounded-full font-bold text-xs border',
                                          rank === 1
                                            ? 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                                            : rank === 2
                                              ? 'border-slate-700 text-slate-300 bg-slate-800/30'
                                              : rank === 3
                                                ? 'border-orange-500/20 text-orange-400 bg-orange-500/5'
                                                : 'border-slate-850 text-slate-400 bg-slate-950/20',
                                        ].join(' ')
                                      }
                                      aria-label={`Rank ${rank}`}
                                    >
                                      {rank}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="font-semibold text-slate-250">{player.username}</div>
                                  <div className="mt-0.5 text-[10px] text-slate-500 font-mono">
                                    ID: {player.key.substring(0, 8)}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="text-sm font-bold text-indigo-400">
                                    {formatWpm(player.averageWpm)}
                                  </span>
                                  <span className="ml-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">WPM</span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="text-sm text-slate-350">{player.gamesPlayed}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <MedalBadge rank={rank} />
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile cards */}
                  <div className="mt-6 grid gap-3 md:hidden">
                    {rest.map((player, i) => {
                      const rank = i + 1
                      const tone =
                        rank === 1
                          ? 'border-amber-500/20 bg-amber-500/5'
                          : rank === 2
                            ? 'border-slate-800 bg-slate-850/20'
                            : rank === 3
                              ? 'border-orange-500/20 bg-orange-500/5'
                              : 'border-slate-900 bg-slate-950/20'

                      return (
                        <article
                          key={player.key}
                          className={[
                            'group relative overflow-hidden rounded-xl border p-4 transition-all hover:bg-slate-950/30 hover:border-slate-800',
                            tone,
                          ].join(' ')}
                        >
                          <div className="relative flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase">Rank #0{rank}</span>
                                {rank <= 3 ? <MedalBadge rank={rank} /> : null}
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-200">{player.username}</div>
                              <div className="mt-1 text-xs text-slate-400">
                                Avg: <span className="text-indigo-400 font-semibold">{formatWpm(player.averageWpm)} WPM</span>
                                <span className="mx-2 text-slate-800">•</span>
                                Games: <span className="text-slate-300 font-semibold">{player.gamesPlayed}</span>
                              </div>
                            </div>
                            <span
                              className={
                                [
                                  'grid h-6 w-6 place-items-center rounded-full font-bold text-xs border',
                                  rank === 1
                                    ? 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                                    : rank === 2
                                      ? 'border-slate-700 text-slate-300 bg-slate-800/30'
                                      : rank === 3
                                        ? 'border-orange-500/20 text-orange-400 bg-orange-500/5'
                                        : 'border-slate-850 text-slate-400 bg-slate-950/20',
                                        ].join(' ')
                              }
                              aria-hidden="true"
                            >
                              {rank}
                            </span>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Leaderboard
