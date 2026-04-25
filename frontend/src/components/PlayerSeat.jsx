import { motion, AnimatePresence } from 'framer-motion'
import Card from './Card'
import Avatar from './Avatar'
import TurnTimer from './TurnTimer'

export default function PlayerSeat({
  player, isCurrentPlayer, isYou, isDealer,
  turnTimeRemaining, turnSeconds,
}) {
  const isActive = isCurrentPlayer && !player.folded && !player.all_in

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: player.folded ? 0.35 : 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-1"
    >
      {/* Hole cards */}
      <div className="flex gap-0.5 mb-0.5 h-[54px] items-end">
        {player.hole_cards ? (
          player.hole_cards.map((card, i) => (
            <Card key={i} rank={card.rank} suit={card.suit} delay={i * 0.12} small />
          ))
        ) : player.folded ? null : (
          <>
            <Card faceDown small delay={0} />
            <Card faceDown small delay={0.1} />
          </>
        )}
      </div>

      {/* Seat panel */}
      <div className={`relative rounded-2xl transition-all duration-400
                       ${isActive
                         ? 'bg-midnight-800 border-2 border-gold-400/70 shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                         : 'bg-midnight-800/80 border border-midnight-600/40'}
                       ${isYou ? 'ring-1 ring-inset ring-gold-400/15' : ''}`}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Avatar */}
          <div className="relative">
            <Avatar name={player.name} size={28} />
            {isDealer && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full
                               bg-gold-400 text-midnight-950 text-[9px] font-black
                               flex items-center justify-center shadow-sm leading-none">
                D
              </span>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0">
            <p className={`text-xs font-semibold leading-tight truncate max-w-[72px]
                           ${isYou ? 'text-gold-400' : 'text-midnight-100'}`}>
              {player.name}
            </p>
            <p className="text-[11px] font-mono text-midnight-400 leading-tight">
              {player.chips.toLocaleString()}
            </p>
          </div>

          {/* Timer */}
          <AnimatePresence>
            {isActive && (
              <TurnTimer timeRemaining={turnTimeRemaining} totalSeconds={turnSeconds} />
            )}
          </AnimatePresence>
        </div>

        {/* All-in badge */}
        {player.all_in && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2
                           bg-chip-red text-white text-[9px] font-bold
                           px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
            All In
          </span>
        )}

        {/* Folded badge */}
        {player.folded && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2
                           bg-midnight-600 text-midnight-400 text-[9px] font-medium
                           px-2 py-0.5 rounded-full uppercase tracking-wide">
            Folded
          </span>
        )}
      </div>

      {/* Bet chip */}
      <AnimatePresence>
        {player.current_bet > 0 && (
          <motion.div
            key={player.current_bet}
            initial={{ scale: 0, opacity: 0, y: -4 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 14 }}
            className="bg-midnight-900/90 border border-gold-400/30 rounded-full
                       px-2.5 py-0.5 text-[10px] text-gold-400 font-mono font-medium"
          >
            {player.current_bet.toLocaleString()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
