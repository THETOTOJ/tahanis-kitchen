"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import SortableImageUploader from "@/components/SortableImageUploader";

type Option = { id: string; name: string };

function Checklist({
  label,
  options,
  selected,
  setSelected,
}: {
  label: string;
  options: Option[];
  selected: string[];
  setSelected: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    setSelected(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-3 py-2 border rounded bg-white shadow w-full flex justify-between"
      >
        <span>{label}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute mt-2 bg-white border rounded shadow-md p-2 w-56 z-10 max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 py-1 px-2">
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => toggle(opt.id)}
              />
              <span>{opt.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewRecipe() {
  const [title, setTitle] = useState("");
  const [cook_time_mins, setCookTime] = useState("");

  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [tags, setTags] = useState<Option[]>([]);
  const [efforts, setEfforts] = useState<Option[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEfforts, setSelectedEfforts] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOptions() {
      const { data: tags } = await supabase.from("tags").select("*");
      const { data: efforts } = await supabase.from("efforts").select("*");
      setTags(tags || []);
      setEfforts(efforts || []);
    }
    fetchOptions();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    // insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        title,
        ingredients,
        instructions,
        cook_time_mins,
        user_id: user.id,
      })
      .select()
      .single();

    if (recipeError) {
      setError(recipeError.message);
      return;
    }

    const recipeId = recipe.id;

    if (selectedTags.length > 0) {
      await supabase.from("recipe_tags").insert(
        selectedTags.map((tagId) => ({
          recipe_id: recipeId,
          tag_id: tagId,
        }))
      );
    }

    if (selectedEfforts.length > 0) {
      await supabase.from("recipe_efforts").insert(
        selectedEfforts.map((effortId) => ({
          recipe_id: recipeId,
          effort_id: effortId,
        }))
      );
    }

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${recipeId}/${Date.now()}-${i}.${ext}`;

      const { data: uploaded, error: imgErr } = await supabase.storage
        .from("recipe-images")
        .upload(path, file, { upsert: true });

      if (!imgErr && uploaded) {
        await supabase.from("recipe_images").insert({
          recipe_id: recipeId,
          image_url: uploaded.path,
          sort_order: i,
        });
      }
    }

    setSuccess("Recipe created!");
    setTitle("");
    setCookTime("");
    setIngredients("");
    setInstructions("");
    setImages([]);
    setPreviews([]);
    setSelectedTags([]);
    setSelectedEfforts([]);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto mt-10 bg-amber-50 p-6 rounded-xl shadow-md flex flex-col gap-4"
    >
      <h1 className="text-2xl font-bold text-amber-800">Add Recipe</h1>

      <SortableImageUploader
        images={images}
        setImages={setImages}
        previews={previews}
        setPreviews={setPreviews}
      />

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="border rounded px-3 py-2"
      />
      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Ingredients"
        className="border rounded px-3 py-2"
      />
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Instructions"
        className="border rounded px-3 py-2"
      />
      <input
        value={cook_time_mins}
        type="number"
        onChange={(e) => setCookTime(e.target.value)}
        placeholder="Cook time (in minutes)"
        className="border rounded px-3 py-2"
      />
      <Checklist
        label="Efforts"
        options={efforts}
        selected={selectedEfforts}
        setSelected={setSelectedEfforts}
      />

      <Checklist
        label="Tags"
        options={tags}
        selected={selectedTags}
        setSelected={setSelectedTags}
      />

      <button
        type="submit"
        className="bg-rose-600 text-white py-2 rounded hover:bg-rose-700"
      >
        Save
      </button>

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
    </form>
  );
}
