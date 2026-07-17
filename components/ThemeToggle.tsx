"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

/**
 * Text link that switches the site-wide theme. Shows the theme you would
 * switch TO ("Light" while dark is active, and vice versa). The choice is
 * persisted in localStorage and applied before first paint by the inline
 * script in the root layout.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === "light" ? "light" : "dark"
    );
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode */
    }
  };

  return (
    <button
      onClick={toggle}
      className={`label-mono link-underline cursor-pointer ${className}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
