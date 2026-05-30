import cSnippetsRaw from './snippets/c.json'
import cppSnippetsRaw from './snippets/cpp.json'
import javaSnippetsRaw from './snippets/java.json'
import javascriptSnippetsRaw from './snippets/javascript.json'
import phpSnippetsRaw from './snippets/php.json'
import pythonSnippetsRaw from './snippets/python.json'

function withLanguage(language, snippets) {
  return (snippets ?? []).map((s) => ({
    ...s,
    language: s.language ?? language,
  }))
}

export const snippetBank = {
  c: withLanguage('c', cSnippetsRaw),
  cpp: withLanguage('cpp', cppSnippetsRaw),
  java: withLanguage('java', javaSnippetsRaw),
  javascript: withLanguage('javascript', javascriptSnippetsRaw),
  php: withLanguage('php', phpSnippetsRaw),
  python: withLanguage('python', pythonSnippetsRaw),
}

export function getSnippetsByLanguage(language) {
  return snippetBank[language] ?? []
}

export function getRandomSnippet(language) {
  const snippets = getSnippetsByLanguage(language)
  if (!snippets.length) return null
  return snippets[Math.floor(Math.random() * snippets.length)]
}

// TODO(matchmaking): after matchmaking/room creation resolves the final language,
// call `getRandomSnippet(resolvedLanguage)` and store the returned snippet `id`
// in Firebase RTDB as part of the match/room record.
