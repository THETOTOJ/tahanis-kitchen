import "@/styles/globals.css"
import type { AppProps } from "next/app"
import Navbar from "@/components/Navbar"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session)

      if (event === "SIGNED_IN") {
        console.log("User logged in:", session?.user)
      }
      if (event === "SIGNED_OUT") {
        console.log("User signed out")
      }
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery flow started")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <Navbar />
      <main className="p-4">
        <Component {...pageProps} />
      </main>
    </>
  )
}
