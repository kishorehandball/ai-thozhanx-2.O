import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generatePPTSlides } from "@/lib/mockAI";
import { cn, copyToClipboard } from "@/lib/utils";
import { PAGE_HINTS, useAppStore } from "@/stores/appStore";
import type { Slide } from "@/types";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Download,
  GripVertical,
  Pencil,
  Plus,
  Presentation,
  RefreshCw,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Theme {
  id: string;
  label: string;
  bg: string;
  titleColor: string;
  bulletColor: string;
  badgeBg: string;
  gradient: string;
  accent: string;
}

const THEMES: Theme[] = [
  {
    id: "professional",
    label: "Professional",
    bg: "from-slate-900 via-blue-950 to-slate-900",
    titleColor: "text-white",
    bulletColor: "text-blue-100",
    badgeBg: "bg-blue-500/20 border-blue-400/40 text-blue-200",
    gradient: "from-blue-600 to-blue-900",
    accent: "#3b82f6",
  },
  {
    id: "creative",
    label: "Creative",
    bg: "from-purple-950 via-violet-900 to-fuchsia-950",
    titleColor: "text-white",
    bulletColor: "text-purple-100",
    badgeBg: "bg-purple-400/20 border-purple-400/40 text-purple-200",
    gradient: "from-purple-500 to-fuchsia-600",
    accent: "#8b5cf6",
  },
  {
    id: "academic",
    label: "Academic",
    bg: "from-blue-950 via-sky-900 to-blue-900",
    titleColor: "text-sky-100",
    bulletColor: "text-sky-200",
    badgeBg: "bg-sky-500/20 border-sky-400/40 text-sky-200",
    gradient: "from-sky-500 to-blue-700",
    accent: "#06b6d4",
  },
  {
    id: "modern",
    label: "Modern",
    bg: "from-blue-900 via-purple-900 to-cyan-900",
    titleColor: "text-white",
    bulletColor: "text-cyan-100",
    badgeBg: "bg-cyan-400/20 border-cyan-400/40 text-cyan-200",
    gradient: "from-blue-500 via-purple-600 to-cyan-500",
    accent: "#06b6d4",
  },
  {
    id: "minimal",
    label: "Minimal",
    bg: "from-gray-50 to-white",
    titleColor: "text-gray-900",
    bulletColor: "text-gray-700",
    badgeBg: "bg-gray-100 border-gray-300 text-gray-600",
    gradient: "from-gray-300 to-gray-100",
    accent: "#374151",
  },
];

const SLIDE_COUNTS = [5, 8, 10, 15, 20];
const AUDIENCES = ["Students", "Professionals", "Academic", "General"];
const SAMPLE_TOPICS = [
  "Introduction to Artificial Intelligence",
  "IoT Smart Home Architecture",
  "Machine Learning Project Overview",
  "Civil Engineering Bridge Design",
];
const DEPARTMENTS = [
  "CSE",
  "ECE",
  "EEE",
  "AI & DS",
  "AI & ML",
  "CIVIL",
  "MECH",
  "IT",
];
const INCLUDE_OPTIONS = [
  "Title Slide",
  "Hook Slide",
  "Content Slides",
  "Visual Slide",
  "Summary / Conclusion",
  "Q&A Slide",
];

const TYPE_LABEL: Record<string, string> = {
  title: "Title",
  hook: "Hook",
  concept: "Content",
  visual: "Visual",
  summary: "Summary",
};

const TYPE_DOT: Record<string, string> = {
  title: "bg-blue-400",
  hook: "bg-orange-400",
  concept: "bg-violet-400",
  visual: "bg-pink-400",
  summary: "bg-emerald-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PPTGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(8);
  const [themeId, setThemeId] = useState("professional");
  const [audience, setAudience] = useState("Students");
  const [department, setDepartment] = useState("");
  const [includes, setIncludes] = useState<string[]>([
    "Title Slide",
    "Hook Slide",
    "Content Slides",
    "Summary / Conclusion",
  ]);
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingBulletIdx, setEditingBulletIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const bulletInputRef = useRef<HTMLTextAreaElement>(null);

  const { setRobotState, setCurrentPageHint, addToHistory } = useAppStore();

  const activeTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const activeSlide = slides[current];

  // ── Keyboard navigation ──────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        editingTitle ||
        editingBulletIdx !== null ||
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      )
        return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCurrent((c) => Math.max(0, c - 1));
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setCurrent((c) => Math.min(slides.length - 1, c + 1));
      }
    },
    [slides.length, editingTitle, editingBulletIdx],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Focus on edit ────────────────────────────────────────────────────────
  useEffect(() => {
    if (editingTitle) setTimeout(() => titleInputRef.current?.focus(), 50);
  }, [editingTitle]);
  useEffect(() => {
    if (editingBulletIdx !== null)
      setTimeout(() => bulletInputRef.current?.focus(), 50);
  }, [editingBulletIdx]);

  // Set page hint on mount + pre-fill from localStorage
  useEffect(() => {
    setCurrentPageHint(PAGE_HINTS["/ppt"]);
    setRobotState("idle");
    const pending = localStorage.getItem("thozhanx-pending-prompt-ppt");
    if (pending) {
      setTopic(pending);
      localStorage.removeItem("thozhanx-pending-prompt-ppt");
    }
  }, [setCurrentPageHint, setRobotState]);

  // ── Generate ─────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setLoading(true);
    setRobotState("thinking");
    await new Promise((r) => setTimeout(r, 2000));
    const generated = generatePPTSlides(
      topic + (department ? ` (${department})` : ""),
    );
    setSlides(generated);
    setCurrent(0);
    setLoading(false);

    setRobotState("celebration");
    setTimeout(() => setRobotState("idle"), 2000);

    addToHistory({
      moduleType: "ppt",
      prompt: topic.slice(0, 60),
      output: `${generated.length} slides`,
    });
    toast.success(`${generated.length} slides generated!`);
  };

  // ── Slide mutation helpers ────────────────────────────────────────────────
  const updateSlide = (idx: number, patch: Partial<Slide>) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    );
  };

  const commitTitleEdit = () => {
    if (activeSlide) updateSlide(current, { title: editValue });
    setEditingTitle(false);
  };

  const commitBulletEdit = (bulletIdx: number) => {
    if (activeSlide) {
      const newBullets = [...activeSlide.bullets];
      newBullets[bulletIdx] = editValue;
      updateSlide(current, { bullets: newBullets });
    }
    setEditingBulletIdx(null);
  };

  const addSlide = () => {
    const newSlide: Slide = {
      type: "concept",
      title: "New Slide",
      bullets: ["Add your content here", "Another key point"],
      notes: "Presenter notes for this slide.",
    };
    const updated = [...slides];
    updated.splice(current + 1, 0, newSlide);
    setSlides(updated);
    setCurrent(current + 1);
    toast.success("Slide added");
  };

  const deleteSlide = () => {
    if (slides.length <= 1) {
      toast.error("Cannot delete the only slide");
      return;
    }
    const updated = slides.filter((_, i) => i !== current);
    setSlides(updated);
    setCurrent(Math.min(current, updated.length - 1));
    toast.success("Slide deleted");
  };

  const downloadOutline = async () => {
    if (!slides.length) return;
    toast.loading("Building PPTX…", { id: "ppt-dl" });
    try {
      const { default: PptxGenJS } = await import("pptxgenjs");
      const prs = new PptxGenJS();
      prs.title = topic;
      prs.subject = `${activeTheme.label} · ${audience}`;
      prs.author = "AI THOZHANX 2.O";

      const THEME_BG_COLORS: Record<string, string> = {
        professional: "0f172a",
        creative: "3b0764",
        academic: "0c1a2e",
        modern: "0f0f1a",
        minimal: "ffffff",
      };
      const THEME_TITLE_COLORS: Record<string, string> = {
        professional: "DBEAFE",
        creative: "F3E8FF",
        academic: "BAE6FD",
        modern: "CFFAFE",
        minimal: "1e293b",
      };
      const THEME_BODY_COLORS: Record<string, string> = {
        professional: "BFDBFE",
        creative: "E9D5FF",
        academic: "BAE6FD",
        modern: "A5F3FC",
        minimal: "374151",
      };
      const THEME_ACCENT_COLORS: Record<string, string> = {
        professional: "3B82F6",
        creative: "8B5CF6",
        academic: "06B6D4",
        modern: "06B6D4",
        minimal: "374151",
      };

      const bgColor = THEME_BG_COLORS[themeId] ?? "0f172a";
      const titleColor = THEME_TITLE_COLORS[themeId] ?? "FFFFFF";
      const bodyColor = THEME_BODY_COLORS[themeId] ?? "E2E8F0";
      const accentColor = THEME_ACCENT_COLORS[themeId] ?? "6366F1";
      const isLight = themeId === "minimal";

      for (const [idx, slide] of slides.entries()) {
        const pptSlide = prs.addSlide();

        // Background
        pptSlide.background = { color: bgColor };

        // Top accent bar
        pptSlide.addShape(prs.ShapeType.rect, {
          x: 0,
          y: 0,
          w: "100%",
          h: 0.07,
          fill: { color: accentColor },
          line: { color: accentColor },
        });

        // Slide number badge
        pptSlide.addText(`${idx + 1} / ${slides.length}`, {
          x: 8.5,
          y: 0.15,
          w: 1.2,
          h: 0.25,
          fontSize: 9,
          color: isLight ? "9ca3af" : "6B7280",
          align: "right",
        });

        // Slide type label
        const typeLabel = TYPE_LABEL[slide.type] ?? "Content";
        pptSlide.addText(typeLabel.toUpperCase(), {
          x: 0.4,
          y: 0.15,
          w: 2,
          h: 0.25,
          fontSize: 8,
          color: accentColor,
          bold: true,
        });

        // Title
        const isTitleSlide = slide.type === "title";
        pptSlide.addText(slide.title, {
          x: 0.5,
          y: isTitleSlide ? 1.8 : 0.65,
          w: 9,
          h: isTitleSlide ? 1.4 : 0.8,
          fontSize: isTitleSlide ? 36 : 26,
          bold: true,
          color: titleColor,
          fontFace: "Calibri",
          align: isTitleSlide ? "center" : "left",
          wrap: true,
        });

        // Subtitle (title slides only)
        if (slide.subtitle && isTitleSlide) {
          pptSlide.addText(slide.subtitle, {
            x: 0.5,
            y: 3.2,
            w: 9,
            h: 0.5,
            fontSize: 16,
            color: bodyColor,
            align: "center",
            italic: true,
          });
        }

        // Bullets
        if (!isTitleSlide && slide.bullets.length > 0) {
          const bulletY = 1.6;
          const availH = 3.8;
          const perBullet = Math.min(0.55, availH / slide.bullets.length);
          slide.bullets.forEach((bullet, bi) => {
            pptSlide.addText(`›  ${bullet}`, {
              x: 0.5,
              y: bulletY + bi * perBullet,
              w: 9,
              h: perBullet,
              fontSize: 14,
              color: bodyColor,
              fontFace: "Calibri",
              wrap: true,
            });
          });
        }

        // Presenter notes
        if (slide.notes) {
          pptSlide.addNotes(slide.notes);
        }

        // Bottom bar
        pptSlide.addShape(prs.ShapeType.rect, {
          x: 0,
          y: 5.35,
          w: "100%",
          h: 0.08,
          fill: { color: accentColor, transparency: 70 },
          line: { color: accentColor, transparency: 70 },
        });
        pptSlide.addText("Generated by AI THOZHANX 2.O · © 2026", {
          x: 0.4,
          y: 5.45,
          w: 6,
          h: 0.2,
          fontSize: 7,
          color: isLight ? "9ca3af" : "4B5563",
        });
      }

      const fileName = `thozhanx-presentation-${Date.now()}.pptx`;
      await prs.writeFile({ fileName });
      toast.success("PPTX downloaded!", { id: "ppt-dl" });
    } catch (err) {
      console.error(err);
      toast.error("PPTX export failed", { id: "ppt-dl" });
    }
  };

  const copyOutline = async () => {
    const text = slides
      .map(
        (s, i) =>
          `SLIDE ${i + 1}: ${s.title}\n${s.bullets.map((b) => `  • ${b}`).join("\n")}`,
      )
      .join("\n\n");
    await copyToClipboard(text);
    toast.success("Outline copied to clipboard");
  };

  const toggleInclude = (opt: string) => {
    setIncludes((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt],
    );
  };

  const isMinimal = themeId === "minimal";

  return (
    <div className="min-h-full p-4 md:p-6" data-ocid="ppt.page">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-glow-purple">
            <Presentation size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold gradient-text">
              PPT Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Gamma AI Style — Professional presentations in seconds
            </p>
          </div>
        </div>

        {/* ── Input Panel ── */}
        <div
          className="glassmorphism rounded-2xl p-5 space-y-5"
          data-ocid="ppt.config.panel"
        >
          {/* Topic + Generate */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="ppt-topic"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Presentation Topic
              </Label>
              <Input
                id="ppt-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Artificial Intelligence in Healthcare"
                className="bg-white/5 border-white/10 h-11 text-sm"
                data-ocid="ppt.topic.input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") generate();
                }}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SAMPLE_TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    data-ocid="ppt.sample_topic.button"
                    className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-smooth border border-primary/20 truncate max-w-[200px]"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <Button
                onClick={generate}
                disabled={loading || !topic.trim()}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 h-11 px-7 font-semibold shadow-glow-purple"
                data-ocid="ppt.generate.submit_button"
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 size={15} className="mr-2" />
                    Generate Slides
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Slide count */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Slides
              </Label>
              <div className="flex gap-1.5 flex-wrap">
                {SLIDE_COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSlideCount(n)}
                    data-ocid={`ppt.slidecount.${n}`}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth border",
                      slideCount === n
                        ? "bg-primary text-primary-foreground border-primary shadow-glow-blue"
                        : "border-white/10 text-muted-foreground hover:border-primary/50 hover:text-foreground bg-white/5",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Audience
              </Label>
              <div className="flex gap-1.5 flex-wrap">
                {AUDIENCES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAudience(a)}
                    data-ocid={`ppt.audience.${a.toLowerCase()}`}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth border",
                      audience === a
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "border-white/10 text-muted-foreground hover:border-secondary/50 hover:text-foreground bg-white/5",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Department / Subject (optional) */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Department{" "}
                <span className="normal-case opacity-60">(optional)</span>
              </Label>
              <div className="flex gap-1 flex-wrap">
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepartment(department === d ? "" : d)}
                    data-ocid={`ppt.dept.${d.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
                    className={cn(
                      "px-2 py-1 rounded-md text-[11px] font-medium transition-smooth border",
                      department === d
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-white/10 text-muted-foreground hover:border-accent/30 bg-white/5",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Include
              </Label>
              <div className="flex gap-1.5 flex-wrap">
                {INCLUDE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleInclude(opt)}
                    data-ocid={`ppt.include.${opt.toLowerCase().replace(/[\s/]+/g, "_")}`}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-smooth border flex items-center gap-1",
                      includes.includes(opt)
                        ? "bg-accent/20 text-accent-foreground border-accent/40"
                        : "border-white/10 text-muted-foreground hover:border-accent/30 bg-white/5",
                    )}
                  >
                    {includes.includes(opt) && <Check size={10} />}
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Theme selector */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Theme
            </Label>
            <div className="flex gap-3 flex-wrap">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  data-ocid={`ppt.theme.${t.id}`}
                  className={cn(
                    "relative rounded-xl overflow-hidden transition-smooth border-2 w-24 h-14",
                    themeId === t.id
                      ? "border-primary scale-105 shadow-glow-blue"
                      : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30",
                  )}
                  title={t.label}
                >
                  <div
                    className={cn("absolute inset-0 bg-gradient-to-br", t.bg)}
                  />
                  <div className="absolute inset-0 flex flex-col justify-center px-2 gap-1">
                    <div
                      className={cn(
                        "h-1.5 rounded w-2/3 bg-gradient-to-r",
                        t.gradient,
                      )}
                    />
                    <div className="h-0.5 rounded w-full bg-white/20" />
                    <div className="h-0.5 rounded w-4/5 bg-white/15" />
                  </div>
                  <div className="absolute bottom-1 right-1">
                    <span className="text-[9px] text-white/70 font-semibold leading-none">
                      {t.label}
                    </span>
                  </div>
                  {themeId === t.id && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      <Check size={8} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism rounded-2xl p-10 text-center"
            data-ocid="ppt.loading_state"
          >
            <div className="relative mx-auto mb-4 w-12 h-12">
              <Presentation
                size={40}
                className="mx-auto text-violet-400 animate-pulse"
              />
            </div>
            <p className="font-semibold text-foreground mb-1">
              Building your presentation…
            </p>
            <p className="text-xs text-muted-foreground">
              Generating {slideCount} slides for "{topic}"
            </p>
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {!slides.length && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glassmorphism rounded-2xl p-14 text-center"
            data-ocid="ppt.empty_state"
          >
            <Presentation
              size={48}
              className="mx-auto mb-4 text-muted-foreground/25"
            />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Your slides will appear here
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Enter a topic above, pick your theme and settings, then click{" "}
              <strong>Generate Slides</strong>.
            </p>
          </motion.div>
        )}

        {/* ── Slide Editor ── */}
        <AnimatePresence>
          {slides.length > 0 && !loading && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              data-ocid="ppt.editor.section"
            >
              {/* Split layout: thumbnail panel + preview panel */}
              <div className="flex gap-4 min-h-[520px]">
                {/* ── Left: Thumbnail Panel ── */}
                <div
                  className="glassmorphism rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto"
                  style={{ width: "22%", minWidth: 140, maxHeight: 600 }}
                  data-ocid="ppt.thumbnails.panel"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
                    Slides ({slides.length})
                  </p>
                  {slides.map((slide, i) => (
                    <button
                      key={`thumb-${slide.title.slice(0, 12)}-${i}`}
                      type="button"
                      onClick={() => setCurrent(i)}
                      data-ocid={`ppt.thumb.item.${i + 1}`}
                      className={cn(
                        "group relative rounded-xl text-left transition-smooth overflow-hidden border",
                        i === current
                          ? "border-primary ring-1 ring-primary/50 scale-[1.02]"
                          : "border-white/10 opacity-60 hover:opacity-90 hover:border-white/30",
                      )}
                    >
                      {/* Mini slide */}
                      <div
                        className={cn(
                          "w-full aspect-video bg-gradient-to-br flex flex-col justify-end p-2",
                          activeTheme.bg,
                        )}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              TYPE_DOT[slide.type],
                            )}
                          />
                          <span className="text-[8px] font-medium text-white/60 uppercase tracking-wide">
                            {TYPE_LABEL[slide.type]}
                          </span>
                        </div>
                        <p className="text-white text-[9px] font-semibold leading-tight line-clamp-2">
                          {slide.title}
                        </p>
                      </div>
                      {/* Number badge */}
                      <div className="absolute top-1.5 right-1.5 bg-black/40 rounded-full w-4 h-4 flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">
                          {i + 1}
                        </span>
                      </div>
                      {/* Drag hint */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-0.5 opacity-0 group-hover:opacity-40 transition-smooth">
                        <GripVertical size={10} className="text-white" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* ── Right: Preview Panel ── */}
                <div className="flex-1 flex flex-col gap-3">
                  {/* 16:9 Slide Canvas */}
                  <div
                    className="relative w-full"
                    style={{
                      paddingBottom: "calc(56.25% * (78/100))",
                      height: 0,
                    }}
                  >
                    <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl shadow-black/30 border border-white/10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={current}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "w-full h-full bg-gradient-to-br flex flex-col p-8 relative",
                            activeTheme.bg,
                          )}
                        >
                          {/* Decorative accent orbs */}
                          {!isMinimal && (
                            <>
                              <div
                                className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
                                style={{ background: activeTheme.accent }}
                              />
                              <div
                                className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-10"
                                style={{ background: activeTheme.accent }}
                              />
                            </>
                          )}

                          {/* Slide type badge */}
                          <div className="relative z-10 flex items-center justify-between mb-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] uppercase tracking-widest border px-2.5 py-0.5",
                                activeTheme.badgeBg,
                              )}
                            >
                              {TYPE_LABEL[activeSlide?.type ?? "concept"]}
                            </Badge>
                            <span
                              className={cn(
                                "text-[11px] font-medium opacity-50",
                                isMinimal ? "text-gray-500" : "text-white",
                              )}
                            >
                              {current + 1} / {slides.length}
                            </span>
                          </div>

                          {/* Title */}
                          <div className="relative z-10 mb-4">
                            {editingTitle ? (
                              <div className="flex items-center gap-2">
                                <input
                                  ref={titleInputRef}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={commitTitleEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") commitTitleEdit();
                                    if (e.key === "Escape")
                                      setEditingTitle(false);
                                  }}
                                  data-ocid="ppt.title.input"
                                  className="flex-1 bg-white/10 border border-white/30 rounded-lg px-3 py-1 text-2xl font-bold text-white outline-none focus:border-primary"
                                />
                                <button
                                  type="button"
                                  onClick={commitTitleEdit}
                                  className="text-white/60 hover:text-white"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingTitle(false)}
                                  className="text-white/60 hover:text-white"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditValue(activeSlide?.title ?? "");
                                  setEditingTitle(true);
                                }}
                                data-ocid="ppt.slide.title.edit_button"
                                className={cn(
                                  "group flex items-start gap-2 text-left w-full",
                                  activeTheme.titleColor,
                                )}
                              >
                                <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight flex-1">
                                  {activeSlide?.title}
                                </h2>
                                <Pencil
                                  size={14}
                                  className="opacity-0 group-hover:opacity-60 mt-1.5 shrink-0 transition-smooth"
                                />
                              </button>
                            )}
                            {activeSlide?.subtitle && (
                              <p
                                className={cn(
                                  "mt-1 text-base opacity-70 font-medium",
                                  activeTheme.titleColor,
                                )}
                              >
                                {activeSlide.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Bullets */}
                          <ul className="relative z-10 flex-1 space-y-2.5 overflow-hidden">
                            {activeSlide?.bullets.map((b, bi) => (
                              <motion.li
                                key={`${current}-bullet-${b.slice(0, 20)}-${bi}`}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: bi * 0.06 }}
                                className="flex items-start gap-2.5"
                              >
                                <span
                                  className={cn(
                                    "mt-0.5 shrink-0 font-bold opacity-70",
                                    isMinimal ? "text-gray-400" : "text-white",
                                  )}
                                >
                                  ›
                                </span>
                                {editingBulletIdx === bi ? (
                                  <div className="flex-1 flex items-center gap-2">
                                    <Textarea
                                      ref={bulletInputRef}
                                      value={editValue}
                                      onChange={(e) =>
                                        setEditValue(e.target.value)
                                      }
                                      onBlur={() => commitBulletEdit(bi)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          commitBulletEdit(bi);
                                        }
                                        if (e.key === "Escape")
                                          setEditingBulletIdx(null);
                                      }}
                                      data-ocid={`ppt.bullet.input.${bi + 1}`}
                                      rows={2}
                                      className="flex-1 bg-white/10 border border-white/30 rounded-lg px-2.5 py-1 text-sm text-white outline-none focus:border-primary resize-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => commitBulletEdit(bi)}
                                      className="text-white/60 hover:text-white"
                                    >
                                      <Check size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditValue(b);
                                      setEditingBulletIdx(bi);
                                    }}
                                    data-ocid={`ppt.bullet.edit_button.${bi + 1}`}
                                    className={cn(
                                      "group flex-1 text-left text-sm leading-relaxed flex items-center gap-1.5",
                                      activeTheme.bulletColor,
                                    )}
                                  >
                                    <span className="flex-1">{b}</span>
                                    <Pencil
                                      size={10}
                                      className="opacity-0 group-hover:opacity-50 shrink-0 transition-smooth"
                                    />
                                  </button>
                                )}
                              </motion.li>
                            ))}
                          </ul>

                          {/* Decorative bottom bar */}
                          {!isMinimal && (
                            <div
                              className={cn(
                                "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
                                activeTheme.gradient,
                              )}
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Navigation arrows */}
                  <div className="flex items-center justify-between px-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                      disabled={current === 0}
                      data-ocid="ppt.prev.button"
                      className="border-white/20 bg-white/5 hover:bg-white/10 gap-1"
                    >
                      <ChevronLeft size={14} /> Prev
                    </Button>

                    {/* Dot indicators */}
                    <div className="flex gap-1.5 overflow-x-auto max-w-xs py-1">
                      {slides.map((slide, i) => (
                        <button
                          key={`dot-${slide.title.slice(0, 8)}-${i}`}
                          type="button"
                          onClick={() => setCurrent(i)}
                          data-ocid={`ppt.slide.item.${i + 1}`}
                          aria-label={`Go to slide ${i + 1}`}
                          className={cn(
                            "h-1.5 rounded-full transition-smooth shrink-0",
                            i === current
                              ? "w-5 bg-primary"
                              : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60",
                          )}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrent((c) => Math.min(slides.length - 1, c + 1))
                      }
                      disabled={current === slides.length - 1}
                      data-ocid="ppt.next.button"
                      className="border-white/20 bg-white/5 hover:bg-white/10 gap-1"
                    >
                      Next <ChevronRight size={14} />
                    </Button>
                  </div>

                  {/* Presenter Notes */}
                  {activeSlide?.notes && (
                    <div
                      className="glassmorphism rounded-xl p-3"
                      data-ocid="ppt.notes.panel"
                    >
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        📝 Presenter Notes
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activeSlide.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Bottom Toolbar ── */}
              <div
                className="glassmorphism rounded-2xl px-4 py-3 flex flex-wrap items-center gap-2"
                data-ocid="ppt.toolbar"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                  <Presentation size={13} />
                  <span className="font-semibold">{slides.length} slides</span>
                  <span>·</span>
                  <span>{activeTheme.label} theme</span>
                  <span>·</span>
                  <span>{audience}</span>
                </div>

                <div className="flex-1" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSlide}
                  data-ocid="ppt.add_slide.button"
                  className="border-white/20 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-400 gap-1.5 text-xs"
                >
                  <Plus size={13} /> Add Slide
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSlide}
                  data-ocid="ppt.delete_slide.button"
                  className="border-white/20 bg-white/5 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 gap-1.5 text-xs"
                  disabled={slides.length <= 1}
                >
                  <Trash2 size={13} /> Delete
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOutline}
                  data-ocid="ppt.copy.button"
                  className="border-white/20 bg-white/5 hover:bg-accent/10 hover:border-accent/40 gap-1.5 text-xs"
                >
                  <ClipboardCopy size={13} /> Copy Outline
                </Button>

                <Button
                  size="sm"
                  onClick={downloadOutline}
                  data-ocid="ppt.download.button"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 gap-1.5 text-xs shadow-glow-purple"
                >
                  <Download size={13} /> Download PPTX
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
