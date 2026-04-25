import { motion } from 'framer-motion'

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

const SUIT_COLORS = {
  hearts: '#ef4444',
  diamonds: '#f87171',
  clubs: '#1e293b',
  spades: '#0f172a',
}

// Back pattern SVG encoded
const CARD_BACK = (
  <div className="w-full h-full rounded-[inherit] flex items-center justify-center
                  bg-gradient-to-br from-midnight-600 to-midnight-800 overflow-hidden">
    <div className="w-[80%] h-[80%] rounded-sm border border-midnight-400/20
                    bg-gradient-to-br from-midnight-500/30 to-midnight-700/30
                    grid grid-cols-3 gap-0.5 p-1 opacity-60">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-[1px] bg-midnight-400/20" />
      ))}
    </div>
  </div>
)

export default function Card({ rank, suit, delay = 0, faceDown = false, small = false }) {
  const w = small ? 'w-9' : 'w-14'
  const h = small ? 'h-[52px]' : 'h-[84px]'
  const rankSize = small ? 'text-[11px]' : 'text-sm'
  const suitSize = small ? 'text-[14px]' : 'text-xl'

  if (faceDown) {
    return (
      <motion.div
        initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`${w} ${h} rounded-lg border border-midnight-500/50 shadow-lg shadow-black/40 overflow-hidden`}
      >
        {CARD_BACK}
      </motion.div>
    )
  }

  const color = SUIT_COLORS[suit] || '#1e293b'

  return (
    <motion.div
      initial={{ y: -50, rotateY: 90, opacity: 0, scale: 0.7 }}
      animate={{ y: 0, rotateY: 0, opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      className={`${w} ${h} rounded-lg bg-white flex flex-col
                  shadow-xl shadow-black/40 relative overflow-hidden
                  border border-white/10 select-none`}
    >
      {/* Top-left rank + suit */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
        <span className={`${rankSize} font-black leading-none`} style={{ color }}>
          {rank}
        </span>
        <span className={`${small ? 'text-[10px]' : 'text-xs'} leading-none`} style={{ color }}>
          {SUIT_SYMBOLS[suit]}
        </span>
      </div>

      {/* Center suit */}
      <div className="flex-1 flex items-center justify-center">
        <span className={`${suitSize} leading-none`} style={{ color }}>
          {SUIT_SYMBOLS[suit]}
        </span>
      </div>

      {/* Bottom-right rank + suit (rotated) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
        <span className={`${rankSize} font-black leading-none`} style={{ color }}>
          {rank}
        </span>
        <span className={`${small ? 'text-[10px]' : 'text-xs'} leading-none`} style={{ color }}>
          {SUIT_SYMBOLS[suit]}
        </span>
      </div>
    </motion.div>
  )
}
