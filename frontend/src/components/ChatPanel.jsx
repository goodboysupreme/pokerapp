import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatPanel({ messages, onSend }) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSend(e) {
    e.preventDefault()
    if (text.trim()) {
      onSend(text.trim())
      setText('')
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="mb-3 w-72 bg-midnight-900/95 backdrop-blur-xl border border-midnight-700/50
                       rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="p-3 border-b border-midnight-700/40">
              <span className="text-xs text-midnight-400 uppercase tracking-wider font-medium">Chat</span>
            </div>
            <div ref={scrollRef} className="h-48 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className="text-xs">
                  <span className="text-gold-400 font-medium">{msg.player_name}</span>
                  <span className="text-midnight-200 ml-1.5">{msg.text}</span>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-midnight-500 text-xs text-center mt-8">No messages yet</p>
              )}
            </div>
            <form onSubmit={handleSend} className="p-2 border-t border-midnight-700/40">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-midnight-950/60 border border-midnight-600/30 rounded-lg
                           px-3 py-2 text-xs text-midnight-100 placeholder-midnight-500
                           outline-none focus:border-gold-400/40 transition-all"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-midnight-800/80 border border-midnight-600/40
                   flex items-center justify-center text-midnight-300
                   hover:text-gold-400 hover:border-gold-400/40
                   transition-all duration-300 shadow-lg shadow-black/30"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </motion.button>
    </div>
  )
}
