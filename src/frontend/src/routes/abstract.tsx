import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { generateAbstract } from "@/lib/mockAI";
import { copyToClipboard, downloadText } from "@/lib/utils";
import { PAGE_HINTS, useAppStore } from "@/stores/appStore";
import type { AbstractDocument } from "@/types";
import {
  Award,
  BookOpen,
  BookText,
  Brain,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Copy,
  Download,
  FileCode2,
  FileText,
  FlaskConical,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Tag,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

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
const ACADEMIC_LEVELS = ["Undergraduate", "Postgraduate", "PhD"];
const SAMPLE_TOPICS = [
  "Face Recognition Attendance System",
  "Smart Grid Energy Management",
  "NLP-based Sentiment Analysis",
];
const ALL_SECTIONS = [
  "abstract",
  "introduction",
  "literatureReview",
  "methodology",
  "conclusion",
] as const;
type SectionKey = (typeof ALL_SECTIONS)[number];

interface SectionMeta {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgClass: string;
  dotClass: string;
  borderClass: string;
  wordTarget: string;
}

const SECTION_META: SectionMeta[] = [
  {
    key: "abstract",
    label: "Abstract",
    icon: <FileText size={15} />,
    color: "text-blue-400",
    bgClass: "from-blue-500/20 to-blue-600/5",
    dotClass: "bg-blue-400",
    borderClass: "border-blue-400/30",
    wordTarget: "150–250 words",
  },
  {
    key: "introduction",
    label: "Introduction",
    icon: <Lightbulb size={15} />,
    color: "text-purple-400",
    bgClass: "from-purple-500/20 to-purple-600/5",
    dotClass: "bg-purple-400",
    borderClass: "border-purple-400/30",
    wordTarget: "200–350 words",
  },
  {
    key: "literatureReview",
    label: "Literature Review",
    icon: <BookOpen size={15} />,
    color: "text-cyan-400",
    bgClass: "from-cyan-500/20 to-cyan-600/5",
    dotClass: "bg-cyan-400",
    borderClass: "border-cyan-400/30",
    wordTarget: "300–500 words",
  },
  {
    key: "methodology",
    label: "Methodology",
    icon: <FlaskConical size={15} />,
    color: "text-emerald-400",
    bgClass: "from-emerald-500/20 to-emerald-600/5",
    dotClass: "bg-emerald-400",
    borderClass: "border-emerald-400/30",
    wordTarget: "250–400 words",
  },
  {
    key: "conclusion",
    label: "Conclusion",
    icon: <CheckCircle2 size={15} />,
    color: "text-rose-400",
    bgClass: "from-rose-500/20 to-rose-600/5",
    dotClass: "bg-rose-400",
    borderClass: "border-rose-400/30",
    wordTarget: "150–250 words",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Quality Badge ─────────────────────────────────────────────────────────────

interface QualityBadgeProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function QualityBadge({ label, value, icon, color }: QualityBadgeProps) {
  return (
    <div className="glassmorphism rounded-xl p-3 flex items-center gap-2.5">
      <div className={`${color} flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium leading-tight">
          {label}
        </p>
        <p className="text-xs font-semibold text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  meta: SectionMeta;
  content: string;
  onCopy: () => void;
  onRegenerate: () => void;
  index: number;
  keywords: string[];
}

function SectionCard({
  meta,
  content,
  onCopy,
  onRegenerate,
  index,
  keywords,
}: SectionCardProps) {
  const words = countWords(content);
  const usedKeywords = keywords.filter((kw) =>
    content.toLowerCase().includes(kw.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`glassmorphism rounded-2xl border ${meta.borderClass} overflow-hidden`}
      data-ocid={`abstract.${meta.key}.card`}
    >
      {/* Card Header */}
      <div
        className={`bg-gradient-to-r ${meta.bgClass} px-5 py-3 flex items-center justify-between gap-2`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`${meta.color} flex-shrink-0`}>{meta.icon}</span>
          <h3
            className={`font-display text-sm font-semibold ${meta.color} truncate`}
          >
            {meta.label}
          </h3>
          <span className="text-[10px] text-muted-foreground/60 hidden sm:inline flex-shrink-0">
            ({meta.wordTarget})
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge
            variant="outline"
            className={`text-[10px] border-current ${meta.color} bg-transparent px-1.5 py-0`}
          >
            {words}w
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-[11px] ${meta.color} hover:bg-white/10`}
            onClick={onCopy}
            data-ocid={`abstract.${meta.key}.copy_button`}
          >
            <Copy size={10} className="mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] text-muted-foreground hover:bg-white/10"
            onClick={onRegenerate}
            data-ocid={`abstract.${meta.key}.regenerate_button`}
          >
            <RefreshCw size={10} className="mr-1" />
            Regen
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {/* Keywords tracked */}
      {usedKeywords.length > 0 && (
        <div className="px-5 pb-3.5 flex items-center gap-1.5 flex-wrap border-t border-white/5 pt-3">
          <Tag size={10} className="text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/50 mr-0.5">
            Keywords used:
          </span>
          {usedKeywords.map((kw) => (
            <span
              key={kw}
              className={`text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 ${meta.color} font-medium`}
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AbstractPage() {
  const { setRobotState, setCurrentPageHint } = useAppStore();

  const [topic, setTopic] = useState("");
  const [dept, setDept] = useState("CSE");
  const [keywords, setKeywords] = useState("");
  const [academicLevel, setAcademicLevel] = useState("Undergraduate");
  const [enabledSections, setEnabledSections] = useState<
    Record<SectionKey, boolean>
  >({
    abstract: true,
    introduction: true,
    literatureReview: true,
    methodology: true,
    conclusion: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AbstractDocument | null>(null);
  const [overrides, setOverrides] = useState<
    Partial<Record<SectionKey, string>>
  >({});

  const getContent = (key: SectionKey): string =>
    overrides[key] ?? (result ? String(result[key]) : "");

  const enabledKeys = ALL_SECTIONS.filter((k) => enabledSections[k]);

  const fullText = result
    ? enabledKeys
        .map((k) => {
          const meta = SECTION_META.find((m) => m.key === k)!;
          return `${meta.label.toUpperCase()}\n\n${getContent(k)}`;
        })
        .join("\n\n─────────────────────────────────────\n\n")
    : "";

  const ieeeText = result
    ? `${result.title}\nDepartment of ${result.department} — ${academicLevel}\n\nKeywords: ${result.keywords.join(", ")}\n\n${fullText}`
    : "";

  const htmlExport = result
    ? `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${result.title}</title>
<style>
  body{font-family:'Times New Roman',serif;max-width:800px;margin:2rem auto;padding:2rem;color:#111;line-height:1.8}
  h1{font-size:1.4rem;text-align:center;margin-bottom:.5rem}
  .dept{text-align:center;color:#555;font-style:italic;margin-bottom:2rem}
  .kw{font-size:.85rem;margin-bottom:2rem}
  h2{font-size:1rem;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:.2rem;margin-top:2rem}
  p{margin-bottom:1rem;text-align:justify}
  footer{margin-top:3rem;font-size:.75rem;text-align:center;color:#999}
</style>
</head>
<body>
<h1>${result.title}</h1>
<div class="dept">Department of ${result.department} — ${academicLevel}</div>
<div class="kw"><strong>Keywords:</strong> ${result.keywords.join(", ")}</div>
${enabledKeys
  .map((k) => {
    const meta = SECTION_META.find((m) => m.key === k)!;
    return `<h2>${meta.label}</h2><p>${getContent(k).replace(/\n/g, "</p><p>")}</p>`;
  })
  .join("\n")}
<footer>Generated by AI THOZHANX 2.O — © 2026 AI THOZHANX. For Educational Use.</footer>
</body>
</html>`
    : "";

  const totalWords = result
    ? enabledKeys.reduce((acc, k) => acc + countWords(getContent(k)), 0)
    : 0;

  // Set page hint on mount + pre-fill from localStorage
  useEffect(() => {
    setCurrentPageHint(PAGE_HINTS["/abstract"]);
    setRobotState("idle");
    const pending = localStorage.getItem("thozhanx-pending-prompt-abstract");
    if (pending) {
      setTopic(pending);
      localStorage.removeItem("thozhanx-pending-prompt-abstract");
    }
  }, [setCurrentPageHint, setRobotState]);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a research topic");
      return;
    }
    setLoading(true);
    setOverrides({});
    setRobotState("thinking");
    await new Promise((r) => setTimeout(r, 2200));
    const customKws = keywords.trim()
      ? keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : [];
    const doc = generateAbstract(topic, dept);
    setResult(
      customKws.length > 0
        ? { ...doc, keywords: [...customKws, ...doc.keywords.slice(0, 3)] }
        : doc,
    );
    setLoading(false);

    setRobotState("celebration");
    setTimeout(() => setRobotState("idle"), 2000);

    toast.success("Abstract generated!", {
      description: `${academicLevel} level — ${dept} department`,
    });
  };

  const regenerateSection = async (key: SectionKey) => {
    if (!result) return;
    const label = SECTION_META.find((m) => m.key === key)?.label ?? key;
    toast.info(`Regenerating ${label}…`);
    await new Promise((r) => setTimeout(r, 900));
    const fresh = generateAbstract(`${topic} (alt)`, dept);
    setOverrides((prev) => ({ ...prev, [key]: String(fresh[key]) }));
    toast.success("Section regenerated!");
  };

  const copySection = async (key: SectionKey) => {
    const label = SECTION_META.find((m) => m.key === key)?.label ?? key;
    await copyToClipboard(`${label.toUpperCase()}\n\n${getContent(key)}`);
    toast.success(`Copied ${label}!`);
  };

  return (
    <div className="min-h-full p-4 md:p-6" data-ocid="abstract.page">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-500 shadow-glow flex-shrink-0">
            <Award size={21} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold gradient-text">
              Abstract Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              🏆 Claude AI Style — Research abstracts, introductions, literature
              reviews
            </p>
          </div>
        </motion.div>

        {/* ── Two-column Layout ── */}
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ── Input Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="glassmorphism rounded-2xl p-5 space-y-4">
              <h2 className="font-display text-sm font-semibold flex items-center gap-2">
                <Sparkles size={13} className="text-purple-400" />
                Research Details
              </h2>

              {/* Topic */}
              <div className="space-y-1.5">
                <Label htmlFor="abs-topic" className="text-xs font-medium">
                  Research Topic / Project Title
                </Label>
                <Input
                  id="abs-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Face Recognition Attendance System"
                  className="bg-white/5 border-white/10 h-10 text-sm"
                  data-ocid="abstract.topic.input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") generate();
                  }}
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {SAMPLE_TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-primary/30 text-primary/80 bg-primary/5 hover:bg-primary/15 transition-smooth"
                      data-ocid={`abstract.sample.${t.split(" ")[0].toLowerCase()}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dept + Level */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Department</Label>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger
                      className="bg-white/5 border-white/10 h-10 text-sm"
                      data-ocid="abstract.dept.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Academic Level</Label>
                  <Select
                    value={academicLevel}
                    onValueChange={setAcademicLevel}
                  >
                    <SelectTrigger
                      className="bg-white/5 border-white/10 h-10 text-sm"
                      data-ocid="abstract.level.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-1.5">
                <Label htmlFor="abs-keywords" className="text-xs font-medium">
                  Keywords (comma-separated)
                </Label>
                <Input
                  id="abs-keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="deep learning, CNN, attendance, IoT"
                  className="bg-white/5 border-white/10 h-10 text-sm"
                  data-ocid="abstract.keywords.input"
                />
              </div>

              {/* Section Checkboxes */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Sections to Generate
                </Label>
                <div className="space-y-2">
                  {SECTION_META.map((meta) => (
                    <div key={meta.key} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`sec-${meta.key}`}
                        checked={enabledSections[meta.key]}
                        onCheckedChange={(v) =>
                          setEnabledSections((prev) => ({
                            ...prev,
                            [meta.key]: Boolean(v),
                          }))
                        }
                        className="border-white/20"
                        data-ocid={`abstract.section.${meta.key}.checkbox`}
                      />
                      <label
                        htmlFor={`sec-${meta.key}`}
                        className="flex items-center gap-2 text-xs cursor-pointer select-none"
                      >
                        <span className={meta.color}>{meta.icon}</span>
                        <span className="font-medium">{meta.label}</span>
                        <span className="text-muted-foreground/50">
                          {meta.wordTarget}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generate}
                disabled={loading || !topic.trim()}
                className="w-full h-11 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white border-0 font-semibold shadow-glow transition-smooth hover:opacity-90"
                data-ocid="abstract.generate.submit_button"
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 size={15} className="mr-2" />
                    Generate Abstract
                  </>
                )}
              </Button>
            </div>

            {/* Export Panel */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glassmorphism rounded-2xl p-4 space-y-3"
                  data-ocid="abstract.export.panel"
                >
                  <h3 className="font-display text-xs font-semibold flex items-center gap-2">
                    <Download size={12} className="text-cyan-400" />
                    Export Options
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-white/15 bg-white/5 hover:bg-white/10"
                      onClick={async () => {
                        await copyToClipboard(fullText);
                        toast.success("Copied all sections!");
                      }}
                      data-ocid="abstract.copy_all.button"
                    >
                      <Copy size={11} className="mr-1.5" />
                      Copy All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-white/15 bg-white/5 hover:bg-white/10"
                      onClick={() => {
                        downloadText(
                          fullText,
                          `${topic.slice(0, 25).replace(/\s+/g, "-")}-abstract.txt`,
                        );
                        toast.success("Downloaded TXT!");
                      }}
                      data-ocid="abstract.download_txt.button"
                    >
                      <FileText size={11} className="mr-1.5" />
                      Download TXT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-white/15 bg-white/5 hover:bg-white/10"
                      onClick={() => {
                        downloadText(
                          htmlExport,
                          `${topic.slice(0, 25).replace(/\s+/g, "-")}-abstract.html`,
                        );
                        toast.success("Downloaded HTML!");
                      }}
                      data-ocid="abstract.download_html.button"
                    >
                      <FileCode2 size={11} className="mr-1.5" />
                      HTML Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-white/15 bg-white/5 hover:bg-white/10"
                      onClick={async () => {
                        await copyToClipboard(ieeeText);
                        toast.success("Copied IEEE format!");
                      }}
                      data-ocid="abstract.copy_ieee.button"
                    >
                      <ClipboardList size={11} className="mr-1.5" />
                      IEEE Format
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Output Panel ── */}
          <div className="min-w-0">
            {/* Loading */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
                data-ocid="abstract.loading_state"
              >
                <div className="glassmorphism rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain
                      size={18}
                      className="text-purple-400 animate-pulse"
                    />
                    <p className="text-sm font-medium">
                      Writing your research abstract…
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {SECTION_META.filter((m) => enabledSections[m.key]).map(
                      (meta, i) => (
                        <div key={meta.key} className="flex items-center gap-3">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${meta.dotClass} animate-pulse`}
                            style={{ animationDelay: `${i * 0.25}s` }}
                          />
                          <div className="flex-1">
                            <Skeleton
                              className="h-2 rounded-full"
                              style={{ width: `${52 + i * 9}%` }}
                            />
                          </div>
                          <span
                            className={`text-[10px] ${meta.color} font-medium min-w-[90px] text-right`}
                          >
                            {meta.label}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <Skeleton className="h-44 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
              </motion.div>
            )}

            {/* Result */}
            {result && !loading && (
              <div className="space-y-4">
                {/* Title bar */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glassmorphism rounded-2xl p-4"
                  data-ocid="abstract.result.header"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <h2 className="font-display text-base font-bold text-foreground leading-tight">
                        {result.title}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {result.department} Department · {academicLevel}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-purple-400/40 text-purple-400 bg-purple-400/10 text-[11px] shrink-0"
                    >
                      {totalWords} words total
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {result.keywords.map((kw) => (
                      <Badge
                        key={kw}
                        variant="outline"
                        className="text-[10px] border-primary/25 bg-primary/5 text-primary px-2 py-0"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </motion.div>

                {/* Quality Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  data-ocid="abstract.quality.panel"
                >
                  <QualityBadge
                    label="Readability"
                    value="Good — Grade 12"
                    icon={<BookText size={14} />}
                    color="text-blue-400"
                  />
                  <QualityBadge
                    label="Academic Tone"
                    value="Formal Academic"
                    icon={<Award size={14} />}
                    color="text-purple-400"
                  />
                  <QualityBadge
                    label="Keywords"
                    value={`${result.keywords.length} tracked`}
                    icon={<Tag size={14} />}
                    color="text-cyan-400"
                  />
                  <QualityBadge
                    label="Sections"
                    value={`${enabledKeys.length} / ${ALL_SECTIONS.length}`}
                    icon={<ChevronRight size={14} />}
                    color="text-emerald-400"
                  />
                </motion.div>

                {/* Section Cards */}
                <div className="space-y-3" data-ocid="abstract.sections.list">
                  {SECTION_META.filter((m) => enabledSections[m.key]).map(
                    (meta, i) => (
                      <SectionCard
                        key={meta.key}
                        meta={meta}
                        content={getContent(meta.key)}
                        onCopy={() => copySection(meta.key)}
                        onRegenerate={() => regenerateSection(meta.key)}
                        index={i}
                        keywords={result.keywords}
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glassmorphism rounded-2xl p-12 text-center flex flex-col items-center gap-4"
                data-ocid="abstract.empty_state"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/20 flex items-center justify-center">
                    <Award size={28} className="text-muted-foreground/40" />
                  </div>
                  <Sparkles
                    size={14}
                    className="absolute -top-1 -right-1 text-purple-400/60 animate-pulse"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground/60 mb-1">
                    No abstract generated yet
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Enter your research topic and click "Generate Abstract" to
                    create a full academic paper structure with sections,
                    keywords, and quality indicators.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {SAMPLE_TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary/80 bg-primary/5 hover:bg-primary/15 transition-smooth flex items-center gap-1.5"
                      data-ocid={`abstract.empty.sample.${t.split(" ")[0].toLowerCase()}`}
                    >
                      <Wand2 size={10} />
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
