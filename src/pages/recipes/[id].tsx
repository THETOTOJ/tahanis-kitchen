"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SortableImageUploader from "@/components/SortableImageUploader";
import { useParams, useRouter } from "next/navigation";
import RecipeImageGallery from "@/components/RecipeImageGallery";
import RecipeActions from "@/components/RecipeActions";
import Image from "next/image";
import type { Tables } from "@/types/database.types";
import Head from "next/head";

type RecipeImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type RecipeTag = {
  tags: {
    id: string;
    name: string;
  };
};

type RecipeEffort = {
  efforts: {
    id: string;
    name: string;
  };
};

type Recipe = Tables<"recipes"> & {
  recipe_images?: RecipeImage[];
  recipe_tags?: RecipeTag[];
  recipe_efforts?: RecipeEffort[];
  user_id?: string;
};

type User = {
  username: string;
  profile_picture: string | null;
};

type Comment = {
  id: string;
  user_id: string;
  recipe_id: string;
  body: string;
  created_at: string;
  users?: User & { profile_picture_url?: string | null };
  rating?: number | null;
};

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

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [author, setAuthor] = useState<string>("");

  const [tags, setTags] = useState<string[]>([]);
  const [efforts, setEfforts] = useState<string[]>([]);

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [cookTimeMins, setCookTimeMins] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dbImages, setDbImages] = useState<RecipeImage[]>([]);

  const [allTags, setAllTags] = useState<Option[]>([]);
  const [allEfforts, setAllEfforts] = useState<Option[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEfforts, setSelectedEfforts] = useState<string[]>([]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const loadOptions = useCallback(async () => {
    const { data: tagsData } = await supabase.from("tags").select("*");
    const { data: effortsData } = await supabase.from("efforts").select("*");
    setAllTags(tagsData || []);
    setAllEfforts(effortsData || []);
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("recipes")
      .select(
        `
        *,
        recipe_images(*),
        recipe_tags(tags(id, name)),
        recipe_efforts(efforts(id, name))
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error loading recipe:", error.message);
      return;
    }

    setRecipe(data as Recipe);
    if (data) {
      setTitle(data.title);
      setIngredients(data.ingredients);
      setInstructions(data.instructions);
      setCookTimeMins(data.cook_time_mins?.toString() || "");

      if (data.recipe_tags) {
        const tagNames = data.recipe_tags.map((rt: RecipeTag) => rt.tags.name);
        const tagIds = data.recipe_tags.map((rt: RecipeTag) => rt.tags.id);
        setTags(tagNames);
        setSelectedTags(tagIds);
      } else {
        setTags([]);
        setSelectedTags([]);
      }

      if (data.recipe_efforts) {
        const effortNames = data.recipe_efforts.map((re: RecipeEffort) => re.efforts.name);
        const effortIds = data.recipe_efforts.map((re: RecipeEffort) => re.efforts.id);
        setEfforts(effortNames);
        setSelectedEfforts(effortIds);
      } else {
        setEfforts([]);
        setSelectedEfforts([]);
      }

      if (data.user_id) {
        const { data: profile } = await supabase
          .from("users")
          .select("username")
          .eq("id", data.user_id)
          .single();
        if (profile) setAuthor(profile.username);
      }

      if (data.recipe_images && data.recipe_images.length > 0) {
        const sorted = data.recipe_images.sort(
          (a: RecipeImage, b: RecipeImage) => a.sort_order - b.sort_order
        );
        setDbImages(sorted);

        const signedUrls = await Promise.all(
          sorted.map(async (img: RecipeImage) => {
            const { data: signedUrl, error: signError } = await supabase.storage
              .from("recipe-images")
              .createSignedUrl(img.image_url, 3600);

            if (signError) {
              console.error(
                `Error creating signed URL for ${img.image_url}:`,
                signError.message
              );
              return null;
            }
            return signedUrl?.signedUrl ?? null;
          })
        );

        const validUrls = signedUrls.filter((url): url is string => url !== null);
        setPreviews(validUrls);
        setImages([]);
      } else {
        setDbImages([]);
        setPreviews([]);
        setImages([]);
      }
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        users(username, profile_picture)
      `
      )
      .eq("recipe_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading comments:", error.message);
      return;
    }

    const commentsWithSignedUrls: Comment[] = await Promise.all(
      (data || []).map(async (comment: Comment) => {
        if (comment.users?.profile_picture) {
          const { data: signedUrl } = await supabase.storage
            .from("profile_pics")
            .createSignedUrl(comment.users.profile_picture, 3600);

          return {
            ...comment,
            users: {
              ...comment.users,
              profile_picture_url: signedUrl?.signedUrl || null,
            },
          };
        }
        return comment;
      })
    );

    setComments(commentsWithSignedUrls);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    load();
    loadComments();
    loadOptions();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [id, load, loadComments, loadOptions]);

  async function submitComment() {
    if (!userId) return alert("Please log in to comment");
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        user_id: userId,
        recipe_id: id,
        body: newComment.trim(),
        rating: null,
      })
      .select();

    if (error) {
      console.error("Error submitting comment:", error.message);
      alert("Failed to submit comment: " + error.message);
      return;
    }

    console.log("Comment submitted:", data);
    setNewComment("");
    loadComments();
  }

  async function deleteComment(commentId: string) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting comment:", error.message);
      return;
    }

    loadComments();
  }

  async function saveChanges() {
    if (!userId || !recipe || recipe.user_id !== userId) return alert("Not allowed!");

    await supabase
      .from("recipes")
      .update({
        title,
        ingredients,
        instructions,
        cook_time_mins: cookTimeMins ? parseInt(cookTimeMins) : null
      })
      .eq("id", id);

    // Update tags
    await supabase.from("recipe_tags").delete().eq("recipe_id", id);
    if (selectedTags.length > 0) {
      await supabase.from("recipe_tags").insert(
        selectedTags.map((tagId) => ({
          recipe_id: id,
          tag_id: tagId,
        }))
      );
    }

    // Update efforts
    await supabase.from("recipe_efforts").delete().eq("recipe_id", id);
    if (selectedEfforts.length > 0) {
      await supabase.from("recipe_efforts").insert(
        selectedEfforts.map((effortId) => ({
          recipe_id: id,
          effort_id: effortId,
        }))
      );
    }

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      if (!(file instanceof File)) continue;

      const ext = file.name.split(".").pop();
      const path = `${userId}/${id}/${Date.now()}-${i}.${ext}`;

      const { data: uploaded, error: imgErr } = await supabase.storage
        .from("recipe-images")
        .upload(path, file, { upsert: true });

      if (imgErr) {
        console.error("Upload error:", imgErr.message);
        continue;
      }

      if (uploaded) {
        await supabase.from("recipe_images").insert({
          recipe_id: id,
          image_url: uploaded.path,
          sort_order: dbImages.length + i,
        });
      }
    }

    setIsEditing(false);
    load();
  }

  async function deleteImage(index: number) {
    if (index < dbImages.length) {
      const img = dbImages[index];
      await supabase.storage.from("recipe-images").remove([img.image_url]);
      await supabase.from("recipe_images").delete().eq("id", img.id);
      const newDbImages = dbImages.filter((_, i) => i !== index);
      setDbImages(newDbImages);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      const localIndex = index - dbImages.length;
      setImages((prev) => prev.filter((_, i) => i !== localIndex));
      setPreviews((prev) => [
        ...prev.slice(0, dbImages.length),
        ...prev.slice(dbImages.length).filter((_, i) => i !== localIndex),
      ]);
    }
  }

  async function deleteRecipe() {
    if (!userId || !recipe || recipe.user_id !== userId) return alert("Not allowed!");
    const confirmed = confirm("Are you sure you want to delete this recipe?");
    if (!confirmed) return;

    try {
      if ((recipe.recipe_images?.length ?? 0) > 0) {
        const paths = (recipe.recipe_images ?? []).map((img: RecipeImage) => img.image_url);
        await supabase.storage.from("recipe-images").remove(paths);
      }

      const { error } = await supabase.from("recipes").delete().eq("id", id);

      if (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe: " + error.message);
        return;
      }

      alert("Recipe deleted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error during recipe deletion:", error);
      alert("An error occurred while deleting the recipe");
    }
  }

  if (!recipe) return <p>Loading...</p>;
  const canEdit = userId === recipe.user_id;

  return (
    <>
      <Head>
        <title>{recipe?.title ? `${recipe.title} | Get Stuffed !` : "Recipe | Get Stuffed !"}</title>
      </Head>
      <div className="max-w-2xl mx-auto mt-10 space-y-4">
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit Recipe
          </button>
        )}
        {isEditing ? (
          <>
            <SortableImageUploader
              images={images}
              setImages={setImages}
              previews={previews}
              setPreviews={setPreviews}
              onRemove={deleteImage}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="border p-2 w-full rounded"
              placeholder="Ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={4}
            />
            <textarea
              className="border p-2 w-full rounded"
              placeholder="Instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={6}
            />
            <input
              className="border p-2 w-full rounded"
              type="number"
              placeholder="Cook time (in minutes)"
              value={cookTimeMins}
              onChange={(e) => setCookTimeMins(e.target.value)}
            />
            <Checklist
              label="Efforts"
              options={allEfforts}
              selected={selectedEfforts}
              setSelected={setSelectedEfforts}
            />
            <Checklist
              label="Tags"
              options={allTags}
              selected={selectedTags}
              setSelected={setSelectedTags}
            />
            <div className="flex gap-2">
              <button
                onClick={saveChanges}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  load();
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={deleteRecipe}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Recipe
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">{recipe.title}</h1>
              {author && (
                <p className="text-gray-600 text-sm">
                  by <span className="font-medium">{author}</span>
                </p>
              )}
            </div>
            <RecipeActions recipeId={id} />
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.cook_time_mins && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  ⏱ {recipe.cook_time_mins} min
                </span>
              )}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {efforts.map((effort) => (
                <span
                  key={effort}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  ⏳ {effort}
                </span>
              ))}
            </div>

            <RecipeImageGallery images={previews} />

            <div className="space-y-6 mt-8">
              <div>
                <h2 className="text-2xl font-semibold mb-3 text-gray-800">
                  Ingredients
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {recipe.ingredients}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-3 text-gray-800">
                  Instructions
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {recipe.instructions}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-3 text-gray-800">
                  Comments ({comments.length})
                </h2>

                {userId && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <textarea
                      className="border p-2 w-full rounded mb-2"
                      placeholder="Share your thoughts about this recipe..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <button
                        onClick={submitComment}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white border rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {comment.users?.profile_picture_url ? (
                              <Image
                                src={comment.users.profile_picture_url}
                                alt={comment.users.username}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 font-semibold">
                                  {comment.users?.username
                                    ?.charAt(0)
                                    .toUpperCase() || "?"}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {comment.users?.username || "Anonymous"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    comment.created_at
                                  ).toLocaleDateString()}
                                </span>
                                {comment.user_id === userId && (
                                  <button
                                    onClick={() => deleteComment(comment.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {comment.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}