import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useWebSocket from '../hooks/useWebSocket'
import Card from '../components/Card'
import PlayerSeat from '../components/PlayerSeat'
import ActionBar from '../components/ActionBar'
import ChatPanel from '../components/ChatPanel'

// Position players around an elliptical table
function getPlayerPositions(count, myIndex) {
  // Reorder so "me" is always at the bottom
  const positions = []
  const angleOffset = -Math.PI / 2 // Start from bottom

  for (let i = 0; i < count; i++) {
    const idx = (i + myIndex) % count
    const angle = angleOffset + (i / count) * 2 * Math.PI
    const x = 50 + 38 * Math.cos(angle)
    const y = 50 + 38 * Math.sin(angle)
    positions.push({ idx, x, y })
  }
  return positions
}

export default function Game() {
  const { roomId, playerId } = useParams()
  const navigate = useNavigate()
  const { gameState, chatMessages, connected, startGame, sendAction, sendChat } = useWebSocket(roomId, playerId)

  if (!connected && !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full
                          animate-spin mx-auto mb-4" />
          <p className="text-midnight-400 text-sm">Connecting to table...</p>
        </motion.div>
      </div>
    )
  }

  if (!gameState) return null

  const myIndex = gameState.players.findIndex(p => p.id === playerId)
  const players = gameState.players
  const positions = getPlayerPositions(players.length, myIndex)
  const isWaiting = gameState.phase === 'waiting'
  const isShowdown = gameState.phase === 'showdown'
  const dealerIdx = gameState.players.findIndex(p => p.id === gameState.dealer)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="text-midnight-400 hover:text-midnight-200 transition-colors text-sm
                     flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Leave
        </motion.button>

        <div className="flex items-center gap-3">
          <span className="text-midnight-500 text-xs font-mono">{roomId}</span>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-chip-green' : 'bg-chip-red'}`} />
        </div>
      </div>

      {/* Poker Table */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-2xl aspect-[16/10]">
          {/* Table felt */}
          <div className="absolute inset-[8%] rounded-[50%]
                          bg-gradient-to-br from-felt-600 to-felt-800
                          border-[6px] border-midnight-700/80
                          shadow-[inset_0_4px_30px_rgba(0,0,0,0.4),0_0_60px_rgba(0,0,0,0.3)]" />

          {/* Table inner ring */}
          <div className="absolute inset-[10%] rounded-[50%]
                          border border-felt-500/30" />

          {/* Pot */}
          {gameState.pot > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-[35%] left-1/2 -translate-x-1/2
                         bg-midnight-900/70 backdrop-blur-sm border border-gold-400/30
                         rounded-full px-4 py-1.5 z-10"
            >
              <span className="text-gold-400 font-mono text-sm font-medium">
                Pot: {gameState.pot.toLocaleString()}
              </span>
            </motion.div>
          )}

          {/* Community Cards */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2
                          flex gap-1.5 z-10">
            {gameState.community_cards.map((card, i) => (
              <Card key={`${card.rank}-${card.suit}`} rank={card.rank} suit={card.suit} delay={i * 0.2} small />
            ))}
          </div>

          {/* Phase indicator */}
          {!isWaiting && (
            <div className="absolute top-[22%] left-1/2 -translate-x-1/2 z-10">
              <span className="text-midnight-400 text-[10px] uppercase tracking-widest font-medium">
                {gameState.phase}
              </span>
            </div>
          )}

          {/* Players */}
          {positions.map(({ idx, x, y }) => {
            const player = players[idx]
            if (!player) return null
            return (
              <div
                key={player.id}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <PlayerSeat
                  player={player}
                  isCurrentPlayer={gameState.current_player === player.id}
                  isYou={player.id === playerId}
                  dealerIdx={dealerIdx}
                  playerIdx={idx}
                  totalPlayers={players.length}
                />
              </div>
            )
          })}

          {/* Winners overlay */}
          <AnimatePresence>
            {isShowdown && gameState.winners && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="bg-midnight-900/95 backdrop-blur-xl border border-gold-400/40
                             rounded-2xl px-8 py-6 text-center shadow-2xl"
                >
                  {gameState.winners.map((w, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <p className="text-gold-400 font-bold text-lg">{w.name} wins!</p>
                      <p className="text-midnight-300 text-sm">
                        {w.hand} — <span className="text-chip-green font-mono">+{w.chips_won}</span>
                      </p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Start Game / Waiting */}
      {isWaiting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-6
                     bg-gradient-to-t from-midnight-950 to-transparent"
        >
          <div className="max-w-lg mx-auto text-center">
            <p className="text-midnight-400 text-sm mb-4">
              {players.length < 2
                ? 'Waiting for more players...'
                : `${players.length} players at the table`
              }
            </p>
            {players.length >= 2 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startGame}
                className="bg-gradient-to-r from-gold-500 to-gold-400 text-midnight-950
                           font-semibold py-3.5 px-12 rounded-xl
                           shadow-lg shadow-gold-500/20
                           hover:from-gold-400 hover:to-gold-500
                           transition-all duration-300"
              >
                Deal Cards
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Action Bar */}
      {!isWaiting && !isShowdown && (
        <ActionBar gameState={gameState} onAction={sendAction} />
      )}

      {/* Chat */}
      <ChatPanel messages={chatMessages} onSend={sendChat} />
    </div>
  )
}
