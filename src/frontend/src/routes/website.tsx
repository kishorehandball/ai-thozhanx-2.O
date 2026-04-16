import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generateWebsiteCode } from "@/lib/mockAI";
import { copyToClipboard, downloadText } from "@/lib/utils";
import type { WebsiteCode } from "@/types";
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Monitor,
  Pencil,
  RefreshCw,
  RotateCcw,
  Share2,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ── Constants ────────────────────────────────────────────────────────────────

const WEBSITE_TYPES = [
  "Portfolio",
  "Landing Page",
  "Dashboard",
  "Blog",
  "E-commerce",
  "Academic Project Page",
] as const;

const COLOR_SCHEMES = [
  "Modern Dark",
  "Clean Light",
  "Gradient",
  "Corporate",
  "Creative",
] as const;

const SAMPLE_PROMPTS = [
  "Portfolio website for a computer science student",
  "Landing page for an IoT project",
  "Dashboard for student attendance system",
  "Blog for engineering final year project showcase",
  "E-commerce page for handmade crafts by college students",
] as const;

type WebsiteType = (typeof WEBSITE_TYPES)[number];
type ColorScheme = (typeof COLOR_SCHEMES)[number];
type CodeTab = "html" | "css" | "js";
type DeviceMode = "desktop" | "mobile";

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSrcDoc(code: WebsiteCode): string {
  return code.html
    .replace("</head>", `<style>${code.css}</style></head>`)
    .replace("</body>", `<script>${code.js}<\/script></body>`);
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}

function CopyIconButton({ text, ocid }: { text: string; ocid: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await copyToClipboard(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handle}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-smooth"
      aria-label="Copy code"
      data-ocid={ocid}
    >
      {copied ? (
        <Check size={13} className="text-emerald-400" />
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}

function LineNumbers({ content }: { content: string }) {
  const count = content.split("\n").length;
  return (
    <div
      className="select-none pr-3 text-right shrink-0 min-w-[2.5rem]"
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={`ln-${i + 1}`}
          className="text-xs leading-5 text-muted-foreground/35 font-mono"
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WebsiteGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [websiteType, setWebsiteType] = useState<WebsiteType>("Portfolio");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("Modern Dark");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<WebsiteCode | null>(null);
  const [editedCode, setEditedCode] = useState<WebsiteCode | null>(null);
  const [activeTab, setActiveTab] = useState<CodeTab>("html");
  const [editMode, setEditMode] = useState(false);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentCode = editedCode ?? result;
  const currentContent = currentCode?.[activeTab] ?? "";

  // ── Generate ───────────────────────────────────────────────────────────────

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your website first");
      return;
    }
    setLoading(true);
    setProgress(0);
    setResult(null);
    setEditedCode(null);
    setEditMode(false);

    const stages = [15, 35, 58, 78, 92];
    for (const p of stages) {
      await new Promise((r) => setTimeout(r, 260));
      setProgress(p);
    }
    await new Promise((r) => setTimeout(r, 300));
    setProgress(100);

    const enriched = `${websiteType}: ${prompt} — ${colorScheme} theme`;
    setResult(generateWebsiteCode(enriched));
    setLoading(false);
    toast.success("Website generated! ✨");
  };

  // ── Code edit ──────────────────────────────────────────────────────────────

  const handleCodeChange = (value: string) => {
    const base = editedCode ?? result;
    if (!base) return;
    setEditedCode({ ...base, [activeTab]: value });
  };

  const handleEditBlur = () => {
    if (!editedCode || !iframeRef.current) return;
    iframeRef.current.srcdoc = buildSrcDoc(editedCode);
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const refreshPreview = () => {
    if (!currentCode || !iframeRef.current) return;
    iframeRef.current.srcdoc = buildSrcDoc(currentCode);
    toast.success("Preview refreshed");
  };

  const openInNewTab = () => {
    if (!currentCode) return;
    const blob = new Blob([buildSrcDoc(currentCode)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 8000);
  };

  const downloadZip = () => {
    if (!currentCode) return;
    downloadText(currentCode.html, "index.html", "text/html");
    setTimeout(
      () => downloadText(currentCode.css, "style.css", "text/css"),
      200,
    );
    setTimeout(
      () => downloadText(currentCode.js, "app.js", "text/javascript"),
      400,
    );
    toast.success("Files downloading…");
  };

  const copyHTML = async () => {
    if (!currentCode) return;
    await copyToClipboard(currentCode.html);
    toast.success("HTML copied!");
  };

  const copyAll = async () => {
    if (!currentCode) return;
    await copyToClipboard(
      `<!-- HTML -->\n${currentCode.html}\n\n/* CSS */\n${currentCode.css}\n\n// JS\n${currentCode.js}`,
    );
    toast.success("All code copied!");
  };

  const shareURL = () => {
    const url = new URL(window.location.href);
    url.hash = `prompt=${encodeURIComponent(prompt)}`;
    copyToClipboard(url.toString());
    toast.success("Share link copied!");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full" data-ocid="website.page">
      {/* ── Header + Input Panel ── */}
      <div className="px-4 lg:px-6 pt-6 pb-4 shrink-0 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 shadow-glow-cyan shrink-0">
            <Globe size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold gradient-text">
              🌐 Website Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Bolt AI Style — Generate HTML, CSS, JavaScript websites instantly
            </p>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            <Sparkles size={10} className="mr-1" /> AI Powered
          </Badge>
        </div>

        {/* Input Panel */}
        <div
          className="glassmorphism rounded-2xl p-4 space-y-4"
          data-ocid="website.input.panel"
        >
          {/* Sample prompts */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Quick Start
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((sp, i) => (
                <button
                  type="button"
                  key={sp}
                  onClick={() => setPrompt(sp)}
                  data-ocid={`website.sample_prompt.item.${i + 1}`}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary hover:bg-primary/15 transition-smooth cursor-pointer"
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="web-prompt">Describe your website</Label>
            <Textarea
              id="web-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Portfolio website for a computer science student with dark theme, skill cards, project showcase, and contact form…"
              className="bg-background/40 border-border/60 min-h-[72px] resize-none"
              data-ocid="website.prompt.textarea"
            />
          </div>

          {/* Type + Color selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Website Type
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {WEBSITE_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setWebsiteType(t)}
                    data-ocid={`website.type.${t.toLowerCase().replace(/\s+/g, "_")}`}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-smooth cursor-pointer ${
                      websiteType === t
                        ? "bg-primary text-primary-foreground border-primary shadow-glow-blue"
                        : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Color Scheme
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_SCHEMES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColorScheme(c)}
                    data-ocid={`website.color.${c.toLowerCase().replace(/\s+/g, "_")}`}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-smooth cursor-pointer ${
                      colorScheme === c
                        ? "bg-secondary text-secondary-foreground border-secondary shadow-glow-purple"
                        : "border-border/40 bg-muted/20 text-muted-foreground hover:border-secondary/35 hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate button + progress */}
          <div className="space-y-2">
            <Button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white border-0 font-semibold shadow-glow-blue hover:opacity-90 transition-smooth"
              data-ocid="website.generate.submit_button"
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="mr-2 animate-spin" />
                  Generating Website…
                </>
              ) : (
                <>
                  <Zap size={15} className="mr-2" />
                  Generate Website
                </>
              )}
            </Button>
            {loading && (
              <div className="space-y-1">
                <ProgressBar progress={progress} />
                <p className="text-xs text-muted-foreground text-center">
                  {progress < 40
                    ? "Analyzing your prompt…"
                    : progress < 65
                      ? "Generating HTML structure…"
                      : progress < 85
                        ? "Styling with CSS…"
                        : "Finalizing JavaScript…"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Empty State ── */}
      <AnimatePresence>
        {!result && !loading && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center px-4 lg:px-6 pb-6"
            data-ocid="website.empty_state"
          >
            <div className="glassmorphism rounded-2xl p-12 text-center max-w-md w-full">
              <div className="relative mx-auto mb-5 w-16 h-16">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Globe size={28} className="text-cyan-400" />
                </div>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">
                Build Any Website Instantly
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Describe your website idea above. AI THOZHANX generates complete{" "}
                <span className="text-orange-300 font-medium">HTML</span>,{" "}
                <span className="text-blue-300 font-medium">CSS</span>, and{" "}
                <span className="text-yellow-300 font-medium">JavaScript</span>{" "}
                with a live split preview.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading State ── */}
      <AnimatePresence>
        {loading && !result && (
          <motion.div
            key="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center px-4 lg:px-6 pb-6"
            data-ocid="website.loading_state"
          >
            <div className="glassmorphism rounded-2xl p-10 text-center max-w-sm w-full space-y-4">
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`dot-${i}`}
                    className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 0.7,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">
                  Building your {websiteType}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {colorScheme} theme — HTML, CSS & JavaScript
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Split View ── */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            key="split-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col px-4 lg:px-6 pb-6 gap-4 min-h-0"
            data-ocid="website.result.section"
          >
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">
                  ✓ Ready
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs border-primary/30 text-primary"
                >
                  {websiteType}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs border-secondary/30 text-secondary-foreground"
                >
                  {colorScheme}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyHTML}
                  className="h-8 px-3 text-xs border-border/40 bg-background/40"
                  data-ocid="website.copy_html.button"
                >
                  <Copy size={12} className="mr-1" /> Copy HTML
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAll}
                  className="h-8 px-3 text-xs border-border/40 bg-background/40"
                  data-ocid="website.copy_all.button"
                >
                  <Code2 size={12} className="mr-1" /> Copy All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInNewTab}
                  className="h-8 px-3 text-xs border-border/40 bg-background/40"
                  data-ocid="website.open_new_tab.button"
                >
                  <ExternalLink size={12} className="mr-1" /> New Tab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareURL}
                  className="h-8 px-3 text-xs border-border/40 bg-background/40"
                  data-ocid="website.share.button"
                >
                  <Share2 size={12} className="mr-1" /> Share URL
                </Button>
                <Button
                  size="sm"
                  onClick={downloadZip}
                  className="h-8 px-3 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
                  data-ocid="website.download.button"
                >
                  <Download size={12} className="mr-1" /> Download ZIP
                </Button>
              </div>
            </div>

            {/* Panes */}
            <div
              className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0"
              style={{ minHeight: "520px" }}
            >
              {/* LEFT — Live Preview */}
              <div
                className="flex flex-col glassmorphism rounded-2xl overflow-hidden xl:flex-[60] min-h-[420px]"
                data-ocid="website.preview.panel"
              >
                {/* Browser chrome bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-background/30 shrink-0">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-red-400/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
                  </div>
                  <div className="flex-1 mx-2 h-6 rounded-md bg-muted/20 border border-border/30 flex items-center px-2 gap-1.5 min-w-0">
                    <Globe
                      size={10}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      preview://generated-website
                    </span>
                  </div>
                  {/* Device toggle */}
                  <div className="flex items-center gap-0.5 bg-background/30 rounded-lg p-0.5 border border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDevice("desktop")}
                      className={`p-1.5 rounded-md transition-smooth ${device === "desktop" ? "bg-white/15 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      aria-label="Desktop view"
                      data-ocid="website.device.desktop_toggle"
                    >
                      <Monitor size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevice("mobile")}
                      className={`p-1.5 rounded-md transition-smooth ${device === "mobile" ? "bg-white/15 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      aria-label="Mobile view"
                      data-ocid="website.device.mobile_toggle"
                    >
                      <Smartphone size={13} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={refreshPreview}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-smooth"
                    aria-label="Refresh"
                    data-ocid="website.preview.refresh_button"
                  >
                    <RotateCcw size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={openInNewTab}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-smooth"
                    aria-label="Open in new tab"
                    data-ocid="website.preview.open_button"
                  >
                    <ExternalLink size={13} />
                  </button>
                </div>

                {/* iframe */}
                <div className="flex-1 flex items-start justify-center bg-background/20 p-3 overflow-auto min-h-0">
                  <div
                    className={`transition-all duration-300 overflow-hidden rounded-lg border border-white/10 shadow-xl ${
                      device === "mobile" ? "w-[375px]" : "w-full h-full"
                    }`}
                    style={
                      device === "desktop"
                        ? { height: "100%", minHeight: "380px" }
                        : { minHeight: "667px" }
                    }
                  >
                    {device === "mobile" && (
                      <div className="h-5 bg-muted/30 border-b border-white/10 flex items-center justify-center">
                        <div className="w-10 h-1 rounded-full bg-white/20" />
                      </div>
                    )}
                    <iframe
                      ref={iframeRef}
                      srcDoc={buildSrcDoc(currentCode!)}
                      title="Website Preview"
                      className="w-full bg-white"
                      style={{
                        height:
                          device === "mobile" ? "calc(100% - 1.25rem)" : "100%",
                        minHeight: device === "mobile" ? "667px" : "380px",
                      }}
                      sandbox="allow-scripts"
                      data-ocid="website.preview.iframe"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT — Code Editor */}
              <div
                className="flex flex-col glassmorphism rounded-2xl overflow-hidden xl:flex-[40] min-h-[420px]"
                data-ocid="website.code.panel"
              >
                {/* Tabs header */}
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => {
                    setActiveTab(v as CodeTab);
                    setEditMode(false);
                  }}
                  className="flex flex-col h-full"
                >
                  <div className="flex items-center px-2 pt-1.5 border-b border-white/10 bg-[#0d1117] shrink-0">
                    <TabsList className="bg-transparent border-0 p-0 h-auto gap-0 mr-auto">
                      <TabsTrigger
                        value="html"
                        className="relative h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-none bg-transparent border-0 data-[state=active]:text-orange-300 data-[state=active]:bg-[#161b22] text-muted-foreground hover:text-foreground data-[state=active]:shadow-none"
                        data-ocid="website.html.tab"
                      >
                        HTML
                      </TabsTrigger>
                      <TabsTrigger
                        value="css"
                        className="relative h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-none bg-transparent border-0 data-[state=active]:text-blue-300 data-[state=active]:bg-[#161b22] text-muted-foreground hover:text-foreground data-[state=active]:shadow-none"
                        data-ocid="website.css.tab"
                      >
                        CSS
                      </TabsTrigger>
                      <TabsTrigger
                        value="js"
                        className="relative h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-none bg-transparent border-0 data-[state=active]:text-yellow-300 data-[state=active]:bg-[#161b22] text-muted-foreground hover:text-foreground data-[state=active]:shadow-none"
                        data-ocid="website.js.tab"
                      >
                        JS
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-0.5 pb-1">
                      <CopyIconButton
                        text={currentContent}
                        ocid={`website.code.copy_${activeTab}`}
                      />
                      <button
                        type="button"
                        onClick={() => setEditMode((e) => !e)}
                        className={`p-1.5 rounded-md transition-smooth ${editMode ? "text-yellow-400 bg-yellow-400/10" : "text-muted-foreground hover:text-foreground hover:bg-white/10"}`}
                        title={editMode ? "Exit edit mode" : "Edit code"}
                        data-ocid="website.code.edit_toggle"
                      >
                        <Pencil size={12} />
                      </button>
                      {editMode && (
                        <span className="text-xs text-yellow-400/80 px-1.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 ml-1">
                          Editing
                        </span>
                      )}
                    </div>
                  </div>

                  {(["html", "css", "js"] as CodeTab[]).map((lang) => (
                    <TabsContent
                      key={lang}
                      value={lang}
                      className="flex-1 m-0 overflow-hidden min-h-0"
                    >
                      <div
                        className="flex flex-col h-full bg-[#0d1117]"
                        style={{ minHeight: "300px" }}
                      >
                        {editMode ? (
                          <textarea
                            value={currentCode?.[lang] ?? ""}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            onBlur={handleEditBlur}
                            className="flex-1 w-full p-4 font-mono text-xs leading-5 bg-[#0d1117] text-green-300/90 resize-none outline-none border-none caret-cyan-400"
                            spellCheck={false}
                            data-ocid={`website.${lang}.editor`}
                            style={{ tabSize: 2 }}
                          />
                        ) : (
                          <div className="flex-1 overflow-auto p-4 flex gap-0">
                            <LineNumbers content={currentCode?.[lang] ?? ""} />
                            <pre
                              className="flex-1 font-mono text-xs leading-5 text-emerald-300/80 whitespace-pre overflow-x-auto min-w-0"
                              data-ocid={`website.${lang}.code`}
                            >
                              <code>{currentCode?.[lang]}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Footer status bar */}
                <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-t border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-muted-foreground font-mono">
                      {currentCode?.[activeTab].split("\n").length ?? 0} lines
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={shareURL}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      data-ocid="website.share_footer.button"
                    >
                      <Share2 size={10} className="mr-1" /> Share
                    </Button>
                    <Button
                      size="sm"
                      onClick={downloadZip}
                      className="h-6 px-2.5 text-xs bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/25 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30"
                      data-ocid="website.download_footer.button"
                    >
                      <Download size={10} className="mr-1" /> Export
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/40 text-center shrink-0">
              Toggle{" "}
              <strong className="text-muted-foreground/60">Edit Mode</strong>{" "}
              (✏) to modify code live. Use{" "}
              <strong className="text-muted-foreground/60">Download ZIP</strong>{" "}
              to get all 3 files.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
