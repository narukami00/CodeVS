import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set, update } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useRooms() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [roomError, setRoomError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const createRoom = async (language) => {
    if (!user) {
      alert("Please login to play.");
      return;
    }
    
    setIsProcessing(true);
    setRoomError('');
    
    try {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      let resolvedLanguage = language;
      if (language === 'random') {
         const langs = ['cpp', 'python', 'javascript', 'java', 'php'];
         resolvedLanguage = langs[Math.floor(Math.random() * langs.length)];
      }

      const roomRef = ref(db, `rooms/${roomId}`);
      
      await set(roomRef, {
        creatorUID: user.uid,
        language: language,
        resolvedLanguage: resolvedLanguage,
        status: 'waiting',
        matchType: 'private',
        statEligible: false, // Private rooms are never stat eligible
        players: {
          [user.uid]: { ready: false, progress: 0 }
        }
      });

      navigate(`/lobby?roomId=${roomId}`);
    } catch (err) {
      console.error("Failed to create room:", err);
      setRoomError("Failed to create room.");
    } finally {
      setIsProcessing(false);
    }
  };

  const joinRoom = async (roomIdToJoin) => {
    if (!user) {
      alert("Please login to play.");
      return;
    }

    if (!roomIdToJoin || roomIdToJoin.length !== 6) {
      setRoomError("Room code must be 6 characters.");
      return;
    }

    const roomId = roomIdToJoin.toUpperCase();
    setIsProcessing(true);
    setRoomError('');

    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      const snap = await get(roomRef);
      
      if (!snap.exists()) {
        setRoomError("Room not found. Check the ID and try again.");
        setIsProcessing(false);
        return;
      }
      
      const currentData = snap.val();
      
      if (currentData.status !== 'waiting') {
        setRoomError("This room is already active or finished.");
        setIsProcessing(false);
        return;
      }

      const playerUids = Object.keys(currentData.players || {});
      if (playerUids.length >= 2 && !playerUids.includes(user.uid)) {
        setRoomError("This room is already full.");
        setIsProcessing(false);
        return;
      }

      // If we aren't already in the room, add ourselves
      if (!playerUids.includes(user.uid)) {
        const updates = {};
        updates[`players/${user.uid}`] = { ready: false, progress: 0 };
        updates[`status`] = 'full';
        
        await update(roomRef, updates);
      }

      // Success! Navigate to lobby
      navigate(`/lobby?roomId=${roomId}`);
    } catch (err) {
      console.error("Failed to join room:", err);
      setRoomError("An error occurred while joining the room.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearRoomError = () => setRoomError('');

  return { createRoom, joinRoom, isProcessing, roomError, clearRoomError };
}
