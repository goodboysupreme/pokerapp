import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useWebSocket from '../hooks/useWebSocket'
import Card from '../components/Card'
import PlayerSeat from '../components/PlayerSeat'
import ActionBar from '../components/ActionBar'
import ChatPanel from '../components/ChatPanel'

/**
 * Distribute players around an ellipse so "you" are always at the bottom centre.
 * Returns [{player, x, y}] in % of container.
 */
function layoutPlayers(players, myId) {
  const myIdx = players.findIndex(p => p.id === myId)
  const n = players.length
  const positions = []

  for (let i = 0; i < n; i++) {
    const rotated = (i - myIdx + n) % n   // 0 = me, always bottom
    // angle: bottom = π/2, go counter-clockwise
    const angle = Math.PI / 2 + (rotated / n) * 2 * Math.PI
    const rx = 40, ry = 36   // radii as % of container
    const x = 50 + rx * Math.cos(angle)
    const y = 50 + ry * Math.sin(angle)
    positions.push({ player: players[i], x, y })
  }
  return positions
}

export default function Game() {
  const { roomId, playerId } = useParams()
  const navigate = useNavigate()
  const { gameState, chatMessages, connected, startGame, sendAction, sendChat } = useWebSocket(roomId, playerId)

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-midnight-400 text-sm">Connecting to table…</p>
        </motion.div>
      </div>
    )
  }

  const players = gameState.players
  const isWaiting  = gameState.phase === 'waiting'
  const isShowdown = gameState.phase === 'showdown'
  const isMyTurn   = gameState.current_player === playerId
  const positions  = layoutPlayers(players, playerId)
  const dealerPlayer = gameState.dealer
  const timeRemaining = gameState.turn_time_remaining ?? 30
  const turnSeconds   = gameState.turn_seconds ?? 30

  return (
    <div className="min-h-screen flex flex-col select-none overflow-hidden">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-midnight-500 hover:text-midnight-300 transition-colors text-sm
                     flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Leave
        </button>

        {/* Game info pills */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-midnight-500 font-mono bg-midnight-900/50
                           border border-midnight-700/30 rounded-full px-2.5 py-0.5">
            {roomId}
          </span>
          {!isWaiting && (
            <span className="text-[11px] text-midnight-400 bg-midnight-900/50
                             border border-midnight-700/30 rounded-full px-2.5 py-0.5 capitalize">
              {gameState.phase}
            </span>
          )}
          <span className="text-[11px] text-midnight-500 bg-midnight-900/50
                           border border-midnight-700/30 rounded-full px-2.5 py-0.5">
            {gameState.small_blind}/{gameState.big_blind}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-chip-green' : 'bg-chip-red'}`} />
        </div>
      </div>

      {/* ── Poker table ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-3 py-2">
        <div className="relative w-full max-w-[680px]" style={{ aspectRatio: '16/9' }}>

          {/* Felt */}
          <div className="absolute inset-[7%] rounded-[50%]
                          bg-gradient-to-br from-felt-600 via-felt-700 to-felt-800
                          border-[7px] border-midnight-800/90
                          shadow-[inset_0_2px_40px_rgba(0,0,0,0.5),0_8px_60px_rgba(0,0,0,0.4)]" />
          {/* Inner ring */}
          <div className="absolute inset-[9%] rounded-[50%] border border-felt-500/20 pointer-events-none" />

          {/* Pot */}
          <AnimatePresence>
            {gameState.pot > 0 && (
              <motion.div
                key={gameState.pot}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-[30%] left-1/2 -translate-x-1/2 z-10
                           bg-midnight-950/80 backdrop-blur-sm border border-gold-400/25
                           rounded-full px-4 py-1"
              >
                <span className="text-gold-400 font-mono text-sm font-semibold">
                  ＄{gameState.pot.toLocaleString()}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Community cards */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10
                          flex gap-1.5">
            {gameState.community_cards.map((card, i) => (
              <Card key={`${card.rank}${card.suit}`} rank={card.rank} suit={card.suit} delay={i * 0.18} />
            ))}
            {/* Placeholder slots */}
            {Array.from({ length: 5 - gameState.community_cards.length }).map((_, i) => (
              <div key={`slot-${i}`}
                   className="w-14 h-[84px] rounded-lg border border-felt-500/20 bg-felt-800/30" />
            ))}
          </div>

          {/* Players */}
          {positions.map(({ player, x, y }) => (
            <div
              key={player.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <PlayerSeat
                player={player}
                isCurrentPlayer={gameState.current_player === player.id}
                isYou={player.id === playerId}
                isDealer={player.id === dealerPlayer}
                turnTimeRemaining={timeRemaining}
                turnSeconds={turnSeconds}
              />
            </div>
          ))}

          {/* Winner overlay */}
          <AnimatePresence>
            {isShowdown && gameState.winners && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0.75, y: 24 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                  className="bg-midnight-950/95 backdrop-blur-xl border border-gold-400/40
                             rounded-2xl px-8 py-6 text-center shadow-2xl shadow-black/60"
                >
                  {gameState.winners.map((w, i) => (
                    <div key={i} className={i > 0 ? 'mt-3 pt-3 border-t border-midnight-700/50' : ''}>
                      <p className="text-gold-400 font-bold text-lg tracking-tight">{w.name} wins!</p>
                      <p className="text-midnight-300 text-sm mt-0.5">
                        {w.hand}
                        <span className="text-chip-green font-mono ml-2">+{w.chips_won.toLocaleString()}</span>
                      </p>
                    </div>
                  ))}
                  <p className="text-midnight-600 text-xs mt-4">Next hand starting…</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Waiting / Start ───────────────────────────────────── */}
      {isWaiting && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 pb-8 px-6 text-center"
        >
          <p className="text-midnight-500 text-sm mb-4">
            {players.length < 2
              ? 'Waiting for players to join…'
              : `${players.length} player${players.length > 1 ? 's' : ''} at the table`}
          </p>
          {players.length >= 2 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={startGame}
              className="bg-gradient-to-r from-gold-500 to-gold-400 text-midnight-950
                         font-semibold py-3.5 px-14 rounded-xl
                         shadow-lg shadow-gold-400/20 transition-all duration-300"
            >
              Deal Cards
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Your turn nudge */}
      <AnimatePresence>
        {isMyTurn && !isWaiting && !isShowdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40
                       bg-gold-400/10 border border-gold-400/40 backdrop-blur-sm
                       rounded-full px-4 py-1.5 text-gold-400 text-xs font-semibold tracking-wide"
          >
            Your turn
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {!isWaiting && !isShowdown && (
        <ActionBar gameState={gameState} onAction={sendAction} />
      )}

      {/* Chat */}
      <ChatPanel messages={chatMessages} onSend={sendChat} />
    </div>
  )
}
