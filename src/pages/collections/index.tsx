"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Tables } from "@/types/database.types"

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Tables<"collections">[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", user.id)
    setCollections(data || [])
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">My Collections</h1>
      <Link href="/collections/new" className="bg-green-600 text-white px-4 py-2 rounded">
        + New Collection
      </Link>
      <ul className="mt-4 space-y-2">
        {collections.map(c => (
          <li key={c.id} className="border p-2 rounded">
            <Link href={`/collections/${c.id}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
