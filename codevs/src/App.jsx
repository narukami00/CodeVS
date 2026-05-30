import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Result from './pages/Result'
import Leaderboard from './pages/Leaderboard'

function App() {
  return (
    <>
      <Navbar />
      <main className="app-shell min-h-[calc(100vh-4rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game" element={<Game />} />
          <Route path="/result" element={<Result />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </>
  )
}

export default App
