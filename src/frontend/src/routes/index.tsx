import AIRobot from "@/components/AIRobot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, truncate } from "@/lib/utils";
import { PAGE_HINTS, useAppStore } from "@/stores/appStore";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Brain,
  Clock,
  FileDown,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Home,
  Image,
  LayoutGrid,
  MessageSquare,
  Presentation,
  Sparkles,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STATS = [
  {
    key: "modules",
    icon: Brain,
    value: "10+ AI Modules",
    label: "All-in-one academic platform",
    glow: "#3B82F6",
    color: "text-blue-400",
  },
  {
    key: "free",
    icon: Sparkles,
    value: "100% Free",
    label: "No subscriptions, no limits",
    glow: "#8B5CF6",
    color: "text-purple-400",
  },
  {
    key: "departments",
    icon: GraduationCap,
    value: "All Departments",
    label: "CSE, ECE, EEE, AI, Civil, Mech",
    glow: "#06B6D4",
    color: "text-cyan-400",
  },
];

const MODULES = [
  {
    key: "home",
    emoji: "🏠",
    label: "Home",
    path: "/",
    icon: Home,
    color: "from-blue-400 to-blue-600",
    desc: "Dashboard & recent generations",
  },
  {
    key: "chat",
    emoji: "💬",
    label: "AI Chat",
    path: "/chat",
    icon: MessageSquare,
    color: "from-blue-500 to-blue-600",
    desc: "Smart academic AI assistant",
  },
  {
    key: "image",
    emoji: "🎨",
    label: "Image Generator",
    path: "/image",
    icon: Image,
    color: "from-purple-500 to-purple-600",
    desc: "Diagrams, posters, infographics",
  },
  {
    key: "video",
    emoji: "🎬",
    label: "Video Generator",
    path: "/video",
    icon: Video,
    color: "from-cyan-500 to-cyan-600",
    desc: "Explainer videos & animations",
  },
  {
    key: "website",
    emoji: "🌐",
    label: "Website Generator",
    path: "/website",
    icon: Globe,
    color: "from-blue-500 to-indigo-600",
    desc: "Full HTML/CSS/JS websites",
  },
  {
    key: "document",
    emoji: "📄",
    label: "Document Generator",
    path: "/document",
    icon: FileText,
    color: "from-purple-500 to-violet-600",
    desc: "Reports, assignments, papers",
  },
  {
    key: "ppt",
    emoji: "📊",
    label: "PPT Generator",
    path: "/ppt",
    icon: Presentation,
    color: "from-cyan-500 to-teal-600",
    desc: "Professional presentations",
  },
  {
    key: "pdf",
    emoji: "📘",
    label: "PDF Generator",
    path: "/pdf",
    icon: FileDown,
    color: "from-blue-500 to-blue-700",
    desc: "Structured academic PDFs",
  },
  {
    key: "abstract",
    emoji: "🏆",
    label: "Abstract Generator",
    path: "/abstract",
    icon: Award,
    color: "from-purple-500 to-fuchsia-600",
    desc: "Research paper abstracts",
  },
  {
    key: "project",
    emoji: "🧠",
    label: "Project Builder",
    path: "/project",
    icon: FolderKanban,
    color: "from-cyan-500 to-blue-600",
    desc: "Full engineering projects",
  },
  {
    key: "prompts",
    emoji: "✨",
    label: "Prompt Generator",
    path: "/prompts",
    icon: Sparkles,
    color: "from-cyan-400 to-teal-500",
    desc: "Perfect prompts for every tool",
  },
];

const MODULE_EMOJI_MAP: Record<string, string> = {
  chat: "💬",
  image: "🎨",
  video: "🎬",
  website: "🌐",
  document: "📄",
  ppt: "📊",
  pdf: "📘",
  abstract: "🏆",
  project: "🧠",
  prompts: "✨",
  home: "🏠",
};

// Floating particle positions (stable, not random)
const PARTICLES = [
  { x: "10%", y: "20%", size: 3, delay: 0, color: "#3B82F6" },
  { x: "85%", y: "15%", size: 4, delay: 0.5, color: "#8B5CF6" },
  { x: "70%", y: "70%", size: 2, delay: 1, color: "#06B6D4" },
  { x: "20%", y: "75%", size: 3, delay: 1.5, color: "#8B5CF6" },
  { x: "50%", y: "10%", size: 2, delay: 0.8, color: "#3B82F6" },
  { x: "90%", y: "50%", size: 3, delay: 0.3, color: "#06B6D4" },
  { x: "30%", y: "40%", size: 2, delay: 1.2, color: "#3B82F6" },
  { x: "60%", y: "85%", size: 4, delay: 0.7, color: "#8B5CF6" },
];

// Confetti dot config
const CONFETTI_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#06B6D4",
  "#F59E0B",
  "#10B981",
  "#EC4899",
];
const CONFETTI_COUNT = 24;

interface ConfettiDot {
  id: number;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function generateConfetti(): ConfettiDot[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const angle = (i / CONFETTI_COUNT) * Math.PI * 2;
    const speed = 40 + Math.random() * 60;
    return {
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
    };
  });
}

export default function IndexPage() {
  const { generationHistory, robotState, setRobotState, setCurrentPageHint } =
    useAppStore();
  const recentGenerations = generationHistory.slice(0, 5);
  const [confettiDots, setConfettiDots] = useState<ConfettiDot[]>([]);
  const prevRobotState = useRef(robotState);

  // Update page hint on mount
  useEffect(() => {
    setCurrentPageHint(PAGE_HINTS["/"]);
    setRobotState("idle");
  }, [setCurrentPageHint, setRobotState]);

  // Trigger confetti on celebration
  useEffect(() => {
    if (
      robotState === "celebration" &&
      prevRobotState.current !== "celebration"
    ) {
      const dots = generateConfetti();
      setConfettiDots(dots);
      const timer = setTimeout(() => setConfettiDots([]), 1600);
      return () => clearTimeout(timer);
    }
    prevRobotState.current = robotState;
  }, [robotState]);

  const scrollToModules = () => {
    document
      .getElementById("modules-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden px-6 py-16 md:py-20"
        data-ocid="home.hero.section"
      >
        {/* Animated gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 left-1/4 h-96 w-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{
              background: "radial-gradient(circle, #3B82F6, transparent)",
            }}
          />
          <div
            className="absolute -top-20 right-1/4 h-80 w-80 rounded-full opacity-15 blur-3xl animate-pulse"
            style={{
              background: "radial-gradient(circle, #8B5CF6, transparent)",
              animationDelay: "1s",
            }}
          />
          {/* Floating particles */}
          {PARTICLES.map((p) => (
            <motion.div
              key={`particle-${p.x}-${p.y}`}
              className="absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: p.size * 2,
                height: p.size * 2,
                background: p.color,
                opacity: 0.5,
              }}
              animate={{ y: [0, -18, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{
                duration: 3 + p.delay * 0.4,
                delay: p.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Two-column hero: text + robot */}
        <div className="relative mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-8">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex-1 text-center md:text-left"
          >
            <Badge
              variant="outline"
              className="mb-6 border-primary/30 bg-primary/5 text-primary px-4 py-1.5 text-xs font-semibold tracking-wider uppercase"
            >
              <Sparkles size={12} className="mr-2" />
              AI-Powered Academic Lab
            </Badge>

            {/* Logo icon */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, type: "spring" }}
              className="mb-6 flex justify-center md:justify-start"
            >
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #3B82F6, #8B5CF6, #06B6D4)",
                }}
              >
                <Brain size={42} className="text-white drop-shadow-lg" />
                <div
                  className="absolute -inset-1.5 rounded-3xl opacity-40 blur-xl animate-pulse"
                  style={{
                    background:
                      "linear-gradient(135deg, #3B82F6, #8B5CF6, #06B6D4)",
                  }}
                />
              </div>
            </motion.div>

            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="gradient-text">AI THOZHANX 2.O</span>
            </h1>
            <p className="mt-3 font-display text-lg font-medium text-muted-foreground md:text-xl">
              For Students <span className="text-muted-foreground/60">•</span>{" "}
              <span className="gradient-text">Ungal AI Nanban</span>
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0">
              Your complete AI-powered academic lab — generate documents, code,
              presentations, and more in seconds.
            </p>

            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
              <Button
                asChild
                size="lg"
                className="border-0 font-semibold text-white shadow-glow px-7"
                style={{
                  background:
                    "linear-gradient(135deg, #3B82F6, #8B5CF6, #06B6D4)",
                }}
                data-ocid="home.start.primary_button"
              >
                <Link to="/chat">
                  <MessageSquare size={16} className="mr-2" />
                  Start Generating
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 px-7 font-semibold transition-smooth"
                onClick={scrollToModules}
                data-ocid="home.explore.secondary_button"
              >
                <LayoutGrid size={16} className="mr-2" />
                Explore Modules
              </Button>
            </div>
          </motion.div>

          {/* Right: AI Robot */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
            className="relative flex-shrink-0"
            data-ocid="home.robot.section"
          >
            {/* Confetti dots */}
            <AnimatePresence>
              {confettiDots.map((dot) => (
                <motion.div
                  key={dot.id}
                  className="absolute rounded-full pointer-events-none z-30"
                  style={{
                    width: 8,
                    height: 8,
                    background: dot.color,
                    left: "50%",
                    top: "50%",
                    translateX: "-50%",
                    translateY: "-50%",
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: dot.vx,
                    y: dot.vy,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>

            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-cyan-500/20 via-purple-500/10 to-blue-600/20 blur-2xl pointer-events-none scale-110" />

            {/* Hint badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap"
            >
              <Badge className="bg-primary/20 border border-primary/30 text-primary text-[11px] px-3 py-1 shadow-glow backdrop-blur-sm">
                {PAGE_HINTS["/"]}
              </Badge>
            </motion.div>

            <AIRobot
              size="dashboard"
              draggable={true}
              showBubble={true}
              className="relative z-10"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section
        className="border-y border-border/50 bg-muted/20 px-6 py-8"
        data-ocid="home.stats.section"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-5 flex flex-col items-center gap-2 text-center"
              data-ocid={`home.stat.item.${i + 1}`}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${stat.glow}22` }}
              >
                <stat.icon size={20} style={{ color: stat.glow }} />
              </div>
              <p className={`font-display text-base font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modules Grid */}
      <section
        id="modules-section"
        className="px-6 py-14"
        data-ocid="home.modules.section"
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="font-display text-3xl font-bold text-foreground">
              Choose Your <span className="gradient-text">AI Tool</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need for academic success — all in one platform.
            </p>
          </motion.div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                data-ocid={`home.module.item.${i + 1}`}
              >
                <Link to={mod.path} className="group block h-full">
                  <div className="card-3d glass rounded-2xl p-4 h-full flex flex-col gap-3 transition-smooth group-hover:border-white/20">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${mod.color} shadow-md text-xl`}
                    >
                      {mod.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xs font-semibold text-foreground leading-tight">
                        {mod.label}
                      </h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {mod.desc}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-smooth"
                      style={{ color: "#8B5CF6" }}
                    >
                      Open →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Generations */}
      <section
        className="border-t border-border/50 bg-muted/20 px-6 py-12"
        data-ocid="home.recent.section"
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center justify-between"
          >
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Recent <span className="gradient-text">Generations</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your latest AI creations
              </p>
            </div>
            {recentGenerations.length > 0 && (
              <Badge
                variant="outline"
                className="border-primary/30 text-muted-foreground"
              >
                {generationHistory.length} total
              </Badge>
            )}
          </motion.div>

          {recentGenerations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="glass rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
              data-ocid="home.recent.empty_state"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, #3B82F6, #8B5CF6, #06B6D4)",
                }}
              >
                ✨
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                No generations yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start creating with any of the AI modules above. Your work will
                appear here.
              </p>
              <Button
                asChild
                className="mt-2 border-0 text-white font-semibold"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                }}
                data-ocid="home.recent.start_button"
              >
                <Link to="/chat">Start Generating →</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3" data-ocid="home.recent.list">
              {recentGenerations.map((gen, i) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="glass rounded-xl p-4 flex items-start gap-4 hover:border-white/20 transition-smooth"
                  data-ocid={`home.recent.item.${i + 1}`}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #3B82F660, #8B5CF660)",
                    }}
                  >
                    {MODULE_EMOJI_MAP[gen.moduleType] ?? "✨"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary text-[11px] px-2 py-0.5 capitalize"
                    >
                      {gen.moduleType}
                    </Badge>
                    <p className="mt-1 text-sm text-foreground font-medium truncate">
                      {truncate(gen.prompt, 80)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground/60">
                    <Clock size={11} />
                    <span>{formatDate(gen.timestamp)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t border-border/50 bg-card px-6 py-8 text-center"
        data-ocid="home.footer.section"
      >
        <p className="gradient-text font-display text-sm font-semibold">
          Built by KISHORE V with ❤️
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          © 2026 AI THOZHANX 2.O – For Students. All rights reserved.
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground/40">
          Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-muted-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
