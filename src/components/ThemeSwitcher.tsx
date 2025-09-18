"use client";
import { useEffect, useState } from "react";

const themes = [
  { id: "light", emoji: "🌞" },
  { id: "chocolate", emoji: "🍫" },
  { id: "matcha", emoji: "🍵" },
  { id: "strawberry", emoji: "🍓" },
  { id: "blueberry", emoji: "🫐" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");
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
        className="h-8 w-8 flex items-center justify-center text-lg rounded border shadow-sm"
        style={{ background: "var(--card)" }}
      >
        {themes.find((t) => t.id === theme)?.emoji}
      </button>
      {open && (
        <div
          className="absolute mt-1 left-0 border rounded shadow z-50 flex flex-col"
          style={{ background: "var(--card)" }}
        >
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className="h-8 w-8 flex items-center justify-center text-lg hover:opacity-80 rounded"
              style={{ background: "transparent" }}
            >
              {t.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
