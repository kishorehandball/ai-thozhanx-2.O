import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Generation, ModuleType, RobotState } from "../types";

export const PAGE_HINTS: Record<string, string> = {
  "/": "Welcome! What shall we create today? 🚀",
  "/chat": "Let's have a smart chat! 💬",
  "/image": "Let me paint your imagination! 🎨",
  "/video": "Lights, camera, action! 🎬",
  "/website": "Building your website now! 🌐",
  "/document": "Writing your masterpiece! 📄",
  "/ppt": "Let's build your PPT! 📊",
  "/pdf": "Crafting your PDF! 📘",
  "/abstract": "Research made easy! 🏆",
  "/project": "Project Builder is ready! 🧠",
  "/prompts": "Generating perfect prompts! ✨",
};

interface RobotPosition {
  x: number;
  y: number;
}

interface AppState {
  theme: "dark" | "light";
  sidebarOpen: boolean;
  currentModule: ModuleType | "home";
  generationHistory: Generation[];
  robotState: RobotState;
  currentPageHint: string;
  robotPosition: RobotPosition;

  setTheme: (theme: "dark" | "light") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentModule: (module: ModuleType | "home") => void;
  addToHistory: (item: Omit<Generation, "id" | "timestamp">) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  setRobotState: (state: RobotState) => void;
  setCurrentPageHint: (hint: string) => void;
  setRobotPosition: (pos: RobotPosition) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      sidebarOpen: false,
      currentModule: "home",
      generationHistory: [],
      robotState: "idle",
      currentPageHint: PAGE_HINTS["/"],
      robotPosition: { x: 0, y: 0 },

      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setCurrentModule: (module) => set({ currentModule: module }),

      addToHistory: (item) =>
        set((state) => ({
          generationHistory: [
            {
              ...item,
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              timestamp: Date.now(),
            },
            ...state.generationHistory.slice(0, 49),
          ],
        })),

      clearHistory: () => set({ generationHistory: [] }),

      removeFromHistory: (id) =>
        set((state) => ({
          generationHistory: state.generationHistory.filter((g) => g.id !== id),
        })),

      setRobotState: (robotState) => set({ robotState }),

      setCurrentPageHint: (currentPageHint) => set({ currentPageHint }),

      setRobotPosition: (robotPosition) => set({ robotPosition }),
    }),
    {
      name: "thozhanx-app-store",
      partialize: (state) => ({
        theme: state.theme,
        generationHistory: state.generationHistory,
        robotPosition: state.robotPosition,
      }),
    },
  ),
);
