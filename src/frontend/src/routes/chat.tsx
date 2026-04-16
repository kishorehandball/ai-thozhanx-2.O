import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { generateChatResponse } from "@/lib/mockAI";
import { cn, copyToClipboard, generateId } from "@/lib/utils";
import { PAGE_HINTS, useAppStore } from "@/stores/appStore";
import {
  Bot,
  CheckCheck,
  ChevronRight,
  Clock,
  Copy,
  MessageSquare,
  PanelLeft,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  messages: Message[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "ai",
  content:
    "Hello! I'm your **AI THOZHANX Assistant** 🎓\n\nI can help with academics, research, coding, and creative projects. Ask me anything — from writing abstracts to explaining algorithms!\n\nWhat would you like to explore today?",
  timestamp: Date.now(),
};

const SUGGESTIONS = [
  { icon: "📝", text: "Help me write an abstract for my AI project" },
  { icon: "🤖", text: "Explain machine learning algorithms for beginners" },
  { icon: "🏗️", text: "Write an introduction for my civil engineering report" },
  { icon: "💻", text: "Generate Python code for a student attendance system" },
  { icon: "🏠", text: "Summarize the IoT smart home project concept" },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "hist-1",
    title: "Machine Learning Basics",
    preview: "Explained supervised vs unsupervised learning...",
    timestamp: Date.now() - 3600000,
    messages: [],
  },
  {
    id: "hist-2",
    title: "Python Attendance System",
    preview: "Generated complete attendance tracking code...",
    timestamp: Date.now() - 86400000,
    messages: [],
  },
  {
    id: "hist-3",
    title: "Civil Engineering Report",
    preview: "Wrote introduction for structural analysis...",
    timestamp: Date.now() - 172800000,
    messages: [],
  },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {(["a", "b", "c"] as const).map((key, i) => (
        <span
          key={key}
          className="h-2 w-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lines.map((line, lineIdx) => {
        if (line.startsWith("```")) return null;
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: static line content
          <p key={`${lineIdx}-${line.slice(0, 20)}`} className="break-words">
            {parts.map((part, partIdx) => {
              const pk = `${lineIdx}-${partIdx}`;
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={pk} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (
                part.startsWith("`") &&
                part.endsWith("`") &&
                part.length > 2
              ) {
                return (
                  <code
                    key={pk}
                    className="rounded bg-primary/10 px-1 py-0.5 font-mono text-xs text-primary"
                  >
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return <span key={pk}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

function ConversationItem({
  conv,
  isActive,
  onClick,
  onDelete,
}: {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}) {
  const timeLabel = (() => {
    const diff = Date.now() - conv.timestamp;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  })();

  return (
    <button
      type="button"
      data-ocid="chat.history.item"
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-1 rounded-xl p-3 transition-smooth text-left",
        isActive
          ? "bg-primary/15 border border-primary/30"
          : "hover:bg-white/5 border border-transparent",
      )}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-xs font-medium text-foreground leading-tight">
          {conv.title}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conv.id);
          }}
          data-ocid="chat.history.delete_button"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground hover:text-destructive"
          aria-label="Delete conversation"
        >
          <X size={10} />
        </button>
      </div>
      <p className="truncate text-[10px] text-muted-foreground">
        {conv.preview}
      </p>
      <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
        <Clock size={8} />
        {timeLabel}
      </div>
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { addToHistory, setRobotState, setCurrentPageHint } = useAppStore();

  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [conversations, setConversations] = useState<Conversation[]>(
    INITIAL_CONVERSATIONS,
  );
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 1000;

  // Set page hint on mount
  useEffect(() => {
    setCurrentPageHint(PAGE_HINTS["/chat"]);
    setRobotState("idle");
  }, [setCurrentPageHint, setRobotState]);

  // Scroll to bottom on new messages or loading state
  const msgCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount, loading]);

  // Auto-resize textarea
  // biome-ignore lint/correctness/useExhaustiveDependencies: resize on input change
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  const sendMessage = async (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt || loading) return;
    setInput("");

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setRobotState("thinking");

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));

    const response = generateChatResponse(prompt);
    const aiMsg: Message = {
      id: generateId(),
      role: "ai",
      content: response,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);

    // Robot celebration on response
    setRobotState("celebration");
    setTimeout(() => setRobotState("idle"), 2000);

    // Save to history store
    addToHistory({
      moduleType: "chat",
      prompt: prompt.slice(0, 60),
      output: response,
    });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = (content: string, id: string) => {
    copyToClipboard(content).then(() => {
      toast.success("Copied to clipboard!");
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const copyLastAI = () => {
    const last = [...messages].reverse().find((m) => m.role === "ai");
    if (last) handleCopy(last.content, `last-${last.id}`);
  };

  const clearChat = () => {
    const userMsgs = messages.filter((m) => m.role === "user");
    if (userMsgs.length > 0) {
      const conv: Conversation = {
        id: generateId(),
        title: userMsgs[0].content.slice(0, 45),
        preview: `${userMsgs[userMsgs.length - 1].content.slice(0, 60)}...`,
        timestamp: Date.now(),
        messages: [...messages],
      };
      setConversations((prev) => [conv, ...prev.slice(0, 19)]);
    }
    setMessages([WELCOME_MSG]);
    setActiveConvId(null);
    toast.info("Chat cleared");
  };

  const loadConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    toast.info(`Viewing: ${conv.title}`);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) setActiveConvId(null);
    toast.success("Conversation deleted");
  };

  const isOverLimit = input.length > MAX_CHARS;
  const isEmpty = messages.length <= 1;
  const lastAIMsg = [...messages].reverse().find((m) => m.role === "ai");

  return (
    <div className="flex h-full overflow-hidden" data-ocid="chat.page">
      {/* ── LEFT: History Panel ── */}
      <AnimatePresence initial={false}>
        {historyOpen && (
          <motion.aside
            key="history"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="hidden md:flex flex-col shrink-0 border-r border-white/8 bg-card/50 backdrop-blur-sm overflow-hidden"
            data-ocid="chat.history.panel"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock size={12} className="text-primary" />
                History
              </span>
              <button
                type="button"
                onClick={() => setConversations([])}
                data-ocid="chat.history.clear_button"
                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Clear all history"
              >
                Clear all
              </button>
            </div>

            <div className="px-3 py-2.5">
              <button
                type="button"
                onClick={clearChat}
                data-ocid="chat.history.new_button"
                className="w-full flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-smooth"
              >
                <MessageSquare size={12} />
                New Conversation
                <ChevronRight size={10} className="ml-auto" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 px-3 pb-4">
                {conversations.length === 0 ? (
                  <div
                    className="flex flex-col items-center gap-2 py-8 text-center"
                    data-ocid="chat.history.empty_state"
                  >
                    <MessageSquare
                      size={24}
                      className="text-muted-foreground/40"
                    />
                    <p className="text-[11px] text-muted-foreground/60">
                      No conversations yet
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={activeConvId === conv.id}
                      onClick={() => loadConversation(conv)}
                      onDelete={deleteConversation}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── RIGHT: Chat Panel ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 bg-card/60 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              data-ocid="chat.history.toggle"
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/8 hover:text-foreground transition-smooth"
              aria-label="Toggle history panel"
            >
              <PanelLeft size={14} />
            </button>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 shadow-glow-purple">
              <MessageSquare size={15} className="text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">
                AI Chat Assistant
              </h1>
              <p className="gradient-text text-[11px] font-medium truncate">
                Academic + Creative AI Support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>

            {lastAIMsg && lastAIMsg.id !== "welcome" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyLastAI}
                data-ocid="chat.copy_last_button"
                className="hidden sm:flex text-muted-foreground hover:text-foreground text-xs h-7 px-2"
                aria-label="Copy last AI response"
              >
                <Copy size={12} className="mr-1" />
                Copy last
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              data-ocid="chat.clear_button"
              className="text-muted-foreground hover:text-destructive h-7 px-2"
              aria-label="Clear chat"
            >
              <Trash2 size={12} className="mr-1" />
              <span className="hidden sm:inline text-xs">Clear</span>
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl space-y-5 px-4 py-5">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                  data-ocid={`chat.message.item.${idx + 1}`}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-md",
                      msg.role === "ai"
                        ? "bg-gradient-to-br from-purple-500 to-blue-500"
                        : "bg-gradient-to-br from-blue-500 to-cyan-400",
                    )}
                  >
                    {msg.role === "ai" ? (
                      <Bot size={14} />
                    ) : (
                      <span className="text-[10px] font-bold">You</span>
                    )}
                  </div>

                  <div
                    className={cn(
                      "group flex max-w-[80%] flex-col gap-1",
                      msg.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm",
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-primary/20 text-foreground"
                          : "glassmorphism text-foreground",
                      )}
                    >
                      <MessageContent content={msg.content} />
                    </div>

                    <div className="flex items-center gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                      <span className="text-[10px] text-muted-foreground/60">
                        {new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground hover:bg-white/5"
                        aria-label="Copy message"
                        data-ocid="chat.copy_button"
                      >
                        {copiedId === msg.id ? (
                          <CheckCheck size={10} className="text-emerald-400" />
                        ) : (
                          <Copy size={10} />
                        )}
                        {copiedId === msg.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex gap-3"
                  data-ocid="chat.loading_state"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-md text-white">
                    <Bot size={14} />
                  </div>
                  <div className="glassmorphism flex items-center rounded-2xl px-4 py-3">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Suggestions strip */}
        <AnimatePresence>
          {isEmpty && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="shrink-0 border-t border-white/5 bg-background/40 px-4 py-3"
            >
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Sparkles size={11} className="text-primary" />
                Try asking:
              </p>
              <div
                className="flex flex-wrap gap-2"
                data-ocid="chat.suggestions.list"
              >
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={s.text}
                    type="button"
                    onClick={() => sendMessage(s.text)}
                    data-ocid={`chat.suggestion.item.${i + 1}`}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-smooth hover:border-primary/40 hover:bg-primary/10 hover:text-foreground hover:shadow-glow-blue"
                  >
                    <span>{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="shrink-0 border-t border-white/8 bg-card/60 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-background/50 p-2 backdrop-blur-sm focus-within:border-primary/40 transition-smooth">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything academic… (Enter to send, Shift+Enter for newline)"
                rows={1}
                maxLength={MAX_CHARS + 50}
                className="flex-1 resize-none border-0 bg-transparent p-1 text-sm placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[36px]"
                data-ocid="chat.input"
                aria-label="Chat message input"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading || isOverLimit}
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-glow-purple disabled:opacity-40 disabled:shadow-none transition-smooth hover:shadow-glow-blue"
                data-ocid="chat.send.submit_button"
                aria-label="Send message"
              >
                {loading ? (
                  <RotateCcw size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </Button>
            </div>

            <div className="mt-1.5 flex items-center justify-between px-1">
              <p className="text-[10px] text-muted-foreground/50">
                Enter to send · Shift+Enter for newline
              </p>
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  isOverLimit
                    ? "text-destructive"
                    : input.length > MAX_CHARS * 0.8
                      ? "text-yellow-400"
                      : "text-muted-foreground/40",
                )}
              >
                {input.length}/{MAX_CHARS}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
