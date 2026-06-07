import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../firebase'

/**
 * Fetches the snippet_metadata for a given language from Firestore,
 * and randomly selects one snippet ID.
 */
export const getRandomSnippetId = async (language) => {
  try {
    const metaRef = doc(firestore, 'snippet_metadata', language)
    const metaSnap = await getDoc(metaRef)
    
    if (metaSnap.exists()) {
      const { ids } = metaSnap.data()
      if (ids && ids.length > 0) {
        const randomIndex = Math.floor(Math.random() * ids.length)
        return ids[randomIndex]
      }
    }
    
    console.warn(`No snippet IDs found in metadata for language: ${language}`)
    return 'fallback-snippet-id'
  } catch (error) {
    console.error(`Error fetching snippet metadata for ${language}:`, error)
    return 'fallback-snippet-id'
  }
}
