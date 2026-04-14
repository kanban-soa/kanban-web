"use client";

import * as React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
export type FontSize = "small" | "medium" | "large";

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

function applyFontSize(fontSize: FontSize) {
  const root = document.documentElement;
  root.style.setProperty("--app-font-size", FONT_SIZE_MAP[fontSize]);
  root.style.fontSize = FONT_SIZE_MAP[fontSize];
  root.dataset.fontSize = fontSize;
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [fontSize, setFontSizeState] = React.useState<FontSize>("medium");

  React.useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setThemeState(initial);
      applyTheme(initial);
    }

    const storedFontSize = window.localStorage.getItem("font-size");
    if (storedFontSize === "small" || storedFontSize === "medium" || storedFontSize === "large") {
      setFontSizeState(storedFontSize);
      applyFontSize(storedFontSize);
    } else {
      applyFontSize("medium");
    }
  }, []);

  const setTheme = React.useCallback((next: Theme | ((prev: Theme) => Theme)) => {
    setThemeState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      applyTheme(resolved);
      window.localStorage.setItem("theme", resolved);
      return resolved;
    });
  }, []);

  const setFontSize = React.useCallback((next: FontSize | ((prev: FontSize) => FontSize)) => {
    setFontSizeState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      applyFontSize(resolved);
      window.localStorage.setItem("font-size", resolved);
      return resolved;
    });
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const value = React.useMemo(
    () => ({ theme, toggleTheme, setTheme, fontSize, setFontSize }),
    [theme, toggleTheme, setTheme, fontSize, setFontSize],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className={cn("h-8 w-8", className)}
    >
      {theme === "dark" ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <MoonStar className="h-4 w-4" />
      )}
    </Button>
  );
}
