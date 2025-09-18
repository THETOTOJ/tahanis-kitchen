import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type RecipePreview = {
  id: string;
  title: string;
  image_url: string | null;
  cook_time_mins: number | null;
};

export default function Home() {
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);

  useEffect(() => {
    async function fetchRecipes() {
      const { data } = await supabase
        .from("recipes")
        .select("id, title, image_url, cook_time_mins")
        .eq("deleted", false)
        .order("created_at", { ascending: false });
      if (data) setRecipes(data as RecipePreview[]);
    }
    fetchRecipes();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-rose-800">
        Tahani’s Kitchen Recipes
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <Link
            key={r.id}
            href={`/recipes/${r.id}`}
            className="block bg-white rounded-xl shadow hover:shadow-lg transition p-3"
          >
            {r.image_url && (
              <img
                src={`https://<your-supabase-project>.supabase.co/storage/v1/object/public/recipe-images/${r.image_url}`}
                alt={r.title}
                className="rounded-md h-40 w-full object-cover"
              />
            )}
            <h2 className="font-semibold mt-2">{r.title}</h2>
            {r.cook_time_mins && (
              <p className="text-sm text-gray-600">⏱ {r.cook_time_mins} min</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
