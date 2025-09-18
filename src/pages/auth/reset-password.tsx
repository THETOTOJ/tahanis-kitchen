"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  async function handleReset() {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMessage(error.message)
    else setMessage("Password updated successfully! You can now log in.")
  }

  return (
    <div className="max-w-sm mx-auto mt-20 flex flex-col gap-3 bg-rose-50 p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-rose-800">Reset Password</h1>
      <input
        type="password"
        placeholder="New Password"
        className="border rounded px-3 py-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleReset}
        className="bg-green-600 text-white py-2 rounded"
      >
        Update Password
      </button>
      {message && <p className="text-rose-800">{message}</p>}
    </div>
  )
}
