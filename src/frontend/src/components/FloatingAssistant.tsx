import { useAppStore } from "@/stores/appStore";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// Inline keyframe styles injected once
let floatingStylesInjected = false;
function ensureFloatingStyles() {
  if (floatingStylesInjected) return;
  floatingStylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes float-idle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes float-smile { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1) rotate(-5deg)} }
    @keyframes float-think { 0%,100%{transform:rotate(0)} 30%{transform:rotate(-8deg)} 70%{transform:rotate(8deg)} }
    @keyframes float-celebrate { 0%{transform:translateY(0) scale(1)} 25%{transform:translateY(-12px) scale(1.15) rotate(8deg)} 50%{transform:translateY(-6px) scale(1.1) rotate(-8deg)} 75%{transform:translateY(-14px) scale(1.18)} 100%{transform:translateY(0) scale(1)} }
    @keyframes float-dance { 0%{transform:rotate(0) scale(1)} 15%{transform:rotate(-15deg) scale(1.05)} 30%{transform:rotate(15deg) scale(1.05)} 60%{transform:rotate(-10deg) scale(1.02)} 100%{transform:rotate(0) scale(1)} }
    .float-robot-idle    { animation: float-idle 3s ease-in-out infinite; }
    .float-robot-smile   { animation: float-smile 0.6s ease-in-out 3; }
    .float-robot-think   { animation: float-think 1.2s ease-in-out infinite; }
    .float-robot-celebrate { animation: float-celebrate 0.7s ease-in-out 3; }
    .float-robot-dance   { animation: float-dance 0.9s ease-in-out forwards; }
  `;
  document.head.appendChild(style);
}

export default function FloatingAssistant() {
  ensureFloatingStyles();

  const { robotState } = useAppStore();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const navigate = useNavigate();

  const animClass = `float-robot-${robotState}`;

  const hints: Record<string, string> = {
    idle: "Ask me anything! 🤖",
    smile: "Hi! I am AI Nanban! 😊",
    thinking: "Hmm, let me think… 🤔",
    celebration: "Amazing work! 🎉",
    dance: "Let's dance! 🕺",
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      className="fixed bottom-6 right-6 z-50 touch-none"
      data-ocid="floating_assistant.button"
    >
      <AnimatePresence>
        {tooltipVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className="absolute bottom-20 right-0 mb-1 w-52 rounded-xl border border-white/10 bg-card/95 p-3 shadow-glow backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => setTooltipVisible(false)}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close tooltip"
            >
              <X size={12} />
            </button>
            <div className="flex items-start gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  AI THOZHANX – Ungal AI Nanban
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {hints[robotState] ?? "Ask me anything!"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing glow ring */}
      <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-cyan-500/40 blur-md" />

      {/* Robot avatar button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => navigate({ to: "/chat" })}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 shadow-glow transition-smooth overflow-hidden"
        aria-label="Open AI Assistant"
      >
        {/* Robot image with state animation */}
        <div className={`w-12 h-12 ${animClass}`}>
          <img
            src="/assets/images/robot-new.png"
            alt="AI Nanban"
            width={48}
            height={48}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* State indicator dot */}
        <span
          className={`absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
            robotState === "celebration"
              ? "bg-emerald-400"
              : robotState === "thinking"
                ? "bg-yellow-400 animate-pulse"
                : "bg-blue-400"
          }`}
        />
      </motion.button>
    </motion.div>
  );
}
