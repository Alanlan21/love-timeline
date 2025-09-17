"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthScreen from "@/components/AuthScreen"

export default function HomePage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const authStatus = localStorage.getItem("coupleAuth")
    if (authStatus === "true") {
      router.replace("/timeline")
    } else {
      setCheckingAuth(false)
    }
  }, [router])

  const handleLogin = (success: boolean) => {
    if (success) {
      localStorage.setItem("coupleAuth", "true")
      router.replace("/timeline")
    }
  }

  // enquanto checa, evita flicker
  if (checkingAuth) {
    return <div className="min-h-screen bg-black/90" />
  }

  return <AuthScreen onLogin={handleLogin} />
}
