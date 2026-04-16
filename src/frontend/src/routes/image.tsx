import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, copyToClipboard } from "@/lib/utils";
import {
  AlertCircle,
  CheckCheck,
  Download,
  Expand,
  Image as ImageIcon,
  LayoutGrid,
  RefreshCw,
  Share2,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneratedImage {
  url: string;
  prompt: string;
  enhancedPrompt: string;
  style: string;
  size: string;
  seed: number;
  timestamp: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLES = [
  {
    value: "photorealistic",
    label: "Photorealistic",
    icon: "📸",
    modifier: "photorealistic, ultra-detailed, 8K, professional photography",
  },
  {
    value: "digital-art",
    label: "Digital Art",
    icon: "🎨",
    modifier:
      "digital art, vibrant colors, detailed illustration, trending on artstation",
  },
  {
    value: "oil-painting",
    label: "Oil Painting",
    icon: "🖼️",
    modifier:
      "oil painting, classical art style, rich textures, detailed brushwork",
  },
  {
    value: "watercolor",
    label: "Watercolor",
    icon: "💧",
    modifier: "watercolor painting, soft colors, artistic, flowing pigments",
  },
  {
    value: "anime",
    label: "Anime Style",
    icon: "✨",
    modifier:
      "anime style, vibrant, detailed anime illustration, studio quality",
  },
  {
    value: "sketch",
    label: "Pencil Sketch",
    icon: "✏️",
    modifier:
      "pencil sketch, detailed line art, professional illustration, graphite",
  },
];

const SIZES: {
  value: string;
  label: string;
  dims: string;
  w: number;
  h: number;
}[] = [
  { value: "1:1", label: "Square", dims: "1024×1024", w: 1024, h: 1024 },
  { value: "16:9", label: "Landscape", dims: "1344×768", w: 1344, h: 768 },
  { value: "9:16", label: "Portrait", dims: "768×1344", w: 768, h: 1344 },
];

const QUICK_PROMPTS = [
  "A futuristic smart city at night with neon lights and flying vehicles",
  "An AI robot studying books in a glowing library",
  "Abstract digital art showing data flowing through a neural network",
  "A student presenting a project with holographic displays",
  "A beautiful sunset over a mountain range with dramatic clouds",
  "A colorful galaxy nebula with stars and cosmic dust",
];

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────

function ShimmerSkeleton({ size }: { size: string }) {
  const aspectClass =
    size === "16:9"
      ? "aspect-video"
      : size === "9:16"
        ? "aspect-[9/16]"
        : "aspect-square";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-white/5",
        aspectClass,
      )}
    >
      {/* Gemini-style shimmer layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/50 to-cyan-900/60" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(124,58,237,0.35) 50%, transparent 60%)",
          backgroundSize: "250% 100%",
          animation: "gemini-shimmer 1.8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(34,211,238,0.2) 50%, transparent 60%)",
          backgroundSize: "250% 100%",
          animation: "gemini-shimmer 1.8s ease-in-out infinite 0.4s",
        }}
      />
      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(124,58,237,0.12) 3px, rgba(124,58,237,0.12) 4px)",
        }}
      />
      {/* Center spinner */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-purple-500/30 border-t-purple-400 border-r-cyan-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={20} className="text-purple-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-white/80 animate-pulse">
            Generating with AI…
          </p>
          <p className="text-xs text-white/40">Pollinations AI • Flux Model</p>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-purple-400/60"
              style={{
                animation: `dot-pulse 1.4s ease-in-out infinite ${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Generated Image Display ──────────────────────────────────────────────────

interface ImageDisplayProps {
  image: GeneratedImage;
  onExpand: () => void;
  onDownload: () => void;
  onRegenerate: () => void;
  onShare: () => void;
}

function ImageDisplay({
  image,
  onExpand,
  onDownload,
  onRegenerate,
  onShare,
}: ImageDisplayProps) {
  const [revealed, setRevealed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const sizeObj = SIZES.find((s) => s.value === image.size);
  const aspectClass =
    image.size === "16:9"
      ? "aspect-video"
      : image.size === "9:16"
        ? "aspect-[9/16]"
        : "aspect-square";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Image container */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl group",
          aspectClass,
          "bg-white/5",
        )}
      >
        {!imgLoaded && !imgError && <ShimmerSkeleton size={image.size} />}

        {imgError ? (
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-3",
              aspectClass,
            )}
          >
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm text-red-400 font-medium">
              Image failed to load
            </p>
            <p className="text-xs text-white/40">
              Try regenerating with a different prompt
            </p>
            <Button
              size="sm"
              onClick={onRegenerate}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs"
              data-ocid="image.retry.button"
            >
              <RefreshCw size={12} className="mr-1.5" />
              Retry
            </Button>
          </div>
        ) : (
          <motion.img
            src={image.url}
            alt={image.prompt}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]",
            )}
            onLoad={() => {
              setImgLoaded(true);
              setRevealed(true);
            }}
            onError={() => {
              setImgError(true);
              setImgLoaded(false);
            }}
            draggable={false}
          />
        )}

        {/* Hover overlay actions */}
        {imgLoaded && revealed && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-2xl">
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                type="button"
                onClick={onExpand}
                data-ocid="image.expand.button"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 transition-smooth"
                aria-label="Expand image"
              >
                <Expand size={15} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Success badge */}
        {imgLoaded && revealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-3 left-3"
          >
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] backdrop-blur-sm">
              ✅ AI Generated
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Prompt used */}
      {imgLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-white/10 bg-white/5 p-3"
        >
          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide font-mono">
            Prompt used
          </p>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {image.enhancedPrompt}
          </p>
        </motion.div>
      )}

      {/* Metadata badges */}
      {imgLoaded && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-white/10 border-white/20 text-foreground text-[11px]">
            {STYLES.find((s) => s.value === image.style)?.icon}{" "}
            {STYLES.find((s) => s.value === image.style)?.label}
          </Badge>
          <Badge className="bg-white/10 border-white/20 text-foreground text-[11px]">
            {sizeObj?.dims}
          </Badge>
          <Badge className="bg-purple-500/15 border-purple-500/30 text-purple-300 text-[11px]">
            Seed #{image.seed}
          </Badge>
        </div>
      )}

      {/* Actions */}
      {imgLoaded && (
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={onDownload}
            className="border-white/15 bg-white/5 hover:bg-white/10 h-10 text-sm"
            data-ocid="image.download.button"
          >
            <Download size={14} className="mr-1.5" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={onShare}
            className="border-white/15 bg-white/5 hover:bg-white/10 h-10 text-sm"
            data-ocid="image.share.button"
          >
            <Share2 size={14} className="mr-1.5" />
            Share
          </Button>
          <Button
            onClick={onRegenerate}
            className="bg-gradient-to-r from-purple-600/80 to-cyan-500/80 hover:from-purple-500 hover:to-cyan-400 text-white border-0 h-10 text-sm"
            data-ocid="image.regenerate.button"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Regenerate
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Expanded Modal ───────────────────────────────────────────────────────────

function ExpandedModal({
  image,
  onClose,
}: { image: GeneratedImage; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      data-ocid="image.expanded_modal.dialog"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          data-ocid="image.expanded_modal.close_button"
          className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-smooth"
          aria-label="Close"
        >
          <X size={15} className="text-white" />
        </button>
        <img
          src={image.url}
          alt={image.prompt}
          className="w-full rounded-2xl shadow-2xl"
        />
        <p className="mt-3 text-center text-xs text-white/50">
          {image.enhancedPrompt}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
      data-ocid="image.empty_state"
    >
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
          <ImageIcon size={32} className="text-purple-400/60" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <Sparkles size={12} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground/70">
          Describe your image
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Type a prompt and click Generate to create a real AI image
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("digital-art");
  const [selectedSize, setSelectedSize] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(
    null,
  );
  const [expandedImage, setExpandedImage] = useState<GeneratedImage | null>(
    null,
  );
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  const buildImageUrl = useCallback(
    (p: string, style: string, size: string, seed: number) => {
      const sizeObj = SIZES.find((s) => s.value === size) ?? SIZES[0];
      const styleObj = STYLES.find((s) => s.value === style);
      const enhancedPrompt = styleObj ? `${p}, ${styleObj.modifier}` : p;
      const encoded = encodeURIComponent(enhancedPrompt);
      return {
        url: `https://image.pollinations.ai/prompt/${encoded}?width=${sizeObj.w}&height=${sizeObj.h}&nologo=true&enhance=true&model=flux&seed=${seed}`,
        enhancedPrompt,
      };
    },
    [],
  );

  const generate = useCallback(
    async (newPrompt?: string) => {
      const p = newPrompt ?? prompt;
      if (!p.trim()) {
        toast.error("Please enter a prompt first");
        return;
      }
      if (newPrompt) setPrompt(newPrompt);

      setLoading(true);
      setGeneratedImage(null);

      const seed = Math.floor(Math.random() * 9999999);
      const { url, enhancedPrompt } = buildImageUrl(
        p,
        selectedStyle,
        selectedSize,
        seed,
      );

      const img: GeneratedImage = {
        url,
        prompt: p,
        enhancedPrompt,
        style: selectedStyle,
        size: selectedSize,
        seed,
        timestamp: Date.now(),
      };

      setGeneratedImage(img);
      setHistory((prev) => [img, ...prev.slice(0, 11)]);
      setLoading(false);
      toast.success("Image generation started!");
    },
    [prompt, selectedStyle, selectedSize, buildImageUrl],
  );

  const handleDownload = useCallback(async () => {
    if (!generatedImage) return;
    toast.loading("Preparing download…", { id: "img-dl" });
    try {
      const response = await fetch(generatedImage.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thozhanx-ai-${generatedImage.seed}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded as PNG!", { id: "img-dl" });
    } catch {
      // fallback: open in new tab
      window.open(generatedImage.url, "_blank");
      toast.dismiss("img-dl");
    }
  }, [generatedImage]);

  const handleShare = useCallback(async () => {
    if (!generatedImage) return;
    const text = `🎨 Generated with AI THOZHANX 2.O\n\nPrompt: ${generatedImage.prompt}\nStyle: ${generatedImage.style}\n\nImage URL: ${generatedImage.url}`;
    await copyToClipboard(text);
    toast.success("Share text + URL copied!");
  }, [generatedImage]);

  const handleRegenerate = useCallback(() => {
    generate(prompt);
  }, [generate, prompt]);

  return (
    <div className="min-h-full p-4 md:p-6" data-ocid="image.page">
      <style>{`
        @keyframes gemini-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes dot-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {/* ─── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-glow-purple shrink-0">
              <ImageIcon size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold gradient-text">
                🎨 Image Generator
              </h1>
              <p className="text-sm text-muted-foreground">
                Real AI generation powered by Pollinations AI — Flux model
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          {/* ─── Left: Input Panel ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Prompt */}
            <div className="glassmorphism rounded-2xl p-5 space-y-4">
              <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                <Wand2 size={15} className="text-secondary" />
                Describe Your Image
              </h2>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate();
                }}
                placeholder="Describe your image… e.g., 'A futuristic AI robot reading books in a glowing cyberpunk library'"
                className="bg-white/5 border-white/10 focus:border-secondary/40 min-h-[110px] resize-none text-sm"
                data-ocid="image.prompt.textarea"
              />
              <div>
                <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
                  <Sparkles size={10} />
                  Quick prompts
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((p, i) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => generate(p)}
                      data-ocid={`image.quick_prompt.item.${i + 1}`}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-secondary/30 hover:bg-secondary/10 hover:text-foreground transition-smooth text-left"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style selector */}
            <div className="glassmorphism rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                <LayoutGrid size={15} className="text-accent" />
                Image Style
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSelectedStyle(s.value)}
                    data-ocid={`image.style.${s.value}`}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-2.5 text-left transition-smooth text-sm",
                      selectedStyle === s.value
                        ? "border-secondary/50 bg-secondary/15 text-foreground"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10",
                    )}
                  >
                    <span className="text-base leading-none">{s.icon}</span>
                    <span className="text-xs font-medium leading-tight">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="glassmorphism rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                <Expand size={15} className="text-primary" />
                Output Size
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSelectedSize(s.value)}
                    data-ocid={`image.size.${s.value.replace(":", "-")}`}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-3 transition-smooth",
                      selectedSize === s.value
                        ? "border-primary/50 bg-primary/15 text-foreground"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20",
                    )}
                  >
                    <div
                      className={cn(
                        "border-2 rounded bg-white/10",
                        s.value === "1:1" && "h-8 w-8",
                        s.value === "16:9" && "h-5 w-9",
                        s.value === "9:16" && "h-9 w-5",
                        selectedSize === s.value
                          ? "border-primary/60"
                          : "border-white/20",
                      )}
                    />
                    <span className="text-[10px] font-medium">{s.label}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {s.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate CTA */}
            <Button
              onClick={() => generate()}
              disabled={loading || !prompt.trim()}
              data-ocid="image.generate.submit_button"
              className={cn(
                "w-full h-12 text-white border-0 font-display font-semibold text-base transition-all duration-300",
                loading
                  ? "bg-gradient-to-r from-purple-700 via-pink-600 to-cyan-600 animate-pulse"
                  : "bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:from-purple-500 hover:via-pink-400 hover:to-cyan-400 shadow-glow-purple hover:shadow-glow-cyan",
              )}
              style={
                loading
                  ? {
                      backgroundSize: "200% 100%",
                      animation:
                        "gemini-shimmer 1.5s ease-in-out infinite, pulse 2s ease-in-out infinite",
                    }
                  : undefined
              }
            >
              {loading ? (
                <>
                  <RefreshCw size={17} className="mr-2 animate-spin" />
                  Creating Your Image…
                </>
              ) : (
                <>
                  <Zap size={17} className="mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </motion.div>

          {/* ─── Right: Output Panel ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div className="glassmorphism rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                  <ImageIcon size={15} className="text-accent" />
                  Generated Output
                  {generatedImage && (
                    <Badge variant="secondary" className="ml-1 text-[10px]">
                      AI • Flux
                    </Badge>
                  )}
                </h2>
                {generatedImage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    className="h-7 px-2 border-white/15 bg-white/5 text-xs"
                    data-ocid="image.share_header.button"
                  >
                    <CheckCheck size={12} className="mr-1" />
                    Copy URL
                  </Button>
                )}
              </div>

              {/* Loading shimmer */}
              {loading && <ShimmerSkeleton size={selectedSize} />}

              {/* Generated image */}
              <AnimatePresence mode="wait">
                {!loading && generatedImage && (
                  <ImageDisplay
                    key={generatedImage.seed}
                    image={generatedImage}
                    onExpand={() => setExpandedImage(generatedImage)}
                    onDownload={handleDownload}
                    onRegenerate={handleRegenerate}
                    onShare={handleShare}
                  />
                )}
              </AnimatePresence>

              {/* Empty state */}
              {!loading && !generatedImage && <EmptyState />}
            </div>

            {/* History gallery */}
            {history.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glassmorphism rounded-2xl p-5"
                data-ocid="image.history.section"
              >
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <LayoutGrid size={14} className="text-muted-foreground" />
                  Recent Generations
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {history.slice(0, 8).map((img, i) => (
                    <button
                      key={img.seed}
                      type="button"
                      onClick={() => setGeneratedImage(img)}
                      data-ocid={`image.history.item.${i + 1}`}
                      className={cn(
                        "relative overflow-hidden rounded-xl aspect-square transition-smooth hover:ring-2 hover:ring-secondary/50",
                        generatedImage?.seed === img.seed &&
                          "ring-2 ring-secondary",
                      )}
                    >
                      <img
                        src={img.url}
                        alt={img.prompt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-xl" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Expanded modal */}
      <AnimatePresence>
        {expandedImage && (
          <ExpandedModal
            image={expandedImage}
            onClose={() => setExpandedImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
