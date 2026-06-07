import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, runTransaction, set, onValue, onDisconnect, serverTimestamp, remove, update } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useMatchmaking() {
  const [isSearching, setIsSearching] = useState(false);
  const [matchLanguage, setMatchLanguage] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const disconnectHookRef = useRef(null);
  const isClaimingRef = useRef(false);

  const cancelSearch = async () => {
    if (!user || !matchLanguage) return;
    
    // Cancel the disconnect hook if it exists
    if (disconnectHookRef.current) {
      disconnectHookRef.current.cancel();
      disconnectHookRef.current = null;
    }

    // Remove self from queue
    const myQueueRef = ref(db, `queues/${matchLanguage}/${user.uid}`);
    await remove(myQueueRef);
    
    setIsSearching(false);
    setMatchLanguage(null);
    isClaimingRef.current = false;
  };

  useEffect(() => {
    if (!isSearching || !user || !matchLanguage) return;

    let timeoutId;
    let unsubscribeResult = null;
    let unsubscribeQueue = null;
    isClaimingRef.current = false;

    const startMatchmaking = async () => {
      try {
        // 1. Enter the queue
        const myQueueRef = ref(db, `queues/${matchLanguage}/${user.uid}`);
        await set(myQueueRef, { joinedAt: serverTimestamp() });
        
        // Setup disconnect hook
        const onDisconnectRef = onDisconnect(myQueueRef);
        await onDisconnectRef.remove();
        disconnectHookRef.current = onDisconnectRef;

        // 2. Listen for someone creating a room for us
        const myResultRef = ref(db, `matchmaking_results/${user.uid}`);
        unsubscribeResult = onValue(myResultRef, (snap) => {
          if (snap.exists()) {
            const roomId = snap.val();
            // Clear the notification
            remove(myResultRef);
            
            // Cancel disconnect hook because we matched
            if (disconnectHookRef.current) {
              disconnectHookRef.current.cancel();
              disconnectHookRef.current = null;
            }
            
            setIsSearching(false);
            setMatchLanguage(null);
            navigate(`/lobby?roomId=${roomId}`);
          }
        });

        // 3. Actively watch the queue for opponents
        const queueListRef = ref(db, `queues/${matchLanguage}`);
        unsubscribeQueue = onValue(queueListRef, async (snap) => {
          // If we are already claiming someone, or no longer searching, ignore updates
          if (isClaimingRef.current || !isSearching) return;
          
          if (!snap.exists()) return;
          const waitingUsers = snap.val();
          
          // Find the first user who is not us and not already claimed
          const opponentUid = Object.keys(waitingUsers).find(
            uid => uid !== user.uid && !waitingUsers[uid]._claim
          );

          if (opponentUid) {
            // TIE-BREAKER: To prevent both players from simultaneously claiming each other and creating 
            // two separate rooms, we enforce a strict rule: Only the player with the LARGER UID creates the room.
            if (user.uid < opponentUid) {
               // We have the smaller UID. We do nothing and wait for them to claim us!
               return;
            }

            isClaimingRef.current = true; // Lock local claiming state
            
            const opponentRef = ref(db, `queues/${matchLanguage}/${opponentUid}`);
            
            // Transaction to claim the opponent safely
            const result = await runTransaction(opponentRef, (currentData) => {
              if (currentData === null) {
                // Opponent might have just left or local cache is empty.
                // Write a dummy claim to check against server.
                return { _claim: user.uid }; 
              }
              if (currentData._claim) {
                return; // Already claimed by someone else
              }
              currentData._claim = user.uid; // Claim them
              return currentData;
            });

            if (result.committed) {
              const finalData = result.snapshot.val();
              
              if (finalData && finalData.joinedAt) {
                // Successfully claimed a real opponent!
                
                const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
                const roomRef = ref(db, `rooms/${roomId}`);
                
                // Random language resolution if 'random' queue
                let resolvedLanguage = matchLanguage;
                if (matchLanguage === 'random') {
                   const langs = ['cpp', 'python', 'javascript', 'java', 'php'];
                   resolvedLanguage = langs[Math.floor(Math.random() * langs.length)];
                }

                // Create the room
                await set(roomRef, {
                  creatorUID: user.uid,
                  language: matchLanguage,
                  resolvedLanguage: resolvedLanguage,
                  status: 'full',
                  matchType: 'quickmatch',
                  statEligible: matchLanguage === 'random',
                  players: {
                    [user.uid]: { ready: false, progress: 0 },
                    [opponentUid]: { ready: false, progress: 0 }
                  }
                });

                // Notify opponent via their result node
                await set(ref(db, `matchmaking_results/${opponentUid}`), roomId);

                // Clean up both queue nodes
                await remove(opponentRef);
                await remove(myQueueRef);
                
                if (disconnectHookRef.current) {
                  disconnectHookRef.current.cancel();
                  disconnectHookRef.current = null;
                }

                // Navigate to lobby
                setIsSearching(false);
                setMatchLanguage(null);
                navigate(`/lobby?roomId=${roomId}`);
                return;
              } else {
                // Ghost node: The server was actually null, but our transaction wrote `_claim`.
                // We must clean up this ghost node we accidentally created.
                await remove(opponentRef);
              }
            }
            
            // If we get here, claiming failed (someone else got them, or ghost).
            // Unlock and try again on next queue update.
            isClaimingRef.current = false;
          }
        });

      } catch (err) {
        console.error("Matchmaking error:", err);
        cancelSearch();
      }
    };

    startMatchmaking();

    // Timeout after 60 seconds
    timeoutId = setTimeout(() => {
      cancelSearch();
      alert("No opponent found within 60 seconds. Please try again.");
    }, 60000);

    return () => {
      clearTimeout(timeoutId);
      if (unsubscribeResult) unsubscribeResult();
      if (unsubscribeQueue) unsubscribeQueue();
      
      if (isSearching) {
         remove(ref(db, `queues/${matchLanguage}/${user.uid}`));
         if (disconnectHookRef.current) {
           disconnectHookRef.current.cancel();
           disconnectHookRef.current = null;
         }
      }
    };
  }, [isSearching, matchLanguage, user, navigate]);

  const startQuickMatch = (language) => {
    if (!user) {
      alert("Please login to play.");
      return;
    }
    setMatchLanguage(language);
    setIsSearching(true);
  };

  return { startQuickMatch, cancelSearch, isSearching };
}
