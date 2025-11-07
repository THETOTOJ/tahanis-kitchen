"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/types/database.types";
import Head from "next/head";

export default function CollectionPage() {
  const params = useParams();
  const id = params?.id as string;
  const [collection, setCollection] = useState<Tables<"collections"> | null>(
    null
  );
  const [recipes, setRecipes] = useState<Tables<"recipes">[]>([]);

  const load = useCallback(async () => {
    const { data: coll } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();
    setCollection(coll);

    const { data: collectionRecipes } = await supabase
      .from("collection_recipes")
      .select("recipes(*)")
      .eq("collection_id", id)
      .returns<{ recipes: Tables<"recipes"> }[]>();

    const mapped: Tables<"recipes">[] =
      collectionRecipes?.map((r) => r.recipes).filter(Boolean) ?? [];

    setRecipes(mapped);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    load();
  }, [load, id]);
  
  if (!collection) return <p>Loading...</p>;

  return (
    <>
      <Head>
        <title>{collection?.name ? `${collection.name} | Get Stuffed !` : "Collection | Get Stuffed !"}</title>
      </Head>
      <div className="max-w-2xl mx-auto mt-10">
        <h1 className="text-2xl font-bold">{collection.name}</h1>
        <ul className="mt-4 space-y-2">
          {recipes.map((r) => (
            <li key={r.id} className="border p-2 rounded">
              {r.title}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
