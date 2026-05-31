import { useMemo, useState } from 'react'
import { languageOptions } from '../data/languages'
import { getSnippetsByLanguage } from '../data/snippetBank'

function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState('random')

  const handleQuickMatch = (language) => {
    console.log('[Home] Quick Match', { language })
  }

  const handleCreateRoom = (language) => {
    console.log('[Home] Create Room', { language })
  }

  const handleJoinRoom = () => {
    console.log('[Home] Join Room')
  }

  const selectedLanguageLabel =
    languageOptions.find((opt) => opt.value === selectedLanguage)?.label ??
    'Random'

  const previewSnippets = useMemo(() => {
    if (selectedLanguage === 'random') return []
    return getSnippetsByLanguage(selectedLanguage)
  }, [selectedLanguage])

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

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-12 sm:py-14">
        <div className="cyber-entrance w-full">
          <header className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/40 px-4 py-1.5 text-sm text-slate-200 backdrop-blur">
              <span className="font-mono text-emerald-300/90">CONNECTED</span>
              <span className="h-1 w-1 rounded-full bg-emerald-300/90" />
              <span className="text-slate-300">Play Hub</span>
            </div>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-slate-100 sm:text-6xl">
              Enter the arena
              <span className="cyber-cursor ml-2 align-middle" aria-hidden="true">
                _
              </span>
            </h1>
            <p className="mt-4 text-pretty text-base text-slate-300 sm:text-lg">
              Pick a language, then choose how you want to compete.
            </p>
          </header>

          <div className="mx-auto mt-10 grid w-full max-w-5xl gap-7">
            {/* Language picker */}
            <section
              aria-label="Language selection"
              className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur sm:p-7"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-mono text-base font-semibold tracking-wide text-slate-100">
                    LANGUAGE SELECT
                  </h2>
                  <p className="mt-1.5 text-base text-slate-300">
                    Used for <span className="text-slate-100">Quick Match</span>{' '}
                    and <span className="text-slate-100">Create Room</span>. Join
                    Room uses the host’s language.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3.5">
                  <div className="text-xs text-slate-400">Selected</div>
                  <div className="font-mono text-base text-cyan-300">
                    {selectedLanguageLabel}
                  </div>
                </div>
              </div>

              <div
                role="group"
                aria-label="Available languages"
                className="mt-5 flex flex-wrap gap-2.5"
              >
                {languageOptions.map((opt) => {
                  const isActive = opt.value === selectedLanguage
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedLanguage(opt.value)}
                      className={
                        [
                          'rounded-full border px-4 py-2.5 text-base transition',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70',
                          isActive
                            ? 'border-cyan-300/70 bg-cyan-400 text-slate-950 ring-1 ring-cyan-300/60'
                            : 'border-slate-800 bg-slate-950/30 text-slate-200 hover:border-cyan-400/40 hover:bg-slate-950/60',
                          'font-mono',
                        ].join(' ')
                      }
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Temporary snippet preview for verification */}
            <section
              aria-label="Snippet preview"
              className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur sm:p-7"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-mono text-base font-semibold tracking-wide text-slate-100">
                    SNIPPET BANK PREVIEW
                    <span className="ml-2 rounded-full border border-white/10 bg-slate-950/50 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                      DEV
                    </span>
                  </h2>
                  <p className="mt-1.5 text-base text-slate-300">
                    Temporary preview for verifying the bundled snippet bank.
                  </p>
                </div>

                <div className="font-mono text-xs text-slate-400">
                  ACTIVE: <span className="text-slate-100">{selectedLanguageLabel}</span>
                </div>
              </div>

              {selectedLanguage === 'random' ? (
                <div className="mt-5 rounded-xl border border-white/5 bg-slate-950/40 p-4 text-base text-slate-300">
                  Random will choose from the available snippet bank during
                  matchmaking.
                </div>
              ) : previewSnippets.length === 0 ? (
                <div className="mt-5 rounded-xl border border-white/5 bg-slate-950/40 p-4 text-base text-slate-300">
                  No preview snippets available for this language yet.
                </div>
              ) : (
                <div className="mt-5">
                  <div className="mb-3 text-xs text-slate-400">
                    Showing <span className="text-slate-200">{previewSnippets.length}</span> snippets
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {previewSnippets.map((snippet) => (
                      <article
                        key={snippet.id}
                        className="rounded-2xl border border-white/5 bg-slate-950/35 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-100">
                              {snippet.title}
                            </h3>
                            <div className="mt-1 font-mono text-[11px] text-slate-400">
                              {snippet.id} • {snippet.language}
                            </div>
                          </div>
                        </div>

                        <pre className="mt-3 max-h-56 overflow-auto rounded-xl border border-white/5 bg-slate-950/60 p-3.5 text-sm leading-relaxed text-slate-200">
                          <code className="terminal-text">{snippet.code}</code>
                        </pre>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Actions */}
            <section aria-label="Play options" className="grid gap-4 sm:gap-5">
              <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
                <button
                  type="button"
                  onClick={() => handleQuickMatch(selectedLanguage)}
                  className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-left backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-950/60 hover:ring-1 hover:ring-cyan-400/30 active:translate-y-0 sm:p-7"
                  aria-label="Quick Match"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs tracking-widest text-slate-400">
                        MODE
                      </div>
                      <h3 className="mt-1 text-xl font-semibold text-slate-100">
                        Quick Match
                      </h3>
                    </div>
                    <span className="cyber-icon font-mono text-cyan-300">↳</span>
                  </div>
                  <p className="mt-3.5 text-base text-slate-300">
                    Find an opponent instantly and race to type.
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">
                      LANGUAGE: <span className="text-slate-200">{selectedLanguageLabel}</span>
                    </span>
                    <span className="rounded-full border border-cyan-400/30 bg-slate-950/50 px-3 py-1.5 text-sm text-cyan-300">
                      MATCH
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateRoom(selectedLanguage)}
                  className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-left backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-slate-950/60 hover:ring-1 hover:ring-emerald-400/30 active:translate-y-0 sm:p-7"
                  aria-label="Create Room"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs tracking-widest text-slate-400">
                        ROOM
                      </div>
                      <h3 className="mt-1 text-xl font-semibold text-slate-100">
                        Create Room
                      </h3>
                    </div>
                    <span className="cyber-icon font-mono text-emerald-300">+</span>
                  </div>
                  <p className="mt-3.5 text-base text-slate-300">
                    Host a private duel and share a room code.
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">
                      LANGUAGE: <span className="text-slate-200">{selectedLanguageLabel}</span>
                    </span>
                    <span className="rounded-full border border-emerald-400/30 bg-slate-950/50 px-3 py-1.5 text-sm text-emerald-300">
                      HOST
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleJoinRoom}
                  className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-left backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70 hover:-translate-y-0.5 hover:border-fuchsia-400/40 hover:bg-slate-950/60 hover:ring-1 hover:ring-fuchsia-400/30 active:translate-y-0 sm:p-7"
                  aria-label="Join Room"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs tracking-widest text-slate-400">
                        ROOM
                      </div>
                      <h3 className="mt-1 text-xl font-semibold text-slate-100">
                        Join Room
                      </h3>
                    </div>
                    <span className="cyber-icon font-mono text-fuchsia-300">
                      #
                    </span>
                  </div>
                  <p className="mt-3.5 text-base text-slate-300">
                    Enter a room code and sync to the host’s language.
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">
                      LANGUAGE: <span className="text-slate-200">HOST</span>
                    </span>
                    <span className="rounded-full border border-fuchsia-400/30 bg-slate-950/50 px-3 py-1.5 text-sm text-fuchsia-300">
                      JOIN
                    </span>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
