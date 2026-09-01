import { StatPill } from './StatPill'
import { CodeGhostText } from './CodeGhostText'
import { formatPercent } from '../../utils/formatters'

export function PlayerPanel({
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
  isError
}) {
  const isOpponent = side === 'opponent'

  const panelRing = isActive
    ? isFocused
      ? 'border-indigo-500/40 shadow-md'
      : 'border-slate-800'
    : 'border-slate-850 opacity-90'

  return (
    <article className={['glass-card relative overflow-hidden p-5 sm:p-6 transition-all duration-300', panelRing].join(' ')}>
      <header className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={
              [
                'grid h-10 w-10 place-items-center rounded-full border',
                'border-slate-800 bg-slate-900 font-semibold text-sm text-slate-300',
                isActive ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5' : '',
              ].join(' ')
            }
            aria-hidden="true"
          >
            {player.avatarText}
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-500">
              {title}
            </div>
            <div className="mt-0.5 text-base font-semibold text-slate-200">
              {player.username}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
          <StatPill label="Progress" value={formatPercent(progressPercent)} tone="info" />
          <StatPill label="WPM" value={wpm} tone="neutral" />
          <div className="hidden sm:block">
            <StatPill label="Accuracy" value={accuracy} tone="good" />
          </div>
          <div className="hidden sm:block">
            <StatPill label="Time" value={elapsed} tone="neutral" />
          </div>
        </div>
      </header>

      {/* Compiler terminal mockup */}
      <section className={['relative mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/45 overflow-hidden', isError ? 'animate-shake border-rose-500/50' : ''].join(' ')}>
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800/60 text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500/30"></span>
            <span className="h-2 w-2 rounded-full bg-yellow-500/30"></span>
            <span className="h-2 w-2 rounded-full bg-green-500/30"></span>
            <span className="ml-2 font-mono text-[10px] text-slate-500">{isOpponent ? 'Opponent View' : 'Your Editor'}</span>
          </div>
          <span className="text-[9px] font-mono text-slate-600">UTF-8</span>
        </div>

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
              'relative max-w-full overflow-auto p-4 sm:p-5 font-mono min-h-[160px] outline-none transition scrollbar-thin',
              isOpponent
                ? 'cursor-default opacity-85'
                : isFocused
                  ? 'bg-slate-950/60 border-indigo-500/10'
                  : 'bg-slate-950/30 hover:bg-slate-950/40',
            ].join(' ')
          }
        >
          {!isOpponent && !isFocused && cursorIndex === 0 ? (
            <div className="pointer-events-none absolute inset-x-4 top-4 rounded-lg border border-indigo-500/10 bg-slate-950/90 px-4 py-3 text-xs text-indigo-300 backdrop-blur-sm sm:inset-x-5">
              <span className="font-semibold text-indigo-400">Typing Match Guide</span>
              <div className="mt-1 text-slate-400">Click in this code window and start typing the snippet text.</div>
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

        {/* Progress track at bottom of editor */}
        <div className="h-[2px] bg-slate-900 w-full relative">
          <div 
            className={['absolute top-0 left-0 h-full transition-[width] duration-300', isOpponent ? 'bg-indigo-500' : 'bg-emerald-500'].join(' ')} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      <footer className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div>
          {isOpponent ? 'Stream: Active' : 'Input: Synced'}
        </div>
        <div>
          {isOpponent ? 'Live Sync' : 'Auto Saving'}
        </div>
      </footer>
    </article>
  )
}
