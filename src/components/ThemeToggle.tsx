"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";
const KEY = "theme";

function applyTheme(mode: Mode) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (mode === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
    // For "system", clear classes so the @media query takes over
    root.classList.remove("light", "dark");
  } else {
    root.classList.add(mode);
  }
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Mode | null) ?? "system";
    setMode(saved);
    setMounted(true);
  }, []);

  const cycle = () => {
    const next: Mode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    localStorage.setItem(KEY, next);
    applyTheme(next);
  };

  if (!mounted) {
    return <div className="w-11 h-11" />; // placeholder to prevent layout shift
  }

  const label = mode === "system" ? "💻" : mode === "light" ? "☀️" : "🌙";
  const title =
    mode === "system" ? "跟隨系統" : mode === "light" ? "淺色模式" : "深色模式";

  return (
    <button
      onClick={cycle}
      title={`目前：${title}（點擊切換）`}
      aria-label={`切換主題：${title}`}
      className="w-11 h-11 flex items-center justify-center rounded-full text-xl active:bg-zinc-100 dark:active:bg-zinc-800"
    >
      {label}
    </button>
  );
}
