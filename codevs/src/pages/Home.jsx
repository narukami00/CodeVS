import { useMemo, useState } from 'react'
import { languageOptions } from '../data/languages'
import { useMatchmaking } from '../hooks/useMatchmaking'
import { useRooms } from '../hooks/useRooms'
import { useAuth } from '../contexts/AuthContext'



function Home() {
  const { user } = useAuth()
  const [selectedLanguage, setSelectedLanguage] = useState('random')
  const { startQuickMatch, cancelSearch, isSearching } = useMatchmaking()
  const { createRoom, joinRoom, isProcessing, roomError, clearRoomError } = useRooms()
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  const handleQuickMatch = (language) => {
    startQuickMatch(language)
  }

  const handleCreateRoom = (language) => {
    createRoom(language)
  }

  const handleJoinRoom = () => {
    setShowJoinModal(true)
    setJoinCode('')
    clearRoomError()
  }

  const submitJoinRoom = (e) => {
    e.preventDefault()
    joinRoom(joinCode)
  }

  const selectedLanguageLabel =
    languageOptions.find((opt) => opt.value === selectedLanguage)?.label ??
    'Random'

  return (
    <section className="relative isolate">
      {/* Background overlays (mesh + grid + vignette) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-mesh absolute inset-0" />
        <div className="bg-grid absolute inset-0" />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-8 sm:py-12 relative z-10">
        <div className="animate-entrance w-full">
          <header className="mx-auto max-w-3xl text-center mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-950/20 px-3.5 py-1.5 text-xs text-indigo-300 backdrop-blur font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Status: Authenticated</span>
            </div>

            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
              Welcome, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{user?.username || 'Developer'}</span>
            </h1>
            <p className="mt-3 text-pretty text-sm text-slate-400 max-w-lg mx-auto">
              Select your programming language and choose a game mode to start a typing challenge.
            </p>
          </header>

          <div className="mx-auto mt-8 grid w-full max-w-5xl gap-6">
            {/* Language picker */}
            <section
              aria-label="Language selection"
              className="glass-card p-5 sm:p-6 mb-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    Select Language
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Choose a language for your typing challenge.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-1.5 border-l-2 border-l-indigo-500 min-w-[120px]">
                  <div className="text-[10px] text-slate-500 font-medium">Selected</div>
                  <div className="text-sm font-bold text-indigo-400">
                    {selectedLanguageLabel}
                  </div>
                </div>
              </div>

              <div
                role="group"
                aria-label="Available languages"
                className="mt-4 flex flex-wrap gap-2"
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
                          'rounded-full border px-4 py-1.5 text-xs font-medium transition duration-200 cursor-pointer',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
                          isActive
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                            : 'border-slate-850 bg-slate-900/10 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/40',
                        ].join(' ')
                      }
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Game Modes */}
            <div className="grid gap-6">
              {/* Modes Selection */}
              <section aria-label="Play options" className="grid gap-4 lg:grid-cols-3">
                <button
                  type="button"
                  disabled={isSearching || isProcessing}
                  onClick={() => handleQuickMatch(selectedLanguage)}
                  className="glass-card group p-5 text-left hover:border-indigo-500/40 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer w-full"
                  aria-label="Quick Match"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                          Quick Match
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                          Auto-match with an active opponent in the global queue.
                        </p>
                      </div>
                    </div>
                    <span className="text-indigo-400/80 group-hover:translate-x-1 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                    <span className="text-[11px] text-slate-500">
                      Language: <span className="text-slate-300 font-semibold">{selectedLanguageLabel}</span>
                    </span>
                    <span className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 px-2.5 py-1 text-[11px] font-medium text-indigo-300">
                      Find Opponent
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isSearching || isProcessing}
                  onClick={() => handleCreateRoom(selectedLanguage)}
                  className="glass-card group p-5 text-left hover:border-emerald-500/40 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer w-full"
                  aria-label="Create Room"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                          Create Custom Room
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                          Host a private coding room and invite friends using a join code.
                        </p>
                      </div>
                    </div>
                    <span className="text-emerald-400/80 group-hover:translate-x-1 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                    <span className="text-[11px] text-slate-500">
                      Language: <span className="text-slate-300 font-semibold">{selectedLanguageLabel}</span>
                    </span>
                    <span className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                      Host Room
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isSearching || isProcessing}
                  onClick={handleJoinRoom}
                  className="glass-card group p-5 text-left hover:border-sky-500/40 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer w-full"
                  aria-label="Join Room"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m-5 0a2 2 0 012 2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2M9 9a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2v-8a2 2 0 00-2-2H9z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">
                          Join via Room Code
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                          Enter a 6-digit room code shared by a friend.
                        </p>
                      </div>
                    </div>
                    <span className="text-sky-400/80 group-hover:translate-x-1 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                    <span className="text-[11px] text-slate-500">
                      Mode: <span className="text-slate-300 font-semibold">Private Room</span>
                    </span>
                    <span className="rounded-lg border border-sky-500/20 bg-sky-950/20 px-2.5 py-1 text-[11px] font-medium text-sky-300">
                      Enter Code
                    </span>
                  </div>
                </button>
              </section>

            </div>
          </div>
        </div>
      </div>

      {isSearching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="dialog-panel flex flex-col items-center justify-center p-8 text-center max-w-sm w-full mx-4 border-slate-800/85">
            <div className="mb-6 h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            <h2 className="mb-2 text-lg font-bold text-white tracking-wide">Searching for Match...</h2>
            <p className="mb-6 text-xs text-slate-400">
              Finding an active opponent for <span className="text-indigo-400 font-semibold">{selectedLanguageLabel}</span>...
            </p>
            <button
              onClick={cancelSearch}
              className="btn btn-secondary w-full text-xs font-semibold cursor-pointer"
            >
              Cancel Search
            </button>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="dialog-panel max-w-sm w-full p-8 relative border-slate-850">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer text-base"
            >
              ✕
            </button>
            <h2 className="mb-6 text-xl font-bold text-white tracking-tight">Join Private Room</h2>
            
            {roomError && (
              <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs text-rose-400 font-semibold font-mono">
                Error: {roomError}
              </div>
            )}

            <form onSubmit={submitJoinRoom}>
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold text-slate-400">
                  Room Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="form-input font-mono text-center tracking-widest text-lg uppercase focus:border-indigo-500 focus:shadow-md"
                  placeholder="X9KP42"
                />
              </div>
              <button
                disabled={isProcessing || joinCode.length !== 6}
                type="submit"
                className="btn btn-primary w-full justify-center disabled:opacity-50 text-xs font-semibold cursor-pointer"
              >
                {isProcessing ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Home
