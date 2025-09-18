"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Tables } from "@/types/database.types";
import Image from "next/image";

export default function ProfilePage() {
  const [userData, setUserData] = useState<Tables<"users"> | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError(null);
    setSuccess(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setUserData(data);
    setUsername(data?.username || "");
    setBio(data?.bio || "");
    if (data?.profile_picture) {
      const { data: urlData } = supabase.storage
        .from("profile_pics")
        .getPublicUrl(data.profile_picture);
      setPreview(urlData?.publicUrl || null);
    } else {
      setPreview(null);
    }
  }

  async function saveProfile() {
    setError(null);
    setSuccess(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let profile_picture = userData?.profile_picture;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("profile_pics")
        .upload(filePath, file, { upsert: true });

      if (error) {
        setError(error.message);
        return;
      }

      profile_picture = data?.path;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ username, bio, profile_picture })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Profile updated!");
      load();
    }
  }

  async function deleteProfilePicture() {
    setError(null);
    setSuccess(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (userData?.profile_picture) {
      const { error: deleteError } = await supabase.storage
        .from("profile_pics")
        .remove([userData.profile_picture]);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ profile_picture: null })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setPreview(null);
      setFile(null);
      setSuccess("Profile picture removed!");
      load();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4 bg-rose-50 p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-center text-rose-800 mb-4">
        My Profile
      </h1>

      {/* Profile picture uploader */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-28 h-28 rounded-full border-2 border-dashed border-rose-400 flex items-center justify-center cursor-pointer overflow-hidden bg-white hover:bg-rose-100 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Profile Preview"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl text-rose-400">+</span>
          )}
        </div>
        {preview && (
          <button
            onClick={deleteProfilePicture}
            className="text-sm text-rose-600 hover:underline"
          >
            Remove picture
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Username */}
      <input
        className="border p-2 w-full rounded"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* Bio */}
      <textarea
        className="border p-2 w-full rounded resize-none"
        placeholder="Bio (optional)"
        value={bio}
        maxLength={200}
        onChange={(e) => setBio(e.target.value)}
      />
      <p className="text-xs text-gray-500 text-right">{bio.length}/200</p>

      <button
        onClick={saveProfile}
        className="bg-rose-600 text-white py-2 px-4 rounded hover:bg-rose-700 transition w-full"
      >
        Save
      </button>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 px-3 py-2 rounded mt-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded mt-2 text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
