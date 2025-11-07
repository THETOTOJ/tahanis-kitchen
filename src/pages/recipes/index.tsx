import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type RecipePreview = {
  id: string;
  title: string;
  cook_time_mins: number | null;
  firstImageUrl: string | null;
};

export default function RecipesIndexPage() {
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    setLoading(true);
    
    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select("id, title, cook_time_mins")
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (recipesError) {
      console.error("Error fetching recipes:", recipesError);
      setLoading(false);
      return;
    }

    if (!recipesData || recipesData.length === 0) {
      console.log("No recipes found");
      setRecipes([]);
      setLoading(false);
      return;
    }

    console.log("Fetched recipes:", recipesData);

    const recipeIds = recipesData.map((r) => r.id);
    const { data: imagesData, error: imagesError } = await supabase
      .from("recipe_images")
      .select("recipe_id, image_url, sort_order")
      .in("recipe_id", recipeIds)
      .order("sort_order", { ascending: true });

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
    }

    console.log("Fetched images:", imagesData);

    const recipesWithImages: RecipePreview[] = await Promise.all(
      recipesData.map(async (recipe) => {
        const recipeImages = imagesData?.filter(
          (img) => img.recipe_id === recipe.id
        );
        const firstImage = recipeImages?.[0];

        let imageUrl: string | null = null;
        if (firstImage) {
          console.log(`Creating signed URL for recipe ${recipe.id}, image:`, firstImage.image_url);
          
          const { data: signedUrl, error: urlError } = await supabase.storage
            .from("recipe-images")
            .createSignedUrl(firstImage.image_url, 3600);
          
          if (urlError) {
            console.error(`Error creating signed URL for ${firstImage.image_url}:`, urlError);
          } else {
            imageUrl = signedUrl?.signedUrl || null;
            console.log(`Signed URL created:`, imageUrl);
          }
        }

        return {
          ...recipe,
          firstImageUrl: imageUrl,
        };
      })
    );

    console.log("Final recipes with images:", recipesWithImages);
    setRecipes(recipesWithImages);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <p>Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-rose-800">
        Toto's Kitchen Recipes
      </h1>
      {recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recipes.map((r) => (
            <Link
              key={r.id}
              href={`/recipes/${r.id}`}
              className="block bg-white rounded-xl shadow hover:shadow-lg transition p-3"
            >
              {r.firstImageUrl ? (
                <img
                  src={r.firstImageUrl}
                  alt={r.title}
                  className="rounded-md h-40 w-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load image for ${r.title}`);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="rounded-md h-40 w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <h2 className="font-semibold mt-2">{r.title}</h2>
              {r.cook_time_mins && (
                <p className="text-sm text-gray-600">⏱ {r.cook_time_mins} min</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}