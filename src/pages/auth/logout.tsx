import { useEffect } from "react"
import { useRouter } from "next/router"
import { supabase } from '@/lib/supabaseClient'

export default function Logout() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.signOut().then(() => router.push("/"))
  }, [router])
  return <p>Logging out...</p>
}
