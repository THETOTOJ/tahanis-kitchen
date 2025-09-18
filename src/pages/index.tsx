"use client";
import RecipeCard from "@/components/RecipeCard";
import FilterDropdown from "@/components/FilterDropdown";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [efforts, setEfforts] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEfforts, setSelectedEfforts] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<"all" | "vegetarian" | "vegan">("all");

  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    getUser();
    loadFilters();
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [selectedTags, selectedEfforts, query, preset, page]);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }

  async function loadFilters() {
    const { data: t } = await supabase.from("tags").select("*");
    const { data: e } = await supabase.from("efforts").select("*");
    setTags(t || []);
    setEfforts(e || []);
  }

  async function loadRecipes() {
    // Step 1: base query
    let { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("deleted", false)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (!data) data = [];

    // Step 2: filter by effort
    if (selectedEfforts.length > 0) {
      data = data.filter((r) => selectedEfforts.includes(r.effort_id));
    }

    // Step 3: filter by tags / preset
    if (selectedTags.length > 0 || preset !== "all") {
      const { data: rtags } = await supabase.from("recipe_tags").select("*");
      let neededTags = [...selectedTags];
      if (preset === "vegetarian") {
        const vegTag = tags.find((t) => t.name.toLowerCase() === "vegetarian");
        if (vegTag) neededTags.push(vegTag.id);
      }
      if (preset === "vegan") {
        const veganTag = tags.find((t) => t.name.toLowerCase() === "vegan");
        if (veganTag) neededTags.push(veganTag.id);
      }
      if (neededTags.length > 0 && rtags) {
        const recipeIds = rtags
          .filter((rt) => neededTags.includes(rt.tag_id))
          .map((rt) => rt.recipe_id);
        data = data.filter((r) => recipeIds.includes(r.id));
      }
    }

    // Step 4: search query
    if (query) {
      data = data.filter((r) =>
        (r.title + r.ingredients).toLowerCase().includes(query.toLowerCase())
      );
    }

    // Step 5: get first image for each recipe
    const recipeIds = data.map((r) => r.id);
    const { data: images } = await supabase
      .from("recipe_images")
      .select("*")
      .in("recipe_id", recipeIds)
      .order("sort_order", { ascending: true });

    const recipesWithImages = data.map((r) => ({
      ...r,
      preview: images?.find((img) => img.recipe_id === r.id)?.image_url || "",
    }));

    setRecipes(recipesWithImages);
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setPage(1);
  }

  function toggleEffort(id: string) {
    setSelectedEfforts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setPage(1);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Preset Tabs */}
      <div className="flex gap-4">
        {["all", "vegetarian", "vegan"].map((p) => (
          <button
            key={p}
            onClick={() => {
              setPreset(p as any);
              setPage(1);
            }}
            className={`px-4 py-2 rounded ${
              preset === p ? "bg-grandma-pink font-bold" : "bg-grandma-cream"
            }`}
          >
            {p === "all" ? "All Recipes" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        placeholder="Search recipes..."
        className="border p-2 rounded w-full"
      />

      {/* Dropdown Filters */}
      <div className="flex gap-4">
        <FilterDropdown
          label="Tags"
          options={tags}
          selected={selectedTags}
          toggle={toggleTag}
        />
        <FilterDropdown
          label="Effort"
          options={efforts}
          selected={selectedEfforts}
          toggle={toggleEffort}
        />
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recipes.map((r) => (
          <RecipeCard key={r.id} r={r} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={recipes.length < pageSize}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>

      {/* Add Recipe Button */}
      {user && (
        <Link href="/recipes/new">
          <button
            className="
            fixed bottom-6 right-6
            flex items-center justify-center
            w-14 h-14
            rounded-full shadow-lg
            bg-grandma-pink text-grandma-brown
            hover:bg-grandma-cream hover:text-grandma-brown
            transition-colors duration-200
          "
          >
            <Plus className="w-6 h-6" />
          </button>
        </Link>
      )}
    </div>
  );
}
