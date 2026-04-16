import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../stores/appStore";
import type { RobotState } from "../types";

/* ── CSS keyframes injected once ─────────────────────────────────────── */
const ROBOT_STYLES = `
@keyframes robot-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
@keyframes robot-dance {
  0%   { transform: rotate(0deg) scale(1); }
  15%  { transform: rotate(-15deg) scale(1.05); }
  30%  { transform: rotate(15deg) scale(1.05); }
  45%  { transform: rotate(-12deg) scale(1.03); }
  60%  { transform: rotate(12deg) scale(1.03); }
  75%  { transform: rotate(-8deg) scale(1.01); }
  90%  { transform: rotate(8deg) scale(1.01); }
  100% { transform: rotate(0deg) scale(1); }
}
@keyframes robot-celebrate {
  0%   { transform: translateY(0) scale(1); }
  25%  { transform: translateY(-16px) scale(1.08) rotate(5deg); }
  50%  { transform: translateY(-8px) scale(1.05) rotate(-5deg); }
  75%  { transform: translateY(-20px) scale(1.1) rotate(3deg); }
  100% { transform: translateY(0) scale(1) rotate(0); }
}
@keyframes robot-think {
  0%, 100% { transform: rotate(0deg); }
  30%      { transform: rotate(-8deg); }
  70%      { transform: rotate(8deg); }
}
@keyframes robot-smile-pulse {
  0%, 100% { transform: scale(1); filter: brightness(1) saturate(1); }
  50%      { transform: scale(1.06); filter: brightness(1.2) saturate(1.4); }
}
@keyframes bubble-in {
  0%   { opacity: 0; transform: translateY(6px) scale(0.92); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.robot-idle    { animation: robot-float 3s ease-in-out infinite; }
.robot-smile   { animation: robot-smile-pulse 0.5s ease-in-out 3; }
.robot-think   { animation: robot-think 1.2s ease-in-out infinite; }
.robot-celebrate { animation: robot-celebrate 0.6s ease-in-out 3; }
.robot-dance   { animation: robot-dance 0.8s ease-in-out forwards; }
.speech-bubble { animation: bubble-in 0.25s ease-out forwards; }
`;

/* ── constants ────────────────────────────────────────────────────────── */
const BUBBLE_MESSAGES: Record<RobotState, string> = {
  idle: "Hi! I am AI Nanban! Ready to help! 🤖",
  smile: "Hi! I am AI Nanban! 😊",
  thinking: "Hmm, let me think... 🤔",
  celebration: "Amazing! We did it! 🎉",
  dance: "Let's dance! 🕺",
};

const ANIMATION_CLASS: Record<RobotState, string> = {
  idle: "robot-idle",
  smile: "robot-smile",
  thinking: "robot-think",
  celebration: "robot-celebrate",
  dance: "robot-dance",
};

/* ── props ────────────────────────────────────────────────────────────── */
interface AIRobotProps {
  /** Size variant: 'dashboard' (200×300) or 'floating' (80×120) */
  size?: "dashboard" | "floating";
  /** Override external state; otherwise reads from appStore */
  stateOverride?: RobotState;
  /** Show speech bubble on click even in floating mode */
  showBubble?: boolean;
  /** Whether this robot instance is draggable */
  draggable?: boolean;
  className?: string;
}

/* ── inject styles once ───────────────────────────────────────────────── */
let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = ROBOT_STYLES;
  document.head.appendChild(style);
}

/* ── component ────────────────────────────────────────────────────────── */
export default function AIRobot({
  size = "dashboard",
  stateOverride,
  showBubble = true,
  draggable = false,
  className,
}: AIRobotProps) {
  ensureStyles();

  const { robotState, setRobotState, robotPosition, setRobotPosition } =
    useAppStore();

  const activeState: RobotState = stateOverride ?? robotState;
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragControls = useDragControls();

  const isDashboard = size === "dashboard";
  const imgW = isDashboard ? 200 : 80;
  const imgH = isDashboard ? 300 : 120;

  /* auto-show bubble when state changes */
  useEffect(() => {
    if (activeState !== "idle") {
      setBubbleText(BUBBLE_MESSAGES[activeState]);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => {
        setBubbleText(null);
        if (!stateOverride) setRobotState("idle");
      }, 3000);
    } else {
      setBubbleText(null);
    }
    return () => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, [activeState, stateOverride, setRobotState]);

  function triggerState(state: RobotState, message: string) {
    if (!stateOverride) setRobotState(state);
    if (showBubble) {
      setBubbleText(message);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => {
        setBubbleText(null);
        if (!stateOverride) setRobotState("idle");
      }, 3000);
    }
  }

  function handleFaceClick() {
    triggerState("smile", "Hi! I am AI Nanban! 😊");
  }

  function handleBodyClick() {
    triggerState("dance", "Let's dance! 🕺");
  }

  const containerClass = cn(
    "relative select-none",
    draggable && "cursor-grab active:cursor-grabbing",
    className,
  );

  const robotEl = (
    <div className={containerClass} style={{ width: imgW }}>
      {/* Speech bubble */}
      <AnimatePresence>
        {bubbleText && showBubble && (
          <motion.div
            key={bubbleText}
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-20 rounded-2xl border border-white/20 px-3 py-2 shadow-glow backdrop-blur-md",
              "bg-card/90 text-foreground",
              isDashboard
                ? "bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-52 text-sm"
                : "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-40 text-[11px]",
            )}
            data-ocid="robot.speech_bubble"
          >
            {/* Tail */}
            <span
              className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-card/90 border-r border-b border-white/20"
              aria-hidden="true"
            />
            <p className="relative z-10 text-center font-medium leading-snug">
              {bubbleText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot image + click zones */}
      <div
        className={cn("relative overflow-hidden", ANIMATION_CLASS[activeState])}
        style={{ width: imgW, height: imgH }}
      >
        {/* Glow halo */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-gradient-to-b from-cyan-400 via-purple-500 to-blue-600 pointer-events-none"
          style={{ transform: "scale(0.85)" }}
        />

        <img
          src="/assets/images/robot-new.png"
          alt="AI Nanban Robot"
          width={imgW}
          height={imgH}
          className="relative z-10 object-contain drop-shadow-lg"
          draggable={false}
        />

        {/* FACE zone — top 35% */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Touch robot face"
          data-ocid="robot.face_zone"
          onClick={handleFaceClick}
          onKeyDown={(e) => e.key === "Enter" && handleFaceClick()}
          className="absolute top-0 left-0 w-full cursor-pointer z-20"
          style={{ height: "35%" }}
        />

        {/* BODY zone — bottom 65% */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Touch robot body"
          data-ocid="robot.body_zone"
          onClick={handleBodyClick}
          onKeyDown={(e) => e.key === "Enter" && handleBodyClick()}
          className="absolute bottom-0 left-0 w-full cursor-pointer z-20"
          style={{ height: "65%" }}
        />
      </div>

      {/* State indicator dots (dashboard only) */}
      {isDashboard && (
        <div className="mt-2 flex justify-center gap-1.5">
          {(["idle", "smile", "thinking", "celebration"] as RobotState[]).map(
            (s) => (
              <button
                key={s}
                type="button"
                aria-label={`Set robot to ${s}`}
                data-ocid={`robot.state_${s}.button`}
                onClick={() => triggerState(s, BUBBLE_MESSAGES[s])}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-200",
                  activeState === s
                    ? "scale-125 bg-primary shadow-glow"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
                )}
              />
            ),
          )}
        </div>
      )}
    </div>
  );

  if (draggable) {
    return (
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        initial={{ x: robotPosition.x, y: robotPosition.y }}
        onDragEnd={(_, info) => {
          setRobotPosition({
            x: robotPosition.x + info.offset.x,
            y: robotPosition.y + info.offset.y,
          });
        }}
        className="touch-none"
        data-ocid="robot.draggable_container"
      >
        {robotEl}
      </motion.div>
    );
  }

  return robotEl;
}
