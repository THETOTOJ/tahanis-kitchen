"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { Tables } from "@/types/database.types";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<Tables<"users"> | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  }

  return (
    <nav className="bg-[var(--card)] shadow sticky top-0 z-50">
      <div className="px-4 sm:px-6">
        {/* Desktop & Mobile Header */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/recipes"
            className="font-bold text-lg sm:text-xl text-grandma-brown hover:underline flex-shrink-0"
          >
            🍲 Get Stuffed !
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/"
              className="px-3 py-2 bg-grandma-pink text-grandma-brown rounded-lg shadow hover:bg-grandma-brown hover:text-pink-500 transition text-sm"
            >
              Recipes
            </Link>
            {user && (
              <Link href="/collections" className="hover:underline text-sm">
                Favorites
              </Link>
            )}
            {user && (
              <Link href="/profile" className="hover:underline text-sm">
                Profile
              </Link>
            )}
            {user?.is_admin && (
              <Link href="/admin" className="hover:underline text-sm">
                Admin
              </Link>
            )}
            
            <ThemeSwitcher />
            
            {user ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-grandma-brown text-white rounded text-sm"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 py-1 border rounded bg-white hover:bg-grandma-pink text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Recipes
            </Link>
            {user && (
              <Link
                href="/collections"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favorites
              </Link>
            )}
            {user && (
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
            {user?.is_admin && (
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg bg-grandma-brown text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="block px-3 py-2 rounded-lg border bg-white hover:bg-grandma-pink"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}