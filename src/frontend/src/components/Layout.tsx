import AIRobot from "@/components/AIRobot";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PAGE_HINTS, useAppStore } from "@/stores/appStore";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Award,
  Brain,
  FileDown,
  FileText,
  FolderKanban,
  Globe,
  Home,
  Image,
  Menu,
  MessageSquare,
  Presentation,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    path: "/",
    icon: <Home size={18} />,
    color: "from-blue-500 to-cyan-400",
  },
  {
    label: "AI Chat",
    path: "/chat",
    icon: <MessageSquare size={18} />,
    color: "from-purple-500 to-blue-500",
  },
  {
    label: "Image Generator",
    path: "/image",
    icon: <Image size={18} />,
    color: "from-pink-500 to-purple-500",
  },
  {
    label: "Video Generator",
    path: "/video",
    icon: <Video size={18} />,
    color: "from-red-500 to-pink-500",
  },
  {
    label: "Website Generator",
    path: "/website",
    icon: <Globe size={18} />,
    color: "from-cyan-500 to-blue-500",
  },
  {
    label: "Document Generator",
    path: "/document",
    icon: <FileText size={18} />,
    color: "from-blue-500 to-indigo-500",
  },
  {
    label: "PPT Generator",
    path: "/ppt",
    icon: <Presentation size={18} />,
    color: "from-orange-500 to-yellow-500",
  },
  {
    label: "PDF Generator",
    path: "/pdf",
    icon: <FileDown size={18} />,
    color: "from-rose-500 to-red-500",
  },
  {
    label: "Abstract Generator",
    path: "/abstract",
    icon: <Award size={18} />,
    color: "from-emerald-500 to-cyan-500",
  },
  {
    label: "Project Builder",
    path: "/project",
    icon: <FolderKanban size={18} />,
    color: "from-violet-500 to-purple-500",
  },
  {
    label: "Prompts",
    path: "/prompts",
    icon: <Sparkles size={18} />,
    color: "from-cyan-400 to-blue-500",
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

function SidebarContent({
  currentPath,
  onClose,
}: { currentPath: string; onClose?: () => void }) {
  const { robotState, currentPageHint } = useAppStore();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 shadow-glow">
          <Brain size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="gradient-text font-display text-sm font-bold leading-tight">
            AI THOZHANX 2.O
          </p>
          <p className="text-[10px] text-muted-foreground">Ungal AI Nanban</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <Separator className="opacity-30" />

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-smooth group relative",
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-accent/10 text-foreground border border-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                {isActive && (
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b",
                      item.color,
                    )}
                  />
                )}
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md transition-smooth",
                    isActive
                      ? `bg-gradient-to-br ${item.color} text-white shadow-sm`
                      : "bg-white/5 group-hover:bg-white/10",
                  )}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="opacity-30" />

      {/* Mini Robot above footer */}
      <div className="flex flex-col items-center gap-2 px-4 py-3 bg-gradient-to-b from-transparent to-primary/5">
        {/* Hint bubble */}
        <motion.div
          key={currentPageHint}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full rounded-xl border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-center"
        >
          <p className="text-[10px] text-primary/80 font-medium leading-snug line-clamp-2">
            {currentPageHint}
          </p>
        </motion.div>

        {/* Mini robot */}
        <AIRobot
          size="floating"
          stateOverride={robotState}
          showBubble={false}
          draggable={false}
          className="opacity-90"
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-3">
        <p className="text-[11px] text-muted-foreground text-center">
          Built by{" "}
          <span className="gradient-text font-semibold">KISHORE V</span>
        </p>
        <p className="text-[10px] text-muted-foreground/60 text-center mt-0.5">
          © 2026 AI THOZHANX 2.O
        </p>
      </div>
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { setRobotState, setCurrentPageHint } = useAppStore();

  // Update robot state and page hint on route change
  useEffect(() => {
    setRobotState("idle");
    const hint =
      PAGE_HINTS[currentPath] ?? "Let's create something amazing! 🚀";
    setCurrentPageHint(hint);
  }, [currentPath, setRobotState, setCurrentPageHint]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">
        <SidebarContent currentPath={currentPath} />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-background/95 backdrop-blur-xl lg:hidden"
            >
              <SidebarContent
                currentPath={currentPath}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-card/80 px-4 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              data-ocid="sidebar.open_modal_button"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </Button>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500">
                <Brain size={14} className="text-white" />
              </div>
              <span className="gradient-text font-display text-sm font-bold">
                AI THOZHANX 2.O
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {NAV_ITEMS.find((n) => n.path === currentPath)?.label ??
                  "AI THOZHANX 2.O"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white shadow-glow"
              title="Student"
            >
              S
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
