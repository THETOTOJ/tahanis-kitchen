"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { Tables } from "@/types/database.types";

export default function Navbar() {
  const [user, setUser] = useState<Tables<"users"> | null>(null);

  useEffect(() => {
    getUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function getUser() {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setUser(null);
      return;
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (error || !userData) {
      console.error("Error fetching user data:", error);

      const fallbackUser: Tables<"users"> = {
        id: authData.user.id,
        email: authData.user.email ?? null,
        banned: null,
        bio: null,
        created_at: null,
        is_admin: null,
        profile_picture: null,
        username: null,
      };
      setUser(fallbackUser);
    } else {
      setUser(userData);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-[var(--card)] shadow sticky top-0 z-50">
      {/* Left Side */}
      <div className="flex items-center gap-6">
        <Link
          href="/recipes"
          className="font-bold text-lg text-grandma-brown hover:underline"
        >
          🍲 Tahani’s Kitchen
        </Link>
        <Link
          href="/"
          className="px-4 py-2 bg-grandma-pink text-grandma-brown rounded-lg shadow hover:bg-grandma-brown hover:text-pink-500 transition"
        >
          Recipes
        </Link>
        {user && (
          <Link href="/collections" className="hover:underline">
            Favorites
          </Link>
        )}
        {user && (
          <Link href="/profile" className="hover:underline">
            Profile
          </Link>
        )}
        {user?.is_admin && (
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        {user ? (
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-grandma-brown text-white rounded"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/auth/login"
            className="px-3 py-1 border rounded bg-white hover:bg-grandma-pink"
          >
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
}
