import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      data-ocid="theme.toggle"
      aria-label="Toggle theme"
      className="transition-smooth hover:bg-white/10"
    >
      <Sun
        size={16}
        className="rotate-0 scale-100 transition-smooth dark:-rotate-90 dark:scale-0"
      />
      <Moon
        size={16}
        className="absolute rotate-90 scale-0 transition-smooth dark:rotate-0 dark:scale-100"
      />
    </Button>
  );
}
