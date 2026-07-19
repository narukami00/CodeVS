import { useState, useEffect, useMemo, useCallback } from 'react'
import { ref, update, runTransaction } from 'firebase/database'
import { db } from '../firebase'
import { formatPercent, formatTime } from '../utils/formatters'

export function useGameEngine(snippet, roomId, user, roomWinner, isLocked = false) {
  const [cursorIndex, setCursorIndex] = useState(0)
  const [charStates, setCharStates] = useState([])
  const [isError, setIsError] = useState(false)

  const [startedAt, setStartedAt] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)

  // Reset when snippet changes
  useEffect(() => {
    if (!snippet) return
    setCharStates(Array.from({ length: snippet.length }, () => ''))
    setCursorIndex(0)
    setStartedAt(null)
    setElapsedSeconds(0)
    setTotalKeystrokes(0)
    setCorrectKeystrokes(0)
  }, [snippet])

  // Timer
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

  const currentProgressPercent = snippet ? (cursorIndex / snippet.length) * 100 : 0

  const handleKeyDown = useCallback((e) => {
    if (e.defaultPrevented || roomWinner || !snippet || !user || isLocked) return
    if (e.ctrlKey || e.metaKey || e.altKey) return

    const key = e.key
    if (key === 'Escape') return

    if (key === 'Tab') {
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
        
        // Sync progress regression
        update(ref(db, `rooms/${roomId}/players/${user.uid}`), { progress: nextIndex })
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

      // Sync progress to Firebase
      update(ref(db, `rooms/${roomId}/players/${user.uid}`), { progress: nextIndex })

      if (nextIndex >= snippet.length) {
        runTransaction(ref(db, `rooms/${roomId}`), (currentData) => {
           if (currentData === null) return currentData;
           if (currentData.winner) return;
           currentData.winner = user.uid;
           return currentData;
        })
      }
      return
    }

    // Wrong key: mark error, do NOT advance cursor.
    setCharStates((prev) => {
      const next = [...prev]
      next[cursorIndex] = 'e'
      return next
    })
    
    // Trigger shake animation
    setIsError(true)
    setTimeout(() => setIsError(false), 400)

  }, [snippet, cursorIndex, startedAt, roomId, user, roomWinner, isLocked])

  return {
    cursorIndex,
    charStates,
    isError,
    wpmValue,
    accuracyValue,
    elapsedLabel,
    currentProgressPercent,
    handleKeyDown,
    rawStats: {
      elapsedSeconds,
      correctChars,
      totalKeystrokes,
      correctKeystrokes
    }
  }
}
