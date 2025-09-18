"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import type { Tables } from "@/types/database.types";

export default function RecipeActions({ recipeId }: { recipeId: string }) {
  const [isFav, setIsFav] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState<Tables<"collections">[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");

  useEffect(() => {
    checkFavorite();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  async function getFavoritesCollection(userId: string) {
    const { data: favCollections } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .eq("name", "Favorites")
      .limit(1);

    // Check if we found an existing collection
    if (favCollections && favCollections.length > 0) {
      return favCollections[0];
    }

    // Create one if it doesn't exist
    const { data: newCollection, error } = await supabase
      .from("collections")
      .insert({ user_id: userId, name: "Favorites", is_public: false })
      .select()
      .single();

    if (error || !newCollection) {
      throw new Error("Failed to create Favorites collection");
    }

    return newCollection;
  }

  async function checkFavorite() {
    const user = await getUser();
    if (!user) return;

    try {
      const favCollection = await getFavoritesCollection(user.id);

      const { data } = await supabase
        .from("collection_recipes")
        .select("recipe_id")
        .eq("collection_id", favCollection.id)
        .eq("recipe_id", recipeId)
        .single();

      setIsFav(!!data);
    } catch (error) {
      console.error("Error checking favorite:", error);
      setIsFav(false);
    }
  }

  async function toggleFavorite() {
    const user = await getUser();
    if (!user) return alert("Login first");

    try {
      const favCollection = await getFavoritesCollection(user.id);

      if (isFav) {
        await supabase
          .from("collection_recipes")
          .delete()
          .eq("collection_id", favCollection.id)
          .eq("recipe_id", recipeId);
      } else {
        await supabase
          .from("collection_recipes")
          .insert({ collection_id: favCollection.id, recipe_id: recipeId });
      }

      setIsFav(!isFav);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite status");
    }
  }

  async function openCollectionsModal() {
    const user = await getUser();
    if (!user) return alert("Login first");

    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", user.id)
      .neq("name", "Favorites");

    setCollections(data || []);
    setShowModal(true);
  }

  async function toggleInCollection(collectionId: string) {
    const { data } = await supabase
      .from("collection_recipes")
      .select("recipe_id")
      .eq("collection_id", collectionId)
      .eq("recipe_id", recipeId)
      .single();

    if (data) {
      await supabase
        .from("collection_recipes")
        .delete()
        .eq("collection_id", collectionId)
        .eq("recipe_id", recipeId);
    } else {
      await supabase
        .from("collection_recipes")
        .insert({ collection_id: collectionId, recipe_id: recipeId });
    }

    // Refresh modal list
    openCollectionsModal();
  }

  async function createCollection() {
    const user = await getUser();
    if (!user) return alert("Login first");
    if (!newCollectionName.trim()) return;

    await supabase
      .from("collections")
      .insert({ user_id: user.id, name: newCollectionName, is_public: false });

    setNewCollectionName("");
    openCollectionsModal();
  }

  return (
    <div className="flex gap-2">
      {/* Favorite button */}
      <button
        onClick={toggleFavorite}
        className={`px-3 py-1 rounded ${
          isFav ? "bg-rose-500 text-white" : "bg-gray-200"
        }`}
      >
        {isFav ? "Unfavorite" : "Favorite"}
      </button>

      {/* Collection button */}
      <button
        onClick={openCollectionsModal}
        className="px-3 py-1 rounded bg-blue-500 text-white"
      >
        Add to Collection
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Your Collections</h2>

            {collections.length === 0 ? (
              <div>
                <p className="mb-2">You do not have any collections yet.</p>
                <input
                  type="text"
                  placeholder="New collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="border px-2 py-1 w-full rounded mb-2"
                />
                <button
                  onClick={createCollection}
                  className="px-3 py-1 rounded bg-green-500 text-white"
                >
                  Create Collection
                </button>
              </div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {collections.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => toggleInCollection(c.id)}
                      className="w-full text-left px-3 py-2 rounded border hover:bg-gray-100"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex justify-between">
              <button
                onClick={createCollection}
                className="px-3 py-1 rounded bg-green-500 text-white"
              >
                Create New Collection
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
