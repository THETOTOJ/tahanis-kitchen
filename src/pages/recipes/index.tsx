import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import FilterDropdown from "@/components/FilterDropdown";
import Image from "next/image";
import Head from "next/head";
import { X } from "lucide-react";

type Option = { id: string; name: string };

type RecipePreview = {
  id: string;
  title: string;
  cook_time_mins: number | null;
  firstImageUrl: string | null;
  imageLoaded: boolean;
  recipe_tags?: { tag_id: string }[];
  recipe_efforts?: { effort_id: string }[];
};

export default function RecipesIndexPage() {
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEfforts, setSelectedEfforts] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Option[]>([]);
  const [allEfforts, setAllEfforts] = useState<Option[]>([]);

  useEffect(() => {
    checkUser();
    loadFilters();
    fetchRecipes();
  }, []);

  // Apply filters whenever selection or recipes change (memoized)
  const applyFilters = useCallback(() => {
    let filtered = [...recipes];

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((recipe) =>
        recipe.recipe_tags?.some((rt) => selectedTags.includes(rt.tag_id))
      );
    }

    // Filter by efforts
    if (selectedEfforts.length > 0) {
      filtered = filtered.filter((recipe) =>
        recipe.recipe_efforts?.some((re) => selectedEfforts.includes(re.effort_id))
      );
    }

    setFilteredRecipes(filtered);
  }, [recipes, selectedTags, selectedEfforts]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    setUserId(data.user?.id || null);
  }

  async function loadFilters() {
    const { data: tagsData } = await supabase.from("tags").select("*").order("name");
    const { data: effortsData } = await supabase.from("efforts").select("*").order("name");
    setAllTags(tagsData || []);
    setAllEfforts(effortsData || []);
  }

  async function fetchRecipes() {
    setLoading(true);

    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select(`
        id, 
        title, 
        cook_time_mins,
        recipe_tags(tag_id),
        recipe_efforts(effort_id)
      `)
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (recipesError) {
      console.error("Error fetching recipes:", recipesError);
      setLoading(false);
      return;
    }

    if (!recipesData || recipesData.length === 0) {
      setRecipes([]);
      setFilteredRecipes([]);
      setLoading(false);
      return;
    }

    const recipeIds = recipesData.map((r) => r.id);
    const { data: imagesData, error: imagesError } = await supabase
      .from("recipe_images")
      .select("recipe_id, image_url, sort_order")
      .in("recipe_id", recipeIds)
      .order("sort_order", { ascending: true });

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
    }

    const recipesWithImages: RecipePreview[] = await Promise.all(
      recipesData.map(async (recipe) => {
        const recipeImages = imagesData?.filter(
          (img) => img.recipe_id === recipe.id
        );
        const firstImage = recipeImages?.[0];

        let imageUrl: string | null = null;
        if (firstImage) {
          const { data: signedUrl, error: urlError } = await supabase.storage
            .from("recipe-images")
            .createSignedUrl(firstImage.image_url, 3600);

          if (!urlError && signedUrl) {
            imageUrl = signedUrl.signedUrl;
          }
        }

        return {
          id: recipe.id,
          title: recipe.title,
          cook_time_mins: recipe.cook_time_mins,
          firstImageUrl: imageUrl,
          imageLoaded: false,
          recipe_tags: recipe.recipe_tags || [],
          recipe_efforts: recipe.recipe_efforts || [],
        };
      })
    );

    setRecipes(recipesWithImages);
    setFilteredRecipes(recipesWithImages);
    setLoading(false);
  }

  function setPresetFilter(tagName: string) {
    const tag = allTags.find(
      (t) => t.name.toLowerCase() === tagName.toLowerCase()
    );
    if (tag) {
      setSelectedTags([tag.id]);
      setSelectedEfforts([]);
    }
  }

  function clearFilters() {
    setSelectedTags([]);
    setSelectedEfforts([]);
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  function toggleEffort(effortId: string) {
    setSelectedEfforts((prev) =>
      prev.includes(effortId)
        ? prev.filter((id) => id !== effortId)
        : [...prev, effortId]
    );
  }

  function handleImageLoad(recipeId: string) {
    setFilteredRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, imageLoaded: true } : r))
    );
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, imageLoaded: true } : r))
    );
  }

  const hasActiveFilters = selectedTags.length > 0 || selectedEfforts.length > 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Get Stuffed ! | Recipe Collection</title>
      </Head>
      <div className="max-w-6xl mx-auto mt-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-rose-800">Recipes</h1>
          {userId && (
            <Link
              href="/recipes/new"
              className="bg-rose-600 text-white px-4 py-2 rounded-lg shadow hover:bg-rose-700 transition"
            >
              + New Recipe
            </Link>
          )}
        </div>

        {/* Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Preset Filter Buttons */}
          <div className="flex gap-3 flex-wrap items-center">
            <span className="text-sm font-semibold text-gray-700">
              Quick Filters:
            </span>
            <button
              onClick={() => setPresetFilter("Vegan")}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition text-sm font-medium"
            >
              🌱 Vegan
            </button>
            <button
              onClick={() => setPresetFilter("Vegetarian")}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition text-sm font-medium"
            >
              🥕 Vegetarian
            </button>
            <button
              onClick={() => setPresetFilter("Gluten Free")}
              className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition text-sm font-medium"
            >
              🌾 Gluten-Free
            </button>
            <button
              onClick={() => setPresetFilter("Egg Free")}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
            >
              🥚 Egg-Free
            </button>
            <button
              onClick={() => setPresetFilter("Dairy Free")}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
            >
              🥛 Dairy-Free
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-3 flex-wrap items-center">
            <span className="text-sm font-semibold text-gray-700">
              Advanced Filters:
            </span>
            <FilterDropdown
              label={`Tags ${selectedTags.length > 0 ? `(${selectedTags.length})` : ""}`}
              options={allTags}
              selected={selectedTags}
              toggle={toggleTag}
            />
            <FilterDropdown
              label={`Effort ${selectedEfforts.length > 0 ? `(${selectedEfforts.length})` : ""}`}
              options={allEfforts}
              selected={selectedEfforts}
              toggle={toggleEffort}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium flex items-center gap-1"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedTags.map((tagId) => {
                const tag = allTags.find((t) => t.id === tagId);
                return (
                  <span
                    key={tagId}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag?.name}
                    <button
                      onClick={() => toggleTag(tagId)}
                      className="hover:text-yellow-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                );
              })}
              {selectedEfforts.map((effortId) => {
                const effort = allEfforts.find((e) => e.id === effortId);
                return (
                  <span
                    key={effortId}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {effort?.name}
                    <button
                      onClick={() => toggleEffort(effortId)}
                      className="hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredRecipes.length} of {recipes.length} recipes
          </p>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? "No recipes match your filters. Try adjusting your selection."
                : "No recipes found."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-rose-600 text-white px-6 py-3 rounded-lg shadow hover:bg-rose-700 transition"
              >
                Clear Filters
              </button>
            )}
            {!hasActiveFilters && userId && (
              <Link
                href="/recipes/new"
                className="inline-block bg-rose-600 text-white px-6 py-3 rounded-lg shadow hover:bg-rose-700 transition"
              >
                Create Your First Recipe
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRecipes.map((r) => (
              <Link
                key={r.id}
                href={`/recipes/${r.id}`}
                className="recipe-card block bg-white rounded-xl shadow hover:shadow-lg transition p-3"
              >
                <div className="relative h-40 w-full rounded-md overflow-hidden bg-gray-200">
                  {/* Loading spinner */}
                  {!r.imageLoaded && r.firstImageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-8 h-8 border-4 border-gray-300 border-t-rose-600 rounded-full animate-spin" />
                    </div>
                  )}

                  {r.firstImageUrl ? (
                    <Image
                      src={r.firstImageUrl}
                      alt={r.title}
                      width={300}
                      height={160}
                      className="rounded-md h-40 w-full object-cover"
                      onLoad={() => handleImageLoad(r.id)}
                      onError={(e) => {
                        console.error(`Failed to load image for ${r.title}`);
                        e.currentTarget.style.display = "none";
                        handleImageLoad(r.id);
                      }}
                      priority={false}
                      quality={85}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>
                <h2 className="font-semibold mt-2 line-clamp-2">{r.title}</h2>
                {r.cook_time_mins && (
                  <p className="text-sm text-gray-600">
                    ⏱ {r.cook_time_mins} min
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}