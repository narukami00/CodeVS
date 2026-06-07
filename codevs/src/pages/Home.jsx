import { useMemo, useState } from 'react'
import { languageOptions } from '../data/languages'
import { useMatchmaking } from '../hooks/useMatchmaking'
import { useRooms } from '../hooks/useRooms'

function Home() {
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


             {/* Actions */}
             <section aria-label="Play options" className="grid gap-4 sm:gap-5">
               <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
                 <button
                   type="button"
                   disabled={isSearching || isProcessing}
                   onClick={() => handleQuickMatch(selectedLanguage)}
                   className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-left backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-950/60 hover:ring-1 hover:ring-cyan-400/30 active:translate-y-0 sm:p-7 disabled:opacity-50 disabled:hover:translate-y-0"
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
                   disabled={isSearching || isProcessing}
                   onClick={() => handleCreateRoom(selectedLanguage)}
                   className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-left backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-slate-950/60 hover:ring-1 hover:ring-emerald-400/30 active:translate-y-0 sm:p-7 disabled:opacity-50 disabled:hover:translate-y-0"
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
                   disabled={isSearching || isProcessing}
                   onClick={handleJoinRoom}
                   className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-left backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70 hover:-translate-y-0.5 hover:border-fuchsia-400/40 hover:bg-slate-950/60 hover:ring-1 hover:ring-fuchsia-400/30 active:translate-y-0 sm:p-7 disabled:opacity-50 disabled:hover:translate-y-0"
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

       {isSearching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="cyber-panel flex flex-col items-center justify-center p-8 text-center max-w-sm w-full mx-4">
            <div className="mb-6 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400"></div>
            <h2 className="mb-2 text-2xl font-bold text-white">Searching...</h2>
            <p className="mb-6 text-sm text-slate-400">Looking for an opponent in the <span className="text-cyan-300 font-mono">{selectedLanguageLabel}</span> queue.</p>
            <button
              onClick={cancelSearch}
              className="cyber-button cyber-button-secondary w-full"
            >
              ABORT SEARCH
            </button>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="cyber-panel max-w-sm w-full p-8 relative">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="mb-6 text-2xl font-bold text-white">Join Room</h2>
            
            {roomError && (
              <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
                {roomError}
              </div>
            )}

            <form onSubmit={submitJoinRoom}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Enter 6-Digit Room Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="cyber-input font-mono text-center tracking-widest text-lg uppercase"
                  placeholder="A3X9KP"
                />
              </div>
              <button
                disabled={isProcessing || joinCode.length !== 6}
                type="submit"
                className="cyber-button cyber-button-primary w-full justify-center disabled:opacity-50"
              >
                {isProcessing ? 'JOINING...' : 'JOIN ARENA'}
              </button>
            </form>
          </div>
        </div>
      )}
     </section>
   )
 }
 
 export default Home
