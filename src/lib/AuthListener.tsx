"use client"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AuthListener() {
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        console.log("User logged in:", session?.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
