"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Lock, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onLogin: (success: boolean) => void;
}

// 🔧 se quiser, troca esta URL por uma foto real do casal
const BACKGROUND_IMAGE =
  "https://videos.openai.com/vg-assets/assets%2Ftask_01k36pwx1qf8z8v5j3b2dp8r9w%2F1755793391_img_0.webp?st=2025-09-15T18%3A41%3A24Z&se=2025-09-21T19%3A41%3A24Z&sks=b&skt=2025-09-15T18%3A41%3A24Z&ske=2025-09-21T19%3A41%3A24Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=8b872fb2-b44b-4c1d-9ff6-1d4509d19e6e&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=gIQmHcdt6wD6JYjnhfc6SmWRHRiPVPYlCI4AChCxBIM%3D&az=oaivgprodscus";

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const COUPLE_PASSWORD = process.env.NEXT_PUBLIC_COUPLE_PASSWORD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    await new Promise((r) => setTimeout(r, 450));

    if (password === COUPLE_PASSWORD) {
      onLogin(true);
    } else {
      setErrorMsg("Vamo acertar né? 💔");
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* 🔮 Fundo: foto com blur + overlay em degradê */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGE})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-pink-633/30 via-rose-600/40 to-purple-700/30 backdrop-blur-sm" />

      {/* 🔲 Card de login */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="mb-6"
        >
          <Heart className="w-16 h-16 mx-auto text-pink-300 drop-shadow" />
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-2 font-[cursive]">
          Alan & Mari
        </h1>
        <p className="text-white/80 mb-8">🧠🧲❤️</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <label className="block text-white/80 text-sm font-medium mb-1">
            nossa senha
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/70 hover:text-white"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="text-sm text-red-200 bg-red-500/20 border border-red-400/30 px-3 py-2 rounded-md">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold text-white
                       bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600
                       shadow-lg hover:shadow-pink-500/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verificando..." : "Entrar na Nossa Timeline"}
          </button>
        </form>

        <p className="mt-6 text-xs text-white/60">
          Dica senha:{" "}
          <code className="bg-white/10 px-2 py-0.5 rounded">
            primeiro beijo
          </code>
        </p>
      </motion.div>
    </div>
  );
}
