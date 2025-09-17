"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const emojis = ["🧠", "🧲", "🐷", "❤️"]

interface FloatingEmoji {
  id: number
  left: string
  duration: number
  size: number
  emoji: string
}

export default function FloatingHearts() {
  const [emojiState, setEmojiState] = useState<FloatingEmoji[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)]
      const newEmoji: FloatingEmoji = {
        id: Date.now(),
        left: `${Math.random() * 100}%`,
        duration: 8 + Math.random() * 6,
        size: 20 + Math.random() * 20, // tamanho aleatório (20px a 40px)
        emoji,
      }
      setEmojiState((prev) => [...prev, newEmoji])

      // remove do estado depois de sumir
      setTimeout(() => {
        setEmojiState((prev) => prev.filter((e) => e.id !== newEmoji.id))
      }, (newEmoji.duration + 1) * 1000)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {emojiState.map(({ id, left, duration, size, emoji }) => (
        <motion.span
          key={id}
          initial={{ opacity: 0, y: "100vh" }}
          animate={{ opacity: 1, y: "-10vh" }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: "easeOut" }}
          className="absolute"
          style={{
            left,
            fontSize: size,
          }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  )
}
