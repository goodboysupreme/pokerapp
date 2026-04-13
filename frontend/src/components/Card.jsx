import { motion } from 'framer-motion'

const SUIT_SYMBOLS = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
}

const SUIT_COLORS = {
  hearts: 'text-red-500',
  diamonds: 'text-red-400',
  clubs: 'text-midnight-100',
  spades: 'text-midnight-50',
}

export default function Card({ rank, suit, delay = 0, faceDown = false, small = false }) {
  const size = small ? 'w-10 h-14 text-xs' : 'w-16 h-22 text-sm'

  if (faceDown) {
    return (
      <motion.div
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`${size} rounded-lg bg-gradient-to-br from-midnight-600 to-midnight-800
                    border border-midnight-500/50 flex items-center justify-center
                    shadow-lg shadow-black/30`}
      >
        <div className="w-3/4 h-3/4 rounded-sm border border-midnight-400/30
                        bg-gradient-to-br from-midnight-500/40 to-midnight-700/40" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ y: -60, rotateY: 180, opacity: 0, scale: 0.7 }}
      animate={{ y: 0, rotateY: 0, opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className={`${size} rounded-lg bg-white flex flex-col items-center justify-center
                  shadow-xl shadow-black/40 relative overflow-hidden select-none
                  border border-white/20`}
    >
      <span className={`font-bold leading-none ${SUIT_COLORS[suit]}`}>
        {rank}
      </span>
      <span className={`leading-none ${small ? 'text-base' : 'text-lg'} ${SUIT_COLORS[suit]}`}>
        {SUIT_SYMBOLS[suit]}
      </span>
    </motion.div>
  )
}
