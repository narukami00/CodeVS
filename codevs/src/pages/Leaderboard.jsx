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
      ? 'border-emerald-400/25 text-emerald-200'
      : tone === 'info'
        ? 'border-cyan-400/25 text-cyan-200'
        : 'border-white/10 text-slate-200'

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
      <div className="font-mono text-[10px] tracking-[0.22em] text-slate-400">
        {label}
      </div>
      <div className={['mt-1 font-mono text-base', toneClass].join(' ')}>
        {value}
      </div>
    </div>
  )
}

function MedalBadge({ rank }) {
  const map = {
    1: {
      label: 'CHAMPION',
      tone: 'border-amber-300/35 text-amber-200',
    },
    2: {
      label: 'ELITE',
      tone: 'border-cyan-300/35 text-cyan-200',
    },
    3: {
      label: 'PRO',
      tone: 'border-emerald-300/35 text-emerald-200',
    },
  }

  const { label, tone } = map[rank] ?? {
    label: `#${rank}`,
    tone: 'border-white/10 text-slate-200',
  }

  return (
    <span
      className={
        [
          'inline-flex items-center rounded-full border px-3 py-1.5',
          'bg-slate-950/50 font-mono text-[10px] tracking-[0.22em]',
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
      ? 'shadow-[var(--shadow-glow)]'
      : rank === 2
        ? 'shadow-[var(--shadow-glow-cyan)]'
        : 'shadow-[0_0_22px_rgba(57,255,20,0.12)]'

  const accent =
    rank === 1
      ? 'text-[var(--color-primary)]'
      : rank === 2
        ? 'text-cyan-300'
        : 'text-emerald-300'

  const orderClass =
    rank === 1 ? 'md:order-2' : rank === 2 ? 'md:order-1' : 'md:order-3'

  return (
    <article
      className={
        [
          'cyber-card group relative overflow-hidden p-6 sm:p-7',
          orderClass,
          isChampion ? 'neon-pulse motion-reduce:animate-none' : '',
        ].join(' ')
      }
      style={{ animationDelay: `${rank * 60}ms` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(520px_240px_at_50%_0%,var(--color-secondary-soft),transparent_65%)] group-hover:opacity-100"
      />

      <header className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs tracking-widest text-slate-400">
              RANK
            </span>
            <span className={['font-mono text-xs tracking-widest', accent].join(' ')}>
              #{rank}
            </span>
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-100">
            {player.username}
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            Avg. WPM <span className={['font-mono', accent].join(' ')}>{formatWpm(player.averageWpm)}</span>
            <span className="mx-2 text-slate-500">•</span>
            <span className="font-mono text-slate-200">{player.gamesPlayed}</span> games
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <MedalBadge rank={rank} />
          <div
            className={
              [
                'grid h-12 w-12 place-items-center rounded-full',
                'border border-white/10 bg-slate-950/40',
                'font-mono text-lg text-slate-100',
                glowRing,
              ].join(' ')
            }
            aria-hidden="true"
            title={`Rank ${rank}`}
          >
            {rank === 1 ? '★' : rank === 2 ? '▲' : '◆'}
          </div>
        </div>
      </header>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
        <StatCard label="AVG WPM" value={`${formatWpm(player.averageWpm)} WPM`} tone={rank === 1 ? 'good' : 'info'} />
        <StatCard label="GAMES" value={player.gamesPlayed} />
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
    <section className="relative isolate overflow-hidden">
      {/* Background overlays (grid + scanlines) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-cyan-400/20">
        <div className="cyber-grid absolute inset-0" />
        <div className="cyber-scanlines absolute inset-0" />
        <div className="cyber-vignette absolute inset-0" />
      </div>

      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-10 sm:py-12">
        <div className="cyber-entrance">
          <header className="mx-auto max-w-3xl text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-950/40 px-4 py-1.5 text-sm text-slate-200 backdrop-blur">
              <span className="font-mono text-cyan-300/90">GLOBAL</span>
              <span className="h-1 w-1 rounded-full bg-cyan-300/90" />
              <span className="text-slate-300">Top coders ranked by average WPM</span>
            </div>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-slate-100 sm:text-6xl">
              Global Leaderboard
              <span className="cyber-cursor ml-2 align-middle" aria-hidden="true">
                _
              </span>
            </h1>
            <p className="mt-4 text-pretty text-base text-slate-300 sm:text-lg">
              Champion status is earned in qualifying quick matches.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="cyber-button cyber-button-secondary w-full font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 sm:w-auto"
              >
                {isLoading ? 'Syncing…' : 'Refresh'}
              </button>

              <div className="font-mono text-xs text-slate-400" aria-live="polite">
                {lastUpdatedIso ? (
                  <span>
                    LAST SYNC: <span className="text-slate-200">{new Date(lastUpdatedIso).toLocaleString()}</span>
                  </span>
                ) : (
                  <span>LAST SYNC: <span className="text-slate-500">—</span></span>
                )}
              </div>
            </div>

            <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
              <StatCard label="TOP AVG WPM" value={stats.topWpm === '—' ? '—' : `${stats.topWpm} WPM`} tone="good" />
              <StatCard label="PLAYERS SHOWN" value={stats.totalPlayers} tone="info" />
              <StatCard label="HIGHEST GAMES" value={stats.maxGames} />
            </div>
          </header>

          <div className="mx-auto mt-10 grid w-full max-w-5xl gap-6">
            {isLoading ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-center backdrop-blur sm:p-7" role="status" aria-live="polite">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-cyan-400/30 bg-slate-950/50 font-mono text-cyan-300 shadow-[var(--shadow-glow-cyan)]">
                  ⟳
                </div>
                <div className="mt-4 text-lg font-semibold text-slate-100">Loading leaderboard…</div>
                <p className="mt-1.5 text-sm text-slate-300">Fetching the top coders from the backend.</p>
              </section>
            ) : errorMessage ? (
              <section className="rounded-2xl border border-rose-400/25 bg-slate-950/40 p-6 text-center backdrop-blur sm:p-7" role="alert">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-rose-400/30 bg-slate-950/50 font-mono text-rose-200">
                  !
                </div>
                <div className="mt-4 text-lg font-semibold text-slate-100">Unable to load</div>
                <p className="mt-1.5 text-sm text-slate-300">{errorMessage}</p>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="cyber-button cyber-button-primary font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                  >
                    Try again
                  </button>
                </div>
              </section>
            ) : normalizedPlayers.length === 0 ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-center backdrop-blur sm:p-7">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-slate-950/50 font-mono text-slate-200">
                  —
                </div>
                <div className="mt-4 text-lg font-semibold text-slate-100">No ranked players yet</div>
                <p className="mt-1.5 text-sm text-slate-300">
                  Play a qualifying quick match to appear here.
                </p>
              </section>
            ) : (
              <>
                <section aria-label="Top 3 podium" className="cyber-fade-up" style={{ animationDelay: '90ms' }}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-mono text-base font-semibold tracking-wide text-slate-100">
                        PODIUM
                      </h2>
                      <p className="mt-1.5 text-sm text-slate-300">
                        The top three operators in the arena.
                      </p>
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      RULES: <span className="text-slate-200">AVG WPM</span> then{' '}
                      <span className="text-slate-200">GAMES</span>
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
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur sm:p-7"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-mono text-base font-semibold tracking-wide text-slate-100">
                        TOP 10
                      </h2>
                      <p className="mt-1.5 text-sm text-slate-300">
                        Global rankings for qualifying quick matches.
                      </p>
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      Showing <span className="text-slate-200">{rest.length}</span> players
                    </div>
                  </div>

                  {/* Desktop table */}
                  <div className="mt-6 hidden md:block">
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <table className="w-full border-collapse text-left">
                        <thead className="bg-slate-950/60">
                          <tr>
                            <th className="px-4 py-3 font-mono text-xs tracking-widest text-slate-400">RANK</th>
                            <th className="px-4 py-3 font-mono text-xs tracking-widest text-slate-400">USERNAME</th>
                            <th className="px-4 py-3 font-mono text-xs tracking-widest text-slate-400">AVG. WPM</th>
                            <th className="px-4 py-3 font-mono text-xs tracking-widest text-slate-400">GAMES</th>
                            <th className="px-4 py-3 font-mono text-xs tracking-widest text-slate-400">BADGE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rest.map((player, i) => {
                            const rank = i + 1
                            const highlight =
                              rank === 1
                                ? 'bg-[rgba(57,255,20,0.06)]'
                                : rank === 2
                                  ? 'bg-[rgba(0,229,255,0.06)]'
                                  : rank === 3
                                    ? 'bg-[rgba(16,185,129,0.06)]'
                                    : ''
                            return (
                              <tr
                                key={player.key}
                                className={
                                  [
                                    'group border-t border-white/5 transition',
                                    'hover:bg-slate-950/40',
                                    highlight,
                                  ].join(' ')
                                }
                                style={{ animationDelay: `${110 + i * 35}ms` }}
                              >
                                <td className="px-4 py-3">
                                  <div className="inline-flex items-center gap-2">
                                    <span
                                      className={
                                        [
                                          'grid h-8 w-8 place-items-center rounded-full border',
                                          'bg-slate-950/50 font-mono text-sm',
                                          rank === 1
                                            ? 'border-amber-300/35 text-amber-200 shadow-[var(--shadow-glow)]'
                                            : rank === 2
                                              ? 'border-cyan-300/35 text-cyan-200 shadow-[var(--shadow-glow-cyan)]'
                                              : rank === 3
                                                ? 'border-emerald-300/35 text-emerald-200'
                                                : 'border-white/10 text-slate-200',
                                        ].join(' ')
                                      }
                                      aria-label={`Rank ${rank}`}
                                    >
                                      {rank}
                                    </span>
                                    <span className="font-mono text-xs tracking-widest text-slate-400">#{rank}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-slate-100">{player.username}</div>
                                  <div className="mt-1 font-mono text-xs text-slate-400">
                                    UID: <span className="text-slate-300">{String(player.key)}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-mono text-base text-cyan-200">
                                    {formatWpm(player.averageWpm)}
                                  </span>
                                  <span className="ml-2 text-sm text-slate-400">WPM</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-mono text-base text-slate-100">{player.gamesPlayed}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <MedalBadge rank={rank <= 3 ? rank : rank} />
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
                          ? 'border-amber-300/25'
                          : rank === 2
                            ? 'border-cyan-300/25'
                            : rank === 3
                              ? 'border-emerald-300/25'
                              : 'border-white/10'

                      return (
                        <article
                          key={player.key}
                          className={
                            [
                              'group relative overflow-hidden rounded-2xl border bg-slate-950/35 p-4',
                              'transition hover:bg-slate-950/55 hover:ring-1 hover:ring-cyan-400/20',
                              tone,
                            ].join(' ')
                          }
                          style={{ animationDelay: `${110 + i * 35}ms` }}
                        >
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(480px_220px_at_50%_0%,var(--color-secondary-soft),transparent_70%)] group-hover:opacity-100"
                          />
                          <div className="relative flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs tracking-widest text-slate-400">RANK</span>
                                <span className="font-mono text-xs tracking-widest text-slate-200">#{rank}</span>
                                {rank <= 3 ? <MedalBadge rank={rank} /> : null}
                              </div>
                              <div className="mt-2 text-lg font-semibold text-slate-100">{player.username}</div>
                              <div className="mt-1 font-mono text-xs text-slate-400">
                                Avg <span className="text-cyan-200">{formatWpm(player.averageWpm)}</span> WPM
                                <span className="mx-2 text-slate-500">•</span>
                                <span className="text-slate-200">{player.gamesPlayed}</span> games
                              </div>
                            </div>
                            <span
                              className={
                                [
                                  'grid h-10 w-10 place-items-center rounded-full border',
                                  'bg-slate-950/50 font-mono text-sm text-slate-100',
                                  tone,
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
