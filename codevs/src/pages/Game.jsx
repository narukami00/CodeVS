import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { languageOptions } from '../data/languages'

const mockPlayers = {
  current: {
    username: 'You',
    avatarText: 'Y',
  },
  opponent: {
    username: 'Opponent',
    avatarText: 'O',
  },
}

const mockSnippet = `function calculateScore(hits, attempts) {
  const accuracy = hits / attempts;
  return Math.round(accuracy * 100);
}`

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return '—'
  return `${Math.round(value)}%`
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function StatPill({ label, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-400/25 text-emerald-200'
      : tone === 'info'
        ? 'border-cyan-400/25 text-cyan-200'
        : 'border-white/10 text-slate-200'

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 sm:px-4 sm:py-3">
      <div className="font-mono text-[10px] tracking-[0.22em] text-slate-400">
        {label}
      </div>
      <div className={['mt-1 font-mono text-sm sm:text-base', toneClass].join(' ')}>
        {value}
      </div>
    </div>
  )
}

function CodeGhostText({ snippet, mode, cursorIndex, charStates, progressIndex }) {
  const renderChar = (ch, index) => {
    const isCursor = mode === 'current' && index === cursorIndex

    let className = 'text-slate-500/80'
    if (mode === 'current') {
      const state = charStates[index]
      if (state === 'c') {
        className = 'text-emerald-300'
      } else if (state === 'e') {
        className = 'text-rose-300 bg-rose-500/15 rounded-[4px]'
      }
    } else {
      className =
        index < progressIndex
          ? 'text-cyan-300/90'
          : 'text-slate-500/80'
    }

    const caret = isCursor ? (
      <span
        aria-hidden="true"
        className="cyber-cursor inline-block h-[1.25em] w-[2px] translate-y-[2px] bg-cyan-300 shadow-[0_0_18px_rgba(0,229,255,0.35)]"
      />
    ) : null

    return (
      <span key={index} className={className}>
        {caret}
        {ch}
      </span>
    )
  }

  return (
    <pre className="m-0 whitespace-pre font-mono text-[13px] leading-relaxed sm:text-sm">
      <code>{Array.from(snippet).map(renderChar)}</code>
    </pre>
  )
}

function ProgressBar({ percent, tone = 'info' }) {
  const clamped = clamp(percent, 0, 100)
  const barTone =
    tone === 'good'
      ? 'bg-emerald-300/90 shadow-[0_0_18px_rgba(57,255,20,0.2)]'
      : 'bg-cyan-300/90 shadow-[0_0_18px_rgba(0,229,255,0.2)]'

  return (
    <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-950/60">
      <div
        className={['h-full rounded-full transition-[width] duration-300', barTone].join(' ')}
        style={{ width: `${clamped}%` }}
        aria-hidden="true"
      />
    </div>
  )
}

function CompactOpponentCard({ player, progressPercent, onSimulateOpponent }) {
  return (
    <section className="cyber-card relative overflow-hidden p-4 sm:p-5" aria-label="Opponent progress">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(520px_240px_at_50%_0%,var(--color-secondary-soft),transparent_65%)] hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-xs tracking-widest text-slate-400">OPPONENT</div>
          <div className="mt-1 text-base font-semibold text-slate-100">{player.username}</div>
          <div className="mt-1 font-mono text-xs text-slate-400">
            Progress <span className="text-cyan-200">{formatPercent(progressPercent)}</span>
          </div>
        </div>

        <div
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-slate-950/45 font-mono text-sm text-slate-100"
          aria-hidden="true"
        >
          {Math.round(progressPercent)}
        </div>
      </div>

      <div className="relative mt-4">
        <ProgressBar percent={progressPercent} tone="info" />
      </div>

      <div className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono text-xs text-slate-400">
          TODO: Firebase-driven opponent progress.
        </div>
        <button
          type="button"
          onClick={onSimulateOpponent}
          className="cyber-button cyber-button-secondary w-full font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 sm:w-auto"
        >
          Simulate
        </button>
      </div>
    </section>
  )
}

function PlayerPanel({
  side,
  title,
  player,
  snippet,
  progressPercent,
  wpm,
  accuracy,
  elapsed,
  isActive,
  isFocused,
  onClickFocus,
  onFocus,
  onBlur,
  typingAreaRef,
  onKeyDown,
  charStates,
  cursorIndex,
  opponentProgressIndex,
  onSimulateOpponent,
}) {
  const isOpponent = side === 'opponent'

  const panelRing = isActive
    ? isFocused
      ? 'ring-2 ring-cyan-400/60'
      : 'ring-1 ring-emerald-400/30'
    : 'ring-1 ring-white/5'

  return (
    <article className={['cyber-card relative overflow-hidden p-6 sm:p-7', panelRing].join(' ')}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(520px_240px_at_50%_0%,var(--color-secondary-soft),transparent_65%)] hover:opacity-100"
      />

      <header className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={
              [
                'grid h-11 w-11 place-items-center rounded-full border',
                'border-white/10 bg-slate-950/45 font-mono text-lg text-slate-100',
                isActive ? 'shadow-[var(--shadow-glow)]' : 'opacity-90',
              ].join(' ')
            }
            aria-hidden="true"
          >
            {player.avatarText}
          </div>
          <div>
            <div className="font-mono text-xs tracking-widest text-slate-400">
              {title}
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-100">
              {player.username}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <StatPill label="PROGRESS" value={formatPercent(progressPercent)} tone="info" />
          <StatPill label="WPM" value={wpm} tone="neutral" />
          <div className="hidden sm:block">
            <StatPill label="ACCURACY" value={accuracy} tone="good" />
          </div>
          <div className="hidden sm:block">
            <StatPill label="ELAPSED" value={elapsed} tone="neutral" />
          </div>
        </div>
      </header>

      <section className="relative mt-6">
        <div
          ref={typingAreaRef}
          tabIndex={isOpponent ? -1 : 0}
          role={isOpponent ? undefined : 'textbox'}
          aria-label={isOpponent ? 'Opponent code view' : 'Code typing area'}
          aria-multiline={isOpponent ? undefined : 'true'}
          onClick={isOpponent ? undefined : onClickFocus}
          onKeyDown={isOpponent ? undefined : onKeyDown}
          onFocus={isOpponent ? undefined : onFocus}
          onBlur={isOpponent ? undefined : onBlur}
          className={
            [
              'relative max-w-full overflow-auto rounded-2xl border bg-slate-950/45 p-4 sm:p-5',
              'outline-none transition',
              isOpponent
                ? 'cursor-default border-white/5 opacity-85'
                : isFocused
                  ? 'border-cyan-400/40 ring-2 ring-cyan-400/20'
                  : 'border-white/10 hover:border-cyan-400/25',
            ].join(' ')
          }
        >
          {!isOpponent && !isFocused && cursorIndex === 0 ? (
            <div className="pointer-events-none absolute inset-x-4 top-4 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 backdrop-blur sm:inset-x-5 sm:text-sm">
              <span className="font-mono text-xs tracking-widest text-slate-400">TIP</span>
              <div className="mt-1">Tap the code area and start typing.</div>
            </div>
          ) : null}

          <CodeGhostText
            snippet={snippet}
            mode={isOpponent ? 'opponent' : 'current'}
            cursorIndex={cursorIndex}
            charStates={charStates}
            progressIndex={opponentProgressIndex}
          />
        </div>

        {isOpponent ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="font-mono text-xs text-slate-400">
              TODO: Read opponent progress from Firebase RTDB.
            </div>
            <button
              type="button"
              onClick={onSimulateOpponent}
              className="cyber-button cyber-button-secondary font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              Simulate opponent progress
            </button>
          </div>
        ) : (
          <div className="mt-4 font-mono text-xs text-slate-400">
            TODO: Use a focused div with robust key handling (tabs/IME), then write progress to
            <span className="font-mono"> /rooms/{'{roomId}'}/players/{'{uid}'}/progress</span>.
          </div>
        )}
      </section>
    </article>
  )
}

function Game() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // TODO: Read roomId, snippetId, player UIDs from route/auth state.
  const roomId = searchParams.get('roomId') || 'A3X9KP'
  const languageValue = searchParams.get('language') || searchParams.get('lang') || 'javascript'

  const languageLabel = useMemo(() => {
    return (
      languageOptions.find((opt) => opt.value === languageValue)?.label ||
      languageValue
    )
  }, [languageValue])

  // TODO: Load snippet by snippetId from Firebase room state.
  const snippet = mockSnippet

  const [cursorIndex, setCursorIndex] = useState(0)
  const [charStates, setCharStates] = useState(() => Array.from({ length: snippet.length }, () => ''))
  const [isFocused, setIsFocused] = useState(false)

  const [startedAt, setStartedAt] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)

  const [opponentProgressIndex, setOpponentProgressIndex] = useState(() =>
    Math.floor(snippet.length * 0.18),
  )

  const typingRef = useRef(null)

  // Keep a lightweight clock for elapsed time/WPM placeholders.
  useEffect(() => {
    if (!startedAt) return
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  const correctChars = useMemo(() => charStates.filter((s) => s === 'c').length, [charStates])

  const elapsedLabel = startedAt ? formatTime(elapsedSeconds) : '—'

  const wpmValue = useMemo(() => {
    if (!startedAt || elapsedSeconds < 1) return '—'
    const minutes = elapsedSeconds / 60
    const wpm = (correctChars / 5) / minutes
    return Number.isFinite(wpm) ? String(Math.round(wpm)) : '—'
  }, [correctChars, elapsedSeconds, startedAt])

  const accuracyValue = useMemo(() => {
    if (totalKeystrokes === 0) return '—'
    const acc = (correctKeystrokes / totalKeystrokes) * 100
    return formatPercent(acc)
  }, [correctKeystrokes, totalKeystrokes])

  const currentProgressPercent = (cursorIndex / snippet.length) * 100
  const opponentProgressPercent = (opponentProgressIndex / snippet.length) * 100

  const handleFocusTyping = () => {
    typingRef.current?.focus()
    setIsFocused(true)
  }

  const handleTypingFocus = () => setIsFocused(true)
  const handleTypingBlur = () => setIsFocused(false)

  const handleKeyDown = (e) => {
    if (e.defaultPrevented) return
    if (e.ctrlKey || e.metaKey || e.altKey) return

    const key = e.key

    if (key === 'Escape') return

    if (key === 'Tab') {
      // TODO: Tab handling for indentation (tabs vs spaces) once snippet sources are standardized.
      e.preventDefault()
    }

    if (key === 'Backspace') {
      e.preventDefault()
      setCursorIndex((prevIndex) => {
        const nextIndex = Math.max(0, prevIndex - 1)
        if (nextIndex === prevIndex) return prevIndex
        setCharStates((prev) => {
          const next = [...prev]
          next[nextIndex] = ''
          return next
        })
        return nextIndex
      })
      return
    }

    if (cursorIndex >= snippet.length) return

    const expected = snippet[cursorIndex]
    const input =
      key === 'Enter'
        ? '\n'
        : key === 'Tab'
          ? '\t'
          : key.length === 1
            ? key
            : null

    if (input === null) return

    if (!startedAt) {
      setStartedAt(Date.now())
      setElapsedSeconds(0)
    }

    setTotalKeystrokes((v) => v + 1)

    if (input === expected) {
      setCorrectKeystrokes((v) => v + 1)
      setCharStates((prev) => {
        const next = [...prev]
        next[cursorIndex] = 'c'
        return next
      })
      const nextIndex = cursorIndex + 1
      setCursorIndex(nextIndex)

      if (nextIndex >= snippet.length) {
        // TODO: Write winner to /rooms/{roomId}/winner when currentIndex reaches snippet.length.
        // TODO: Navigate to Result screen when winner is set.
        console.log('[Game] Finished snippet (local demo).', { roomId })
      }
      return
    }

    // Wrong key: mark error, do NOT advance cursor.
    setCharStates((prev) => {
      const next = [...prev]
      next[cursorIndex] = 'e'
      return next
    })
  }

  const handleSimulateOpponent = () => {
    // TODO: Replace with Firebase-driven opponent progress.
    setOpponentProgressIndex((prev) => {
      const step = Math.max(2, Math.floor(snippet.length * 0.04))
      return clamp(prev + step, 0, snippet.length)
    })
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
          <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5">
                <span className="font-mono text-xs tracking-widest text-emerald-300/90">
                  LIVE BATTLE
                </span>
                <span className="h-1 w-1 rounded-full bg-emerald-300/90" />
                <span className="font-mono text-xs text-slate-300">
                  LANG: <span className="text-cyan-300">{languageLabel}</span>
                </span>
                <span className="font-mono text-xs text-slate-300">
                  ROOM: <span className="text-slate-100">{roomId}</span>
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
                Typing Battle
                <span className="cyber-cursor ml-2 align-middle" aria-hidden="true">
                  _
                </span>
              </h1>
              <p className="mt-1.5 text-sm text-slate-300">
                No time limit. Cursor only advances on correct characters.
              </p>

              <div className="mt-4 grid gap-2 sm:hidden" aria-label="Mobile match bar">
                <div className="grid grid-cols-2 gap-2">
                  <StatPill label="YOU" value={formatPercent(currentProgressPercent)} tone="good" />
                  <StatPill label="OPP" value={formatPercent(opponentProgressPercent)} tone="info" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <StatPill label="WPM" value={wpmValue} tone="neutral" />
                  <StatPill label="ACC" value={accuracyValue} tone="good" />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate('/lobby')}
                className="cyber-button w-full font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 sm:w-auto"
              >
                Exit
              </button>
            </div>
          </header>

          <div className="mx-auto mt-8 grid w-full max-w-6xl gap-6">
            <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-[1fr_auto_1fr]">
              <PlayerPanel
                side="current"
                title="YOU"
                player={mockPlayers.current}
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
              />

              <div className="hidden items-center justify-center xl:flex">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full border border-cyan-400/30 bg-slate-950/50 px-5 py-2 font-mono text-lg font-semibold tracking-widest text-cyan-300 shadow-[var(--shadow-glow-cyan)]">
                    VS
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    {Math.round(currentProgressPercent)}% • {Math.round(opponentProgressPercent)}%
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <PlayerPanel
                  side="opponent"
                  title="OPPONENT"
                  player={mockPlayers.opponent}
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
                  onSimulateOpponent={handleSimulateOpponent}
                />
              </div>
            </div>

            <div className="md:hidden">
              <CompactOpponentCard
                player={mockPlayers.opponent}
                progressPercent={opponentProgressPercent}
                onSimulateOpponent={handleSimulateOpponent}
              />
            </div>

            <section className="hidden rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur sm:p-7 md:block">
              <h2 className="font-mono text-base font-semibold tracking-wide text-slate-100">
                ENGINE NOTES
              </h2>
              <div className="mt-2 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-slate-950/35 p-4">
                  <div className="font-mono text-xs tracking-widest text-slate-400">INPUT</div>
                  <div className="mt-1.5">Focusable div + keydown</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-950/35 p-4">
                  <div className="font-mono text-xs tracking-widest text-slate-400">CURSOR</div>
                  <div className="mt-1.5">Advances only on correct</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-950/35 p-4">
                  <div className="font-mono text-xs tracking-widest text-slate-400">SYNC</div>
                  <div className="mt-1.5">Local demo (Firebase TODO)</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-400">
                TODO: Save final WPM/accuracy to
                <span className="font-mono"> /rooms/{'{roomId}'}/results/{'{uid}'}</span> and navigate to results when winner is set.
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Game
