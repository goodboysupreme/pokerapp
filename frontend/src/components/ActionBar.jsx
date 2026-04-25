import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ActionBar({ gameState, onAction }) {
  const [raiseAmount, setRaiseAmount] = useState('')
  const [showRaiseSlider, setShowRaiseSlider] = useState(false)

  if (!gameState) return null

  const me = gameState.players.find(p => p.id === gameState.your_id)
  if (!me || me.folded || me.all_in) return null
  if (gameState.current_player !== gameState.your_id) return null
  if (gameState.phase === 'waiting' || gameState.phase === 'showdown') return null

  const canCheck = gameState.current_bet <= me.current_bet
  const callAmount = gameState.current_bet - me.current_bet
  const minRaise = gameState.current_bet * 2

  function handleRaise() {
    if (showRaiseSlider) {
      const amount = parseInt(raiseAmount) || minRaise
      onAction('raise', Math.max(amount, minRaise))
      setShowRaiseSlider(false)
      setRaiseAmount('')
    } else {
      setRaiseAmount(String(minRaise))
      setShowRaiseSlider(true)
    }
  }

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 p-4 pb-6
                 bg-gradient-to-t from-midnight-950 via-midnight-950/95 to-transparent"
    >
      <div className="max-w-lg mx-auto">
        {/* Raise slider */}
        <AnimatePresence>
          {showRaiseSlider && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="flex items-center gap-3 bg-midnight-900/80 rounded-xl p-3 border border-midnight-700/40">
                <input
                  type="range"
                  min={minRaise}
                  max={me.chips + me.current_bet}
                  value={raiseAmount || minRaise}
                  onChange={(e) => setRaiseAmount(e.target.value)}
                  className="flex-1 accent-gold-400 h-1.5"
                />
                <input
                  type="number"
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(e.target.value)}
                  className="w-20 bg-midnight-950/60 border border-midnight-600/40 rounded-lg
                             px-3 py-1.5 text-center text-gold-400 font-mono text-sm outline-none
                             focus:border-gold-400/50"
                />
              </div>
              {/* Quick bet buttons */}
              <div className="flex gap-2 mt-2">
                {[0.5, 0.75, 1].map((fraction) => {
                  const amount = Math.floor(me.chips * fraction) + me.current_bet
                  return (
                    <button
                      key={fraction}
                      onClick={() => setRaiseAmount(String(Math.min(amount, me.chips + me.current_bet)))}
                      className="flex-1 text-xs py-1.5 bg-midnight-800/60 border border-midnight-600/30
                                 rounded-lg text-midnight-300 hover:text-gold-400 hover:border-gold-400/30
                                 transition-all duration-200"
                    >
                      {fraction === 1 ? 'All In' : `${fraction * 100}%`}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-2.5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAction('fold')}
            className="flex-1 py-3.5 rounded-xl font-medium text-sm
                       bg-midnight-800/60 border border-chip-red/30 text-chip-red
                       hover:bg-chip-red/10 hover:border-chip-red/50
                       transition-all duration-200"
          >
            Fold
          </motion.button>

          {canCheck ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction('check')}
              className="flex-1 py-3.5 rounded-xl font-medium text-sm
                         bg-midnight-800/60 border border-chip-blue/30 text-chip-blue
                         hover:bg-chip-blue/10 hover:border-chip-blue/50
                         transition-all duration-200"
            >
              Check
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction('call')}
              className="flex-1 py-3.5 rounded-xl font-medium text-sm
                         bg-midnight-800/60 border border-chip-green/30 text-chip-green
                         hover:bg-chip-green/10 hover:border-chip-green/50
                         transition-all duration-200"
            >
              Call {callAmount}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRaise}
            className={`flex-1 py-3.5 rounded-xl font-medium text-sm transition-all duration-200
                       ${showRaiseSlider
                         ? 'bg-gold-400 text-midnight-950 shadow-lg shadow-gold-400/20'
                         : 'bg-midnight-800/60 border border-gold-400/30 text-gold-400 hover:bg-gold-400/10 hover:border-gold-400/50'
                       }`}
          >
            {showRaiseSlider ? 'Confirm' : 'Raise'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
