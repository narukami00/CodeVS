import { memo } from 'react'

export const CodeGhostText = memo(function CodeGhostText({ snippet, mode, cursorIndex, charStates, progressIndex }) {
  const renderChar = (ch, index) => {
    const isCursor = mode === 'current' && index === cursorIndex

    let className = 'text-slate-500 relative'
    if (mode === 'current') {
      const state = charStates[index]
      if (state === 'c') {
        className = 'text-emerald-400 relative'
      } else if (state === 'e') {
        className = 'text-rose-400 bg-rose-500/10 rounded-[3px] relative'
      }
    } else {
      className =
        index < progressIndex
          ? 'text-indigo-400 relative font-medium'
          : 'text-slate-500 relative'
    }

    const caret = isCursor ? (
      <span
        aria-hidden="true"
        className="absolute -left-[1px] top-1/2 inline-block h-[1.3em] w-[2px] -translate-y-1/2 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"
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
    <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed sm:text-sm text-slate-400">
      <code>{Array.from(snippet).map(renderChar)}</code>
    </pre>
  )
})
