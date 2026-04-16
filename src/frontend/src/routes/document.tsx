import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generateDocument } from "@/lib/mockAI";
import { copyToClipboard, wordCount } from "@/lib/utils";
import { PAGE_HINTS, useAppStore } from "@/stores/appStore";
import {
  BookOpen,
  Copy,
  Edit3,
  Eye,
  FileDown,
  FileText,
  Printer,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Data ─────────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  { value: "assignment", label: "Assignment Report" },
  { value: "research", label: "Research Paper" },
  { value: "lab", label: "Lab Report" },
  { value: "project", label: "Project Report" },
  { value: "case-study", label: "Case Study" },
  { value: "literature", label: "Literature Review" },
] as const;

const DEPARTMENTS = [
  { value: "CSE", label: "CSE" },
  { value: "ECE", label: "ECE" },
  { value: "EEE", label: "EEE" },
  { value: "AI&DS", label: "AI & DS" },
  { value: "AI&ML", label: "AI & ML" },
  { value: "CIVIL", label: "CIVIL" },
  { value: "MECH", label: "MECH" },
  { value: "IT", label: "IT" },
] as const;

const WORD_COUNTS = [
  { value: "500", label: "500 words" },
  { value: "1000", label: "1,000 words" },
  { value: "2000", label: "2,000 words" },
  { value: "5000", label: "5,000 words" },
] as const;

const SECTIONS = [
  { key: "abstract", label: "Abstract" },
  { key: "introduction", label: "Introduction" },
  { key: "methodology", label: "Methodology" },
  { key: "results", label: "Results" },
  { key: "conclusion", label: "Conclusion" },
  { key: "references", label: "References" },
] as const;

const SAMPLE_TOPICS = [
  "Machine learning in healthcare",
  "IoT-based smart home system",
  "Renewable energy optimization",
  "Blockchain for secure data storage",
  "Deep learning for image recognition",
  "Edge computing in autonomous vehicles",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedSection {
  id: string;
  heading: string;
  body: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseDocumentSections(raw: string): ParsedSection[] {
  const lines = raw.split("\n");
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const isHeading =
      trimmed.match(/^[A-Z][A-Z\s&]+$/) || trimmed.match(/^\d+\.\s+[A-Z]/);

    if (isHeading) {
      if (current) sections.push(current);
      current = { id: toSlug(trimmed), heading: trimmed, body: "" };
    } else if (trimmed === "━".repeat(trimmed.length) && trimmed.length > 5) {
      // skip separators
    } else if (trimmed.match(/^\d+\.\d+\s+/) && current) {
      current.body += `\n**${trimmed}**\n`;
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  if (current) sections.push(current);
  return sections;
}

function estimatePages(wc: number): number {
  return Math.max(1, Math.round(wc / 250));
}

function buildStyledHTML(
  title: string,
  raw: string,
  docType: string,
  department: string,
): string {
  const sections = parseDocumentSections(raw);
  const docLabel = DOC_TYPES.find((d) => d.value === docType)?.label ?? docType;

  const sectionsHTML = sections
    .map(
      (s) => `
    <div class="section">
      <h2>${s.heading}</h2>
      <div class="body">${s.body
        .split("\n")
        .map((l) => {
          const bold = l.match(/^\*\*(.+)\*\*$/);
          if (bold) return `<p class="subsection">${bold[1]}</p>`;
          if (l.trim().startsWith("•") || l.trim().startsWith("-"))
            return `<p class="bullet">${l}</p>`;
          if (l.trim().match(/^\[\d+\]/)) return `<p class="ref">${l}</p>`;
          return l.trim() ? `<p>${l}</p>` : "<p>&nbsp;</p>";
        })
        .join("")}</div>
    </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.8;color:#1a1a2e;background:#fff;padding:2cm}
    h1{font-size:18pt;text-align:center;color:#1e1b4b;margin-bottom:6pt}
    .meta{text-align:center;color:#6366f1;font-size:10pt;margin-bottom:24pt;padding-bottom:12pt;border-bottom:2px solid #e0e7ff}
    h2{font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#4f46e5;border-bottom:1.5px solid #e0e7ff;padding-bottom:3pt;margin:18pt 0 8pt}
    p{margin-bottom:6pt}.subsection{font-weight:600;color:#312e81;margin-top:8pt}.bullet{margin-left:16pt}.ref{font-size:10pt;color:#3730a3}
    .section{margin-bottom:20pt}
    .footer{text-align:center;font-size:8pt;color:#9ca3af;margin-top:32pt;padding-top:8pt;border-top:1px solid #e0e7ff}
    @media print{body{padding:2cm}h2{page-break-after:avoid}}
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">${docLabel} · ${department} · ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
  ${sectionsHTML}
  <div class="footer">Generated by AI THOZHANX 2.O · For Educational Use Only · © 2026</div>
</body>
</html>`;
}

// ─── SectionLine ──────────────────────────────────────────────────────────────

function SectionLine({ line }: { line: string }) {
  const bold = line.match(/^\*\*(.+)\*\*$/);
  if (bold) {
    return (
      <p className="font-semibold mt-3 mb-1" style={{ color: "#312e81" }}>
        {bold[1]}
      </p>
    );
  }
  if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
    return <p className="ml-4 mb-1">{line}</p>;
  }
  if (line.trim().match(/^\[\d+\]/)) {
    return (
      <p className="mb-1" style={{ fontSize: "0.8rem", color: "#3730a3" }}>
        {line}
      </p>
    );
  }
  return <p className={line.trim() ? "mb-2" : "mb-1"}>{line}</p>;
}

// ─── DocumentPreview ──────────────────────────────────────────────────────────

function DocumentPreview({
  raw,
  title,
  docType,
  department,
  generatedAt,
  activeSection,
  onSectionClick,
}: {
  raw: string;
  title: string;
  docType: string;
  department: string;
  generatedAt: Date;
  activeSection: string;
  onSectionClick: (id: string) => void;
}) {
  const sections = parseDocumentSections(raw);
  const docLabel = DOC_TYPES.find((t) => t.value === docType)?.label ?? docType;

  return (
    <div className="flex gap-4">
      {/* ToC sidebar */}
      <aside className="hidden xl:block w-44 flex-shrink-0">
        <div className="glassmorphism rounded-xl p-3 sticky top-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">
            Contents
          </p>
          <nav className="space-y-0.5">
            {sections.map((sec) => (
              <button
                type="button"
                key={sec.id}
                onClick={() => onSectionClick(sec.id)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-smooth truncate ${
                  activeSection === sec.id
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                }`}
                data-ocid={`document.toc.${sec.id}`}
              >
                {sec.heading.replace(/^\d+\.\s*/, "")}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Paper */}
      <div className="flex-1 min-w-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
        {/* Gradient top bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
          }}
        />
        <ScrollArea className="h-[70vh]">
          <div className="p-8 md:p-12 font-body">
            {/* Title block */}
            <div
              className="mb-8 text-center pb-6"
              style={{ borderBottom: "2px solid #e0e7ff" }}
            >
              <h1
                className="font-display font-bold mb-2"
                style={{ fontSize: "1.35rem", color: "#1e1b4b" }}
              >
                {title}
              </h1>
              <p style={{ fontSize: "0.78rem", color: "#6366f1" }}>
                {docLabel} · {department} ·{" "}
                {generatedAt.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Sections */}
            {sections.map((sec) => (
              <div key={sec.id} id={sec.id} className="mb-7">
                <h2
                  className="font-display font-bold uppercase tracking-wider mb-3 pb-1"
                  style={{
                    fontSize: "0.75rem",
                    color: "#4f46e5",
                    borderBottom: "1.5px solid #e0e7ff",
                    letterSpacing: "0.07em",
                  }}
                >
                  {sec.heading}
                </h2>
                <div
                  className="text-[0.875rem] leading-[1.85]"
                  style={{ color: "#1a1a2e" }}
                >
                  {sec.body.split("\n").map((line, li) => (
                    <SectionLine key={`${sec.id}-line-${li}`} line={line} />
                  ))}
                </div>
              </div>
            ))}

            {/* Paper footer */}
            <div
              className="mt-8 pt-4 text-center"
              style={{
                borderTop: "1px solid #e0e7ff",
                fontSize: "0.68rem",
                color: "#9ca3af",
              }}
            >
              Generated by AI THOZHANX 2.O · For Educational Use Only · © 2026
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── DocumentEditor ───────────────────────────────────────────────────────────

function DocumentEditor({
  raw,
  editRef,
}: {
  raw: string;
  editRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sections = parseDocumentSections(raw);

  return (
    <ScrollArea className="rounded-2xl border border-border/50 bg-card h-[70vh]">
      <div className="p-5 space-y-4">
        {sections.map((sec, i) => (
          <div key={sec.id} className="glassmorphism rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              {sec.heading}
            </p>
            <textarea
              defaultValue={sec.body.trim()}
              className="w-full bg-transparent text-sm text-foreground leading-relaxed resize-none outline-none min-h-[80px] placeholder:text-muted-foreground"
              rows={Math.max(4, sec.body.split("\n").length)}
              data-ocid={`document.editor.section.${i + 1}`}
            />
          </div>
        ))}
      </div>
      {/* hidden ref for read access */}
      <div ref={editRef} className="hidden" aria-hidden="true" />
    </ScrollArea>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentGeneratorPage() {
  const { setRobotState, setCurrentPageHint } = useAppStore();

  const [topic, setTopic] = useState("");
  const [docType, setDocType] = useState<string>("assignment");
  const [department, setDepartment] = useState<string>("CSE");
  const [wordTarget, setWordTarget] = useState<string>("1000");
  const [includedSections, setIncludedSections] = useState<
    Record<string, boolean>
  >({
    abstract: true,
    introduction: true,
    methodology: true,
    results: false,
    conclusion: true,
    references: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState("");

  const editRef = useRef<HTMLDivElement | null>(null);

  const toggleSection = useCallback((key: string) => {
    setIncludedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Set page hint on mount + pre-fill from localStorage
  useEffect(() => {
    setCurrentPageHint(PAGE_HINTS["/document"]);
    setRobotState("idle");
    const pending = localStorage.getItem("thozhanx-pending-prompt-document");
    if (pending) {
      setTopic(pending);
      localStorage.removeItem("thozhanx-pending-prompt-document");
    }
  }, [setCurrentPageHint, setRobotState]);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or description");
      return;
    }
    setLoading(true);
    setViewMode("preview");
    setActiveSection("");
    setRobotState("thinking");
    await new Promise((r) => setTimeout(r, 1600));
    const doc = generateDocument(`${topic} (${department})`, docType);
    setResult(doc);
    setGeneratedAt(new Date());
    setLoading(false);

    setRobotState("celebration");
    setTimeout(() => setRobotState("idle"), 2000);

    toast.success("Document generated!", {
      description: `~${wordCount(doc).toLocaleString()} words`,
    });
  };

  const handleCopy = async () => {
    await copyToClipboard(result);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadDocx = async () => {
    if (!result) return;
    toast.loading("Building DOCX…", { id: "docx-dl" });
    try {
      const {
        Document,
        Paragraph,
        TextRun,
        HeadingLevel,
        Packer,
        AlignmentType,
      } = await import("docx");

      const sections = parseDocumentSections(result);
      const docLabel =
        DOC_TYPES.find((d) => d.value === docType)?.label ?? docType;

      const children = [
        // Document title
        new Paragraph({
          children: [
            new TextRun({
              text: topic || "Document",
              bold: true,
              size: 36,
              color: "1e1b4b",
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        // Subtitle / meta line
        new Paragraph({
          children: [
            new TextRun({
              text: `${docLabel} · ${department} · ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`,
              size: 18,
              color: "6366f1",
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      ];

      for (const sec of sections) {
        // Section heading
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sec.heading,
                bold: true,
                size: 22,
                color: "4f46e5",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 120 },
          }),
        );

        // Section body — split by lines
        const lines = sec.body.split("\n");
        for (const line of lines) {
          if (!line.trim()) continue;
          const boldMatch = line.match(/^\*\*(.+)\*\*$/);
          if (boldMatch) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: boldMatch[1],
                    bold: true,
                    size: 20,
                    color: "312e81",
                  }),
                ],
                spacing: { before: 160, after: 60 },
              }),
            );
          } else if (
            line.trim().startsWith("•") ||
            line.trim().startsWith("-")
          ) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: line.trim(), size: 20, color: "1a1a2e" }),
                ],
                bullet: { level: 0 },
                spacing: { after: 60 },
              }),
            );
          } else if (line.trim().match(/^\[\d+\]/)) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: line.trim(), size: 18, color: "3730a3" }),
                ],
                spacing: { after: 60 },
              }),
            );
          } else {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: line, size: 20, color: "1a1a2e" }),
                ],
                spacing: { after: 80 },
              }),
            );
          }
        }
      }

      // Footer
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Generated by AI THOZHANX 2.O · For Educational Use Only · © 2026",
              size: 16,
              color: "9ca3af",
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
        }),
      );

      const wordDoc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(wordDoc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thozhanx-document-${Date.now()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("DOCX downloaded!", { id: "docx-dl" });
    } catch (err) {
      console.error(err);
      toast.error("DOCX export failed", { id: "docx-dl" });
    }
  };

  const handlePrint = () => {
    const html = buildStyledHTML(
      topic || "Document",
      result,
      docType,
      department,
    );
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    setViewMode("preview");
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const wc = result ? wordCount(result) : 0;
  const pages = estimatePages(wc);
  const sectionCount = result ? parseDocumentSections(result).length : 0;

  return (
    <div className="min-h-full p-4 md:p-6" data-ocid="document.page">
      {/* Header */}
      <motion.div
        className="mb-6 flex items-center gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-glow">
          <FileText size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold gradient-text">
            Document Generator
          </h1>
          <p className="text-xs text-muted-foreground">
            Claude AI Style — Reports, assignments &amp; research papers
          </p>
        </div>
        <Badge
          variant="outline"
          className="ml-auto hidden sm:flex items-center gap-1.5 border-primary/30 text-primary text-xs"
        >
          <Sparkles size={11} />
          AI Powered
        </Badge>
      </motion.div>

      {/* Layout */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* ─── Left Panel ─── */}
        <motion.div
          className="w-full lg:w-[340px] xl:w-[360px] flex-shrink-0 space-y-4"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Document Details card */}
          <div className="glassmorphism rounded-2xl p-5 space-y-4">
            <h3 className="font-display text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <BookOpen size={14} />
              Document Details
            </h3>

            {/* Topic */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-topic" className="text-xs">
                Topic / Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="doc-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What should this document be about? e.g., Impact of AI on modern education systems…"
                className="bg-white/5 border-white/10 text-sm min-h-[80px] resize-none"
                data-ocid="document.topic.input"
              />
            </div>

            {/* Sample topics */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Quick topics
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_TOPICS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTopic(t)}
                    className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-smooth border border-primary/20 truncate max-w-full"
                    data-ocid={`document.sample.${toSlug(t.slice(0, 25))}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Type + Dept row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger
                    className="bg-white/5 border-white/10 h-9 text-xs"
                    data-ocid="document.type.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                        className="text-xs"
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger
                    className="bg-white/5 border-white/10 h-9 text-xs"
                    data-ocid="document.department.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem
                        key={d.value}
                        value={d.value}
                        className="text-xs"
                      >
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Word Count */}
            <div className="space-y-1.5">
              <Label className="text-xs">Word Count Target</Label>
              <Select value={wordTarget} onValueChange={setWordTarget}>
                <SelectTrigger
                  className="bg-white/5 border-white/10 h-9 text-xs"
                  data-ocid="document.wordcount.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORD_COUNTS.map((w) => (
                    <SelectItem
                      key={w.value}
                      value={w.value}
                      className="text-xs"
                    >
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Include Sections card */}
          <div className="glassmorphism rounded-2xl p-5 space-y-3">
            <h3 className="font-display text-sm font-semibold text-foreground/80">
              Include Sections
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-3">
              {SECTIONS.map((sec) => (
                <div
                  key={sec.key}
                  className="flex items-center gap-2"
                  data-ocid={`document.section.${sec.key}`}
                >
                  <Checkbox
                    id={`sec-${sec.key}`}
                    checked={includedSections[sec.key]}
                    onCheckedChange={() => toggleSection(sec.key)}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor={`sec-${sec.key}`}
                    className="text-xs cursor-pointer select-none"
                  >
                    {sec.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white border-0 shadow-glow hover:opacity-90 transition-smooth"
            data-ocid="document.generate.submit_button"
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="mr-2 animate-spin" />
                Generating Document…
              </>
            ) : (
              <>
                <Wand2 size={15} className="mr-2" />
                Generate Document
              </>
            )}
          </Button>

          {/* Stats strip (when generated) */}
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism rounded-xl px-4 py-3 flex items-center justify-between"
              data-ocid="document.stats.panel"
            >
              <div className="text-center">
                <p className="font-display font-bold text-primary text-xl leading-none">
                  {wc.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  words
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="font-display font-bold text-secondary text-xl leading-none">
                  ~{pages}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  pages
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="font-display font-bold text-accent text-xl leading-none">
                  {sectionCount}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  sections
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ─── Right Panel ─── */}
        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <AnimatePresence mode="wait">
            {/* Loading */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glassmorphism rounded-2xl p-16 text-center"
                data-ocid="document.loading_state"
              >
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow">
                  <FileText size={32} className="text-white animate-pulse" />
                </div>
                <p className="font-display font-semibold text-lg mb-1">
                  Writing your document…
                </p>
                <p className="text-xs text-muted-foreground mb-5">
                  Structuring sections and generating academic content
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {[
                    "Analysing topic",
                    "Building structure",
                    "Writing content",
                    "Finalising",
                  ].map((step, i) => (
                    <Badge
                      key={step}
                      variant="outline"
                      className="text-[10px] border-primary/20 text-muted-foreground"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    >
                      {step}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Result */}
            {!loading && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
                data-ocid="document.result.section"
              >
                {/* Toolbar */}
                <div className="glassmorphism rounded-xl px-3 py-2 flex flex-wrap items-center gap-1.5">
                  <Tabs
                    value={viewMode}
                    onValueChange={(v) => setViewMode(v as "preview" | "edit")}
                  >
                    <TabsList className="h-8 bg-white/5">
                      <TabsTrigger
                        value="preview"
                        className="text-xs h-6 data-[state=active]:bg-primary/20"
                        data-ocid="document.preview.tab"
                      >
                        <Eye size={11} className="mr-1.5" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger
                        value="edit"
                        className="text-xs h-6 data-[state=active]:bg-primary/20"
                        data-ocid="document.edit.tab"
                      >
                        <Edit3 size={11} className="mr-1.5" />
                        Edit
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="w-px h-6 bg-border hidden sm:block" />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 text-xs hover:bg-white/10"
                    data-ocid="document.copy.button"
                  >
                    <Copy size={12} className="mr-1.5" />
                    Copy All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadDocx}
                    className="h-8 text-xs hover:bg-white/10"
                    data-ocid="document.download_docx.button"
                  >
                    <FileDown size={12} className="mr-1.5" />
                    DOCX
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrint}
                    className="h-8 text-xs hover:bg-white/10"
                    data-ocid="document.print.button"
                  >
                    <Printer size={12} className="mr-1.5" />
                    Print
                  </Button>

                  <div className="ml-auto flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-primary/30 text-primary"
                    >
                      {wc.toLocaleString()} words
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border text-muted-foreground hidden sm:inline-flex"
                    >
                      {DOC_TYPES.find((t) => t.value === docType)?.label}
                    </Badge>
                  </div>
                </div>

                {/* Content panel */}
                {viewMode === "preview" && generatedAt ? (
                  <DocumentPreview
                    raw={result}
                    title={topic}
                    docType={docType}
                    department={department}
                    generatedAt={generatedAt}
                    activeSection={activeSection}
                    onSectionClick={handleSectionClick}
                  />
                ) : (
                  <DocumentEditor raw={result} editRef={editRef} />
                )}
              </motion.div>
            )}

            {/* Empty state */}
            {!loading && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glassmorphism rounded-2xl p-16 text-center"
                data-ocid="document.empty_state"
              >
                <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-white/10">
                  <FileText size={40} className="text-muted-foreground/40" />
                </div>
                <p className="font-display font-semibold text-lg text-foreground/60 mb-2">
                  Your document will appear here
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Enter your topic on the left, choose document type,
                  department, and sections — then click{" "}
                  <span className="text-primary font-medium">
                    Generate Document
                  </span>
                  .
                </p>
                <div className="mt-5 flex justify-center gap-2 flex-wrap">
                  {[
                    "Assignment Report",
                    "Research Paper",
                    "Lab Report",
                    "Case Study",
                  ].map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="text-xs border-primary/20 text-muted-foreground"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
