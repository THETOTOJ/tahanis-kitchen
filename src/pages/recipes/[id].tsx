"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SortableImageUploader from "@/components/SortableImageUploader";
import { useParams, useRouter } from "next/navigation";
import RecipeImageGallery from "@/components/RecipeImageGallery";
import RecipeActions from "@/components/RecipeActions";
import Image from "next/image";
import type { Tables } from "@/types/database.types";

type RecipeImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type RecipeTag = {
  tags: {
    name: string;
  };
};

type RecipeEffort = {
  efforts: {
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

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dbImages, setDbImages] = useState<RecipeImage[]>([]);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!id) return;
    load();
    loadComments();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [id]);

  async function load() {
    const { data, error } = await supabase
      .from("recipes")
      .select(
        `
        *,
        recipe_images(*),
        recipe_tags(tags(name)),
        recipe_efforts(efforts(name))
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

      // tags
      if (data.recipe_tags) {
        setTags(data.recipe_tags.map((rt: RecipeTag) => rt.tags.name));
      } else {
        setTags([]);
      }

      // efforts
      if (data.recipe_efforts) {
        setEfforts(data.recipe_efforts.map((re: RecipeEffort) => re.efforts.name));
      } else {
        setEfforts([]);
      }

      // fetch author username
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
  }

  async function loadComments() {
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

    // Get signed URLs for profile pictures
    const commentsWithSignedUrls: Comment[] = await Promise.all(
      (data || []).map(async (comment: Comment) => {
        if (comment.users?.profile_picture) {
          const { data: signedUrl } = await supabase.storage
            .from("profile-pictures")
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
  }

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

    console.log("Comment submitted:", data); // Debug log
    setNewComment("");
    loadComments();
  }

  async function deleteComment(commentId: string) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId); // Only allow users to delete their own comments

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
      .update({ title, ingredients, instructions })
      .eq("id", id);

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

    if ((recipe.recipe_images?.length ?? 0) > 0) {
      const paths = (recipe.recipe_images ?? []).map((img: RecipeImage) => img.image_url);
      await supabase.storage.from("recipe-images").remove(paths);
      await supabase.from("recipe_images").delete().eq("recipe_id", id);
    }

    await supabase.from("recipes").delete().eq("id", id);
    router.push("/recipes");
  }

  if (!recipe) return <p>Loading...</p>;
  const canEdit = userId === recipe.user_id;

  return (
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="border p-2 w-full rounded"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={4}
          />
          <textarea
            className="border p-2 w-full rounded"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={6}
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
          {/* Title + author */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{recipe.title}</h1>
            {author && (
              <p className="text-gray-600 text-sm">
                by <span className="font-medium">{author}</span>
              </p>
            )}
          </div>
          <RecipeActions recipeId={id} />
          {/* Tags + Efforts */}
          <div className="flex flex-wrap gap-2 mb-6">
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

            {/* Comments Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">
                Comments ({comments.length})
              </h2>

              {/* Add Comment Form */}
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

              {/* Comments List */}
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
                        {/* Profile Picture */}
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

                        {/* Comment Content */}
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
  );
}
