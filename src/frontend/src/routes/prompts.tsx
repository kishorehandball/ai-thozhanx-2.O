import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type PromptType = "image" | "video" | "ppt" | "pdf" | "abstract" | "document";
type Role = "Student" | "Researcher" | "Professional" | "Creative";
type Tone = "Formal" | "Casual" | "Technical" | "Creative";
type Detail = "Basic" | "Intermediate" | "Expert";

const ROUTE_MAP: Record<PromptType, string> = {
  image: "/image",
  video: "/video",
  ppt: "/ppt",
  pdf: "/pdf",
  abstract: "/abstract",
  document: "/document",
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

interface TabConfig {
  type: PromptType;
  emoji: string;
  label: string;
  placeholder: string;
  tones: Tone[];
  gradient: string;
}

const TABS: TabConfig[] = [
  {
    type: "image",
    emoji: "🎨",
    label: "Image",
    placeholder: "E.g. Smart city infrastructure with IoT sensors...",
    tones: ["Creative", "Technical", "Formal", "Casual"],
    gradient: "from-pink-500 to-purple-600",
  },
  {
    type: "video",
    emoji: "🎬",
    label: "Video",
    placeholder: "E.g. Explainer video on machine learning basics...",
    tones: ["Casual", "Creative", "Formal", "Technical"],
    gradient: "from-red-500 to-orange-500",
  },
  {
    type: "ppt",
    emoji: "📊",
    label: "PPT",
    placeholder: "E.g. Renewable energy for sustainable development...",
    tones: ["Formal", "Technical", "Creative", "Casual"],
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    type: "pdf",
    emoji: "📘",
    label: "PDF",
    placeholder: "E.g. Research report on neural networks...",
    tones: ["Formal", "Technical", "Casual", "Creative"],
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    type: "abstract",
    emoji: "🏆",
    label: "Abstract",
    placeholder: "E.g. Automated disease detection using deep learning...",
    tones: ["Formal", "Technical", "Casual", "Creative"],
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    type: "document",
    emoji: "📄",
    label: "Document",
    placeholder: "E.g. Assignment on cloud computing architecture...",
    tones: ["Formal", "Casual", "Technical", "Creative"],
    gradient: "from-violet-500 to-purple-600",
  },
];

const ROLES: Role[] = ["Student", "Researcher", "Professional", "Creative"];
const DETAIL_LEVELS: Detail[] = ["Basic", "Intermediate", "Expert"];

const PARTICLES = [
  { x: "8%", y: "15%", size: 3, delay: 0, color: "#3B82F6" },
  { x: "88%", y: "10%", size: 4, delay: 0.5, color: "#8B5CF6" },
  { x: "72%", y: "65%", size: 2, delay: 1, color: "#06B6D4" },
  { x: "18%", y: "78%", size: 3, delay: 1.5, color: "#8B5CF6" },
  { x: "50%", y: "8%", size: 2, delay: 0.8, color: "#3B82F6" },
  { x: "92%", y: "48%", size: 3, delay: 0.3, color: "#06B6D4" },
];

// ─── Mock Prompt Generator ─────────────────────────────────────────────────────

function mockGeneratePrompt(
  type: PromptType,
  topic: string,
  role: Role,
  tone: Tone,
  detail: Detail,
): string {
  const detailMap: Record<Detail, string> = {
    Basic: "introductory overview with clear, simple explanations",
    Intermediate: "balanced depth with technical context and examples",
    Expert:
      "advanced analysis with precise technical detail, citations, and specialized terminology",
  };
  const detailText = detailMap[detail];

  switch (type) {
    case "image":
      return `Create a highly detailed, photorealistic digital illustration for a ${tone.toLowerCase()} ${role.toLowerCase()} audience on the subject of: "${topic}".

Visual style: ${tone === "Creative" ? "vibrant, artistic, painterly with dynamic lighting" : "clean, professional, minimalist with sharp edges"}.
Composition: centered focal point, rule of thirds layout, ${tone === "Technical" ? "annotated diagram style with labels and callouts" : "cinematic wide-angle framing"}.

Include the following visual elements:
- Primary subject rendered with ${detail === "Expert" ? "micro-level detail, high dynamic range" : detail === "Intermediate" ? "clear forms, medium depth" : "bold simple shapes, flat design"} rendering
- Background: ${tone === "Formal" ? "neutral gradient, soft bokeh" : "dynamic environment with contextual elements"}
- Color palette: deep blues (#1e3a8a), neon purples (#7c3aed), and cyan highlights (#22d3ee) — conveying innovation and intelligence
- Lighting: soft rim lighting from upper-left, subtle glow on primary subject
- Mood: ${tone === "Creative" ? "inspiring and energetic" : tone === "Casual" ? "approachable and friendly" : "authoritative and trustworthy"}

Technical specs: 16:9 ratio, 4K resolution, PNG format. Suitable for academic presentations, research posters, and infographics. No watermarks, no text overlays.`;

    case "video":
      return `Generate a complete video script and storyboard for a ${tone.toLowerCase()} ${detail.toLowerCase()}-level explainer video on: "${topic}".

Target audience: ${role}s with ${detailText}.
Duration: ${detail === "Basic" ? "2–3 minutes" : detail === "Intermediate" ? "4–6 minutes" : "8–12 minutes"}.

Scene structure:
Scene 1 (0:00–0:20) — Hook: Open with a compelling question or bold statement about ${topic}. Visual: animated title card with gradient background (#0f172a to #7c3aed).
Scene 2 (0:20–0:50) — Problem Statement: Explain the challenge or context. Visual: split-screen comparison or problem visualization.
Scene 3 (0:50–2:00) — Core Explanation: Break down the main concept into ${detail === "Basic" ? "3 key points" : detail === "Intermediate" ? "5 key points" : "7 detailed segments"} with supporting visuals.
Scene 4 — Real-World Application: Demonstrate with a concrete use case relevant to ${role.toLowerCase()}s.
Scene 5 — Summary & CTA: Recap key takeaways. Tone: ${tone}.

Voiceover style: ${tone === "Formal" ? "professional presenter, measured pace" : tone === "Casual" ? "conversational, friendly narrator" : "authoritative expert"}.
Background music: ${tone === "Creative" ? "upbeat electronic ambient" : "subtle cinematic underscore"}.
Export format: MP4, 1080p HD, 30fps.`;

    case "ppt":
      return `Design a professional PowerPoint presentation for a ${role.toLowerCase()} audience on: "${topic}".

Presentation specs:
- Slide count: ${detail === "Basic" ? "8–10 slides" : detail === "Intermediate" ? "12–16 slides" : "20–25 slides"}
- Theme: Modern dark theme with deep navy (#0f172a) backgrounds, neon purple (#7c3aed) accent headers, and cyan (#22d3ee) highlights
- Font pairing: Display/headers in Inter Bold, body text in Inter Regular
- Tone: ${tone}

Slide outline:
1. Title slide — Large gradient title, subtitle, presenter name & date
2. Executive Summary — 3-bullet overview, key metric highlight box
3. Agenda / Table of Contents — Animated numbered list
4–${detail === "Basic" ? "7" : detail === "Intermediate" ? "12" : "18"}. Content slides — Each with: section header, key visual (diagram/chart/image), 4–5 bullet points max, speaker notes (${detailText})
${detail !== "Basic" ? `${detail === "Expert" ? "19–22" : "13–15"}. Data & Analysis — Charts, graphs, comparison tables` : ""}
${detail === "Expert" ? "23–24. Methodology & References — Academic citations, research framework" : ""}
${detail === "Basic" ? "8" : detail === "Intermediate" ? "16" : "25"}. Conclusion & Q&A — Summary, contact info, call-to-action

Visual elements per slide: ${detail === "Expert" ? "data visualizations, process diagrams, annotated screenshots" : "icons, progress bars, highlighted quote boxes"}.
Export: PPTX format compatible with Microsoft PowerPoint and Google Slides.`;

    case "pdf":
      return `Generate a structured, professionally formatted PDF document for a ${role.toLowerCase()} on: "${topic}".

Document structure (${detailText}):
- Cover Page: Title, author (${role}), institution/organization, date, abstract thumbnail
- Table of Contents: Auto-generated, clickable links
- Executive Summary / Abstract: 150–200 word overview
- Introduction (${detail === "Basic" ? "1 page" : detail === "Intermediate" ? "2 pages" : "3 pages"}): Background, context, objectives, scope
- Main Body (${detail === "Basic" ? "3–4 sections" : detail === "Intermediate" ? "5–6 sections" : "8–10 sections"}): ${detail === "Expert" ? "Literature review, methodology, results, discussion, analysis, implications" : "Key concepts, explanations, examples, supporting evidence"}
- ${detail !== "Basic" ? "Data & Visuals: Charts, tables, figures with captions" : "Key Highlights: Callout boxes, bullet summaries"}
- ${detail === "Expert" ? "Appendices: Raw data, supplementary materials, code snippets" : ""}
- Conclusion: Summary of key findings, recommendations, future scope
- References: ${detail === "Expert" ? "APA-style citations, 15+ sources" : detail === "Intermediate" ? "5–10 references" : "3–5 key sources"}

Formatting: A4 size, 12pt body font, 1-inch margins, justified text, page numbers, headers/footers with document title. Tone: ${tone}. Export: PDF/A format.`;

    case "abstract":
      return `Write a complete, publication-ready research abstract for the paper: "${topic}".

Author context: ${role} — ${detailText}.
Tone: ${tone}. Target: peer-reviewed journal or academic conference submission.

Abstract structure (250–300 words total):

Background (40–50 words): Establish the research problem and its significance in the context of ${topic}. Reference the existing gap or limitation in prior work that this research addresses.

Objective (30–40 words): State the specific aim of this study — what was investigated, designed, or developed. Use active voice and precise verbs (e.g., "This paper proposes / investigates / develops").

Methodology (60–70 words): Describe the research approach, tools, dataset, or experimental setup used. Include ${detail === "Expert" ? "statistical methods, model architecture, dataset size, evaluation metrics" : detail === "Intermediate" ? "key techniques and validation approach" : "the general method in accessible terms"}.

Results (60–70 words): Present the primary quantitative or qualitative outcomes. Include ${detail === "Expert" ? "specific accuracy rates, performance benchmarks, p-values, or improvement percentages" : "key findings with supporting evidence"}.

Conclusion & Implications (40–50 words): Summarize the contribution to the field. State practical applications, limitations, and potential directions for future research.

Keywords: Provide 5–7 domain-specific keywords relevant to ${topic} for indexing.

Format: Single paragraph (no headers), IEEE/ACM citation style ready. No first-person pronouns ("I", "We"). Passive or third-person voice throughout.`;

    case "document":
      return `Create a comprehensive, well-structured academic or professional document for a ${role.toLowerCase()} on: "${topic}".

Document type: ${tone === "Formal" || tone === "Technical" ? "Academic research report / technical documentation" : "Professional report / informational document"}
Depth: ${detailText}
Length: ${detail === "Basic" ? "1,500–2,000 words" : detail === "Intermediate" ? "3,000–4,500 words" : "6,000–8,000 words"}

Content outline:
1. Title & Author Information
2. Executive Summary (150 words)
3. Introduction — Background, problem statement, objectives, ${detail === "Expert" ? "research questions, hypothesis" : "scope and significance"}
4. ${detail !== "Basic" ? "Literature Review — Prior work, theoretical framework, research gap" : "Background Context — Key concepts and definitions"}
5. Core Content Sections (${detail === "Basic" ? "3" : detail === "Intermediate" ? "5" : "7"} sections):
   Each section: heading, ${detail === "Expert" ? "technical analysis, equations/code if relevant, critical discussion" : "clear explanation, examples, supporting details"}
6. ${detail === "Expert" ? "Experimental Results / Case Study — Data, charts, comparative analysis" : "Examples & Applications — Real-world use cases"}
7. Discussion — Implications, strengths, limitations
8. Conclusion — Key takeaways, recommendations, future work
9. References (${detail === "Expert" ? "APA format, 15+ sources" : "5–8 sources"})
${detail === "Expert" ? "10. Appendix — Supplementary data, code, raw results" : ""}

Writing style: ${tone}. Use active/passive voice appropriately, clear transitions between sections, topic sentences for each paragraph. Export: DOCX format.`;

    default:
      return "";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PromptGeneratorPage() {
  const [activeTab, setActiveTab] = useState<PromptType>("image");
  const [topic, setTopic] = useState("");
  const [role, setRole] = useState<Role>("Student");
  const [tone, setTone] = useState<Tone>("Formal");
  const [detail, setDetail] = useState<Detail>("Intermediate");
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentTab = TABS.find((t) => t.type === activeTab)!;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or subject first.");
      return;
    }
    setIsGenerating(true);
    setGeneratedPrompt(null);
    await new Promise((r) => setTimeout(r, 800));
    const result = mockGeneratePrompt(
      activeTab,
      topic.trim(),
      role,
      tone,
      detail,
    );
    setGeneratedPrompt(result);
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsePrompt = () => {
    if (!generatedPrompt) return;
    localStorage.setItem(
      `thozhanx-pending-prompt-${activeTab}`,
      generatedPrompt,
    );
    toast.success(`Opening ${currentTab.label} Generator…`);
    setTimeout(() => {
      window.location.href = ROUTE_MAP[activeTab];
    }, 500);
  };

  return (
    <div className="min-h-full">
      {/* Floating particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-40 left-1/4 h-96 w-96 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, #3B82F6, transparent)",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, #8B5CF6, transparent)",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, #06B6D4, transparent)",
            animationDelay: "2s",
          }}
        />
        {PARTICLES.map((p) => (
          <motion.div
            key={`p-${p.x}-${p.y}`}
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

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
          data-ocid="prompts.header.section"
        >
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/5 text-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            ✨ AI Prompt Studio
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            <span className="gradient-text">Prompt Generator</span>
            <span className="ml-2">✨</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto">
            Generate perfect prompts for any AI tool — tailored to your role,
            style, and depth.
          </p>
        </motion.div>

        {/* Tab Selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-8"
          data-ocid="prompts.tabs.section"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {TABS.map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => {
                  setActiveTab(tab.type);
                  setGeneratedPrompt(null);
                  setTone(tab.tones[0]);
                }}
                data-ocid={`prompts.tab.${tab.type}`}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-smooth border",
                  activeTab === tab.type
                    ? `bg-gradient-to-r ${tab.gradient} text-white border-transparent shadow-glow`
                    : "glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20",
                )}
              >
                <span className="text-base">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-2xl p-6 mb-6"
          data-ocid="prompts.form.section"
        >
          {/* Active tab label */}
          <div className="mb-6 flex items-center gap-2">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-lg shadow-md",
                currentTab.gradient,
              )}
            >
              {currentTab.emoji}
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                {currentTab.label} Prompt
              </h2>
              <p className="text-xs text-muted-foreground">
                Customize your prompt parameters below
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Topic Input */}
            <div>
              <label
                htmlFor="prompt-topic"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Topic / Subject <span className="text-red-400">*</span>
              </label>
              <input
                id="prompt-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={currentTab.placeholder}
                data-ocid="prompts.topic.input"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
              />
            </div>

            {/* Role + Tone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-foreground">
                  Role
                </legend>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      aria-pressed={role === r}
                      data-ocid={`prompts.role.${r.toLowerCase()}`}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-smooth border",
                        role === r
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-foreground">
                  Tone / Style
                </legend>
                <div className="flex flex-wrap gap-2">
                  {currentTab.tones.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      aria-pressed={tone === t}
                      data-ocid={`prompts.tone.${t.toLowerCase()}`}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-smooth border",
                        tone === t
                          ? "bg-accent/20 border-accent/40 text-accent"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Detail Level */}
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-foreground">
                Detail Level
              </legend>
              <div className="flex gap-2">
                {DETAIL_LEVELS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDetail(d)}
                    aria-pressed={detail === d}
                    data-ocid={`prompts.detail.${d.toLowerCase()}`}
                    className={cn(
                      "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-smooth border text-center",
                      detail === d
                        ? `bg-gradient-to-r ${currentTab.gradient} text-white border-transparent shadow-md`
                        : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground",
                    )}
                  >
                    {d === "Basic"
                      ? "🌱 Basic"
                      : d === "Intermediate"
                        ? "⚡ Intermediate"
                        : "🔬 Expert"}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              data-ocid="prompts.generate.primary_button"
              className="w-full h-12 rounded-xl border-0 text-white font-bold text-sm shadow-glow transition-smooth disabled:opacity-60"
              style={{
                background: isGenerating
                  ? "#374151"
                  : "linear-gradient(135deg, #3B82F6, #8B5CF6, #22d3ee)",
              }}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Crafting your prompt…
                </span>
              ) : (
                "Generate Prompt ✨"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Output Card */}
        <AnimatePresence mode="wait">
          {generatedPrompt && (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="glass rounded-2xl p-6"
              data-ocid="prompts.output.section"
            >
              {/* Output header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-sm",
                      currentTab.gradient,
                    )}
                  >
                    {currentTab.emoji}
                  </div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Your Generated Prompt
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400 text-[11px] px-2 py-0.5"
                  >
                    ✓ Ready to use
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-muted-foreground text-[11px] hidden sm:flex"
                >
                  {detail} · {role} · {tone}
                </Badge>
              </div>

              {/* Prompt text box */}
              <div
                className="mb-5 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-white/10"
                data-ocid="prompts.output.editor"
              >
                {generatedPrompt}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 rounded-xl border-white/20 bg-white/5 font-semibold hover:bg-white/10 transition-smooth"
                  data-ocid="prompts.copy.secondary_button"
                >
                  {copied ? "✓ Copied!" : "📋 Copy Prompt"}
                </Button>
                <Button
                  onClick={handleUsePrompt}
                  className="flex-1 rounded-xl border-0 text-white font-semibold shadow-glow transition-smooth"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  }}
                  data-ocid="prompts.use.primary_button"
                >
                  Use This Prompt ➜
                </Button>
              </div>

              <p className="mt-3 text-center text-[11px] text-muted-foreground/50">
                Prompt saved automatically when you click "Use This Prompt"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-2xl p-8 text-center"
              data-ocid="prompts.generate.loading_state"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <span className="text-2xl animate-bounce">🤔</span>
              </div>
              <p className="font-display text-sm font-semibold text-foreground">
                Crafting your perfect prompt…
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tailoring for {role} · {tone} · {detail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
