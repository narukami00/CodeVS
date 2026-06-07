import { createContext, useContext, useEffect, useState } from 'react'
import { auth, firestore } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // API calls (now targeting Firestore)
  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(firestore, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return docSnap.data()
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Auth functions
  const register = async (email, password, username) => {
    // 1. Check if username is taken in Firestore
    const usersRef = collection(firestore, 'users')
    const q = query(usersRef, where('username', '==', username))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      throw new Error('This username is already taken.')
    }

    // 2. Create Auth user via Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // 3. Create Firestore DB record
    const profileData = {
      username: username,
      email: email,
      quick_match_count: 0,
      average_wpm: 0,
      created_at: serverTimestamp()
    }
    
    await setDoc(doc(firestore, 'users', firebaseUser.uid), profileData)
    
    return userCredential
  }

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch from Firestore
          const profile = await fetchUserProfile(firebaseUser.uid)
          
          setUser({
            ...firebaseUser,
            ...profile,
          })
        } catch (err) {
          console.error("Error setting up user:", err);
          setUser(firebaseUser); // Fallback
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

