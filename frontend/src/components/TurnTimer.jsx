import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function TurnTimer({ timeRemaining, totalSeconds = 30 }) {
  const [display, setDisplay] = useState(timeRemaining)
  const intervalRef = useRef(null)
  const lastServerTime = useRef(timeRemaining)
  const lastSetAt = useRef(Date.now())

  // Sync from server, then count down locally for smooth display
  useEffect(() => {
    lastServerTime.current = timeRemaining
    lastSetAt.current = Date.now()
    setDisplay(timeRemaining)

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - lastSetAt.current) / 1000
      setDisplay(Math.max(0, Math.round(lastServerTime.current - elapsed)))
    }, 200)

    return () => clearInterval(intervalRef.current)
  }, [timeRemaining])

  const pct = display / totalSeconds
  const urgent = display <= 10
  const radius = 16
  const circumference = 2 * Math.PI * radius

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="relative w-10 h-10"
    >
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
        {/* Track */}
        <circle
          cx="20" cy="20" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
        {/* Progress */}
        <motion.circle
          cx="20" cy="20" r={radius}
          fill="none"
          stroke={urgent ? '#ef4444' : '#fbbf24'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 0.2 }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center
                        text-xs font-bold tabular-nums
                        ${urgent ? 'text-red-400' : 'text-gold-400'}`}>
        {display}
      </span>
    </motion.div>
  )
}
