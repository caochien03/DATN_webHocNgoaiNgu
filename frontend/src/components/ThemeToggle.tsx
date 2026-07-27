"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        className,
      )}
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
