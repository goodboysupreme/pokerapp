// Deterministic color from player name
const COLORS = [
  ['#7c3aed', '#a855f7'], // purple
  ['#1d4ed8', '#3b82f6'], // blue
  ['#065f46', '#10b981'], // green
  ['#b45309', '#f59e0b'], // amber
  ['#9f1239', '#f43f5e'], // rose
  ['#0e7490', '#06b6d4'], // cyan
  ['#6d28d9', '#8b5cf6'], // violet
  ['#c2410c', '#f97316'], // orange
]

function colorForName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function Avatar({ name, size = 32 }) {
  const [from, to] = colorForName(name || '?')
  const initials = (name || '?').slice(0, 2).toUpperCase()

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: `0 2px 8px ${from}55`,
      }}
    >
      {initials}
    </div>
  )
}
