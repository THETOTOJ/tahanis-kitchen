"use client";
import { useEffect, useState } from "react";

const themes = [
  { id: "light", emoji: "☀️", name: "Vanilla" },
  { id: "honey", emoji: "🍯", name: "Honeycomb" },
  { id: "lavender", emoji: "💜", name: "Lavender" },
  { id: "mint", emoji: "🌿", name: "Mint" },
  { id: "chocolate", emoji: "🍫", name: "Chocolate" },
  { id: "coffee", emoji: "☕", name: "Espresso" },
  { id: "plum", emoji: "🌙", name: "Plum" },
  { id: "forest", emoji: "🌲", name: "Thyme" },
  { id: "berry", emoji: "🫐", name: "Berry Jam" },
  { id: "cocoa", emoji: "🥛", name: "Brownie" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("chocolate");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "light";
    setTheme(stored);
    document.documentElement.dataset.theme = stored;
  }, []);

  function changeTheme(newTheme: string) {
    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="theme-button h-9 px-3 flex items-center gap-2 text-base rounded-lg border shadow-sm transition-all hover:shadow-md"
        style={{
          background: "var(--card)",
          color: "var(--foreground)",
          borderColor: "var(--border)"
        }}
      >
        <span>{themes.find((t) => t.id === theme)?.emoji}</span>
        <span className="hidden sm:inline text-sm">
          {themes.find((t) => t.id === theme)?.name}
        </span>
      </button>
      {open && (
        <div
          className="absolute mt-2 right-0 border rounded-lg shadow-lg z-50 p-2 w-48 max-h-96 overflow-y-auto"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)"
          }}
        >
          <div className="text-xs font-semibold mb-2 px-2" style={{ color: "var(--muted)" }}>
            LIGHT THEMES
          </div>
          {themes.slice(0, 4).map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className="theme-button w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-opacity-80 transition-colors"
              style={{
                background: theme === t.id ? "var(--accent)" : "transparent",
                color: "var(--foreground)"
              }}
            >
              <span className="text-lg">{t.emoji}</span>
              <span>{t.name}</span>
            </button>
          ))}

          <div className="text-xs font-semibold mt-3 mb-2 px-2" style={{ color: "var(--muted)" }}>
            DARK THEMES
          </div>
          {themes.slice(4).map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className="theme-button w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-opacity-80 transition-colors"
              style={{
                background: theme === t.id ? "var(--accent)" : "transparent",
                color: "var(--foreground)"
              }}
            >
              <span className="text-lg">{t.emoji}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}