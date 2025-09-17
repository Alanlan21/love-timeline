"use client"
import { motion } from "framer-motion"
import { X } from "lucide-react"

interface LightboxProps {
  image: string
  onClose: () => void
}

export default function Lightbox({ image, onClose }: LightboxProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      {/* 🔮 Fundo com gradiente translúcido + blur leve */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-purple-900/60 to-black/80 backdrop-blur-sm" />

      {/* Conteúdo */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-5xl w-full max-h-[90vh] flex justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Imagem */}
        <img
          src={image}
          alt="Memória ampliada"
          className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
      </motion.div>
    </motion.div>
  )
}
