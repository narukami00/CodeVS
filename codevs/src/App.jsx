import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Result from './pages/Result'
import Leaderboard from './pages/Leaderboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="app-shell min-h-[calc(100vh-4rem)]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
          <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </AuthProvider>
  )
}

export default App
