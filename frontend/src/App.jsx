import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Lobby from './pages/Lobby'
import Game from './pages/Game'

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/game/:roomId/:playerId" element={<Game />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
