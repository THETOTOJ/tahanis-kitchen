"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function CollectionPage() {
  const params = useParams()
  const id = params?.id as string
  const [collection, setCollection] = useState<any>(null)
  const [recipes, setRecipes] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    const { data: coll } = await supabase.from("collections").select("*").eq("id", id).single()
    setCollection(coll)

    const { data: recipes } = await supabase
      .from("collection_recipes")
      .select("recipes(*)")
      .eq("collection_id", id)
    setRecipes(recipes?.map(r => r.recipes) || [])
  }

  if (!collection) return <p>Loading...</p>

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold">{collection.name}</h1>
      <ul className="mt-4 space-y-2">
        {recipes.map(r => (
          <li key={r.id} className="border p-2 rounded">{r.title}</li>
        ))}
      </ul>
    </div>
  )
}
