import { motion } from 'framer-motion'
import Card from './Card'

export default function PlayerSeat({ player, isCurrentPlayer, isYou, dealerIdx, playerIdx, totalPlayers }) {
  const isDealer = dealerIdx === playerIdx
  const isActive = isCurrentPlayer && !player.folded

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: player.folded ? 0.4 : 1 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center gap-1.5 ${isYou ? '' : ''}`}
    >
      {/* Cards */}
      <div className="flex gap-1 mb-1">
        {player.hole_cards ? (
          player.hole_cards.map((card, i) => (
            <Card key={i} rank={card.rank} suit={card.suit} delay={i * 0.15} small />
          ))
        ) : (
          player.folded ? null : (
            <>
              <Card faceDown small delay={0} />
              <Card faceDown small delay={0.1} />
            </>
          )
        )}
      </div>

      {/* Player info */}
      <div className={`relative px-4 py-2 rounded-xl text-center min-w-[100px]
                       transition-all duration-500
                       ${isActive
                         ? 'bg-midnight-800/90 border-2 border-gold-400/60 glow-pulse'
                         : 'bg-midnight-800/70 border border-midnight-600/40'}
                       ${isYou ? 'ring-1 ring-gold-400/20' : ''}`}
      >
        {isDealer && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold-400 text-midnight-950
                           text-[10px] font-bold flex items-center justify-center shadow-md">
            D
          </span>
        )}

        <p className={`text-xs font-medium truncate max-w-[80px]
                       ${isYou ? 'text-gold-400' : 'text-midnight-100'}`}>
          {player.name}
        </p>
        <p className="text-[11px] text-midnight-300 font-mono">
          {player.chips.toLocaleString()}
        </p>

        {player.current_bet > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2
                       bg-midnight-700/90 border border-midnight-500/40
                       rounded-full px-2 py-0.5 text-[10px] text-gold-400 font-mono
                       whitespace-nowrap"
          >
            {player.current_bet}
          </motion.div>
        )}

        {player.all_in && (
          <span className="absolute -top-2 -left-2 bg-chip-red text-white text-[9px]
                           font-bold px-1.5 py-0.5 rounded-full uppercase">
            All In
          </span>
        )}
      </div>
    </motion.div>
  )
}
