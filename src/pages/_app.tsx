import { Metadata } from "next";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "Get Stuffed!",
  description: "Collaborative cooking blog",
  openGraph: {
    title: "Get Stuffed!",
    description: "Collaborative cooking blog",
    url: "https://get-stuffed.vercel.app/",
    siteName: "Get Stuffed!",
    images: [
      {
        url: "/preview.gif",
        width: 1200,
        height: 630,
        alt: "Get Stuffed! Preview",
        type: "image/gif",
      },
    ],
    type: "website",
  },
  keywords: [
    "recipe app",
    "cooking together",
    "vegan friendly",
    "yummy",
    "delicious",
    "Get Stuffed!",
  ],
  authors: [{ name: "THETOTOJ on Github" }],
  icons: {
    icon: "/favicon.ico", // Favicon icon
    shortcut: "/favicon-16x16.png", // Shortcut icon
    apple: "/apple-touch-icon.png", // Apple touch icon
  },
};

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session);

      if (event === "SIGNED_IN") {
        console.log("User logged in:", session?.user);
      }
      if (event === "SIGNED_OUT") {
        console.log("User signed out");
      }
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery flow started");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Navbar />
      <main className="p-4">
        <Component {...pageProps} />
      </main>
      <InstallPrompt />
    </>
  );
}
