import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Lobby() {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [rooms, setRooms] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 5000)
    return () => clearInterval(interval)
  }, [])

  async function fetchRooms() {
    try {
      const res = await fetch('/api/rooms')
      const data = await res.json()
      setRooms(data.rooms || [])
    } catch {
      // silent
    }
  }

  async function createRoom() {
    if (!playerName.trim()) { setError('Enter your name'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName.trim() }),
      })
      const data = await res.json()
      navigate(`/game/${data.room_id}/${data.player_id}`)
    } catch {
      setError('Failed to create room')
    }
    setLoading(false)
  }

  async function joinRoom(code) {
    const targetCode = code || roomCode
    if (!playerName.trim()) { setError('Enter your name'); return }
    if (!targetCode.trim()) { setError('Enter room code'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: targetCode.trim(), player_name: playerName.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      navigate(`/game/${data.room_id}/${data.player_id}`)
    } catch {
      setError('Failed to join room')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-gold-400">Pocket</span>
              <span className="text-midnight-100">Aces</span>
            </h1>
            <p className="text-midnight-300 mt-2 text-sm tracking-widest uppercase">Texas Hold'em</p>
          </motion.div>
        </div>

        {/* Card */}
        <div className="bg-midnight-900/80 backdrop-blur-xl rounded-2xl border border-midnight-700/50 p-8 shadow-2xl shadow-black/40">
          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-midnight-300 uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full bg-midnight-950/60 border border-midnight-600/40 rounded-xl px-4 py-3
                         text-midnight-50 placeholder-midnight-500 outline-none
                         focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20
                         transition-all duration-300"
            />
          </div>

          {/* Create Room */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRoom}
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-midnight-950
                       font-semibold py-3.5 rounded-xl mb-6
                       hover:from-gold-400 hover:to-gold-500
                       disabled:opacity-50 transition-all duration-300
                       shadow-lg shadow-gold-500/20"
          >
            Create Room
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-midnight-700/50" />
            <span className="text-midnight-500 text-xs uppercase tracking-wider">or join</span>
            <div className="flex-1 h-px bg-midnight-700/50" />
          </div>

          {/* Join Room */}
          <div className="flex gap-3">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Room Code"
              maxLength={6}
              className="flex-1 bg-midnight-950/60 border border-midnight-600/40 rounded-xl px-4 py-3
                         text-midnight-50 placeholder-midnight-500 outline-none text-center
                         tracking-[0.3em] font-mono text-lg uppercase
                         focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20
                         transition-all duration-300"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => joinRoom()}
              disabled={loading}
              className="bg-midnight-700/60 border border-midnight-600/40 text-midnight-100
                         font-medium px-6 py-3 rounded-xl
                         hover:bg-midnight-600/60 hover:border-midnight-500/50
                         disabled:opacity-50 transition-all duration-300"
            >
              Join
            </motion.button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-chip-red text-sm mt-4 text-center"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Active Rooms */}
        {rooms.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <h3 className="text-midnight-400 text-xs uppercase tracking-wider mb-3 px-1">
              Active Tables
            </h3>
            <div className="space-y-2">
              {rooms.map((room) => (
                <motion.button
                  key={room.room_id}
                  whileHover={{ scale: 1.01, x: 4 }}
                  onClick={() => joinRoom(room.room_id)}
                  className="w-full flex items-center justify-between
                             bg-midnight-900/50 border border-midnight-700/30 rounded-xl px-5 py-3.5
                             hover:bg-midnight-800/50 hover:border-midnight-600/40
                             transition-all duration-300 text-left"
                >
                  <div>
                    <span className="text-midnight-100 font-mono font-medium">{room.room_id}</span>
                    <span className="text-midnight-500 text-sm ml-3">
                      {room.players.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-midnight-400 text-sm">
                      {room.player_count}/8
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      room.phase === 'waiting' ? 'bg-chip-green' : 'bg-gold-400'
                    }`} />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
