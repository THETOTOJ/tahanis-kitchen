"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function NewCollection() {
  const [name, setName] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const router = useRouter()

  async function createCollection() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert("Login first")

    await supabase.from("collections").insert({
      user_id: user.id,
      name,
      is_public: isPublic,
    })
    router.push("/collections")
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">New Collection</h1>
      <input
        className="border rounded w-full p-2 mb-2"
        placeholder="Collection name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Public
      </label>
      <button onClick={createCollection} className="bg-green-600 text-white px-4 py-2 rounded">
        Create
      </button>
    </div>
  )
}
