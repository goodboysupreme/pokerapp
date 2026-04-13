import { useRef, useState, useCallback, useEffect } from 'react'

export default function useWebSocket(roomId, playerId) {
  const ws = useRef(null)
  const [gameState, setGameState] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const reconnectTimeout = useRef(null)

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/ws/${roomId}/${playerId}`

    const socket = new WebSocket(url)

    socket.onopen = () => {
      setConnected(true)
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
        reconnectTimeout.current = null
      }
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'game_state') {
        setGameState(msg.data)
      } else if (msg.type === 'chat') {
        setChatMessages(prev => [...prev.slice(-49), msg.data])
      }
    }

    socket.onclose = () => {
      setConnected(false)
      reconnectTimeout.current = setTimeout(connect, 2000)
    }

    socket.onerror = () => {
      socket.close()
    }

    ws.current = socket
  }, [roomId, playerId])

  const send = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }, [])

  const startGame = useCallback(() => send({ type: 'start_game' }), [send])

  const sendAction = useCallback((action, amount = 0) => {
    send({ type: 'action', action, amount })
  }, [send])

  const sendChat = useCallback((text) => {
    send({ type: 'chat', text })
  }, [send])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
      if (ws.current) ws.current.close()
    }
  }, [connect])

  return { gameState, chatMessages, connected, startGame, sendAction, sendChat }
}
