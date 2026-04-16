export type ModuleType =
  | "home"
  | "chat"
  | "image"
  | "video"
  | "website"
  | "document"
  | "ppt"
  | "pdf"
  | "abstract"
  | "project";

export type RobotState =
  | "idle"
  | "smile"
  | "thinking"
  | "celebration"
  | "dance";

export interface Module {
  type: ModuleType;
  name: string;
  icon: string;
  path: string;
  description: string;
  color: string;
}

export interface Generation {
  id: string;
  moduleType: ModuleType;
  prompt: string;
  output: string;
  timestamp: number;
}

export interface Slide {
  title: string;
  subtitle?: string;
  bullets: string[];
  type: "title" | "hook" | "concept" | "visual" | "summary";
  notes?: string;
}

export interface VideoScene {
  id: number;
  title: string;
  description: string;
  duration: number;
}

export interface VideoScript {
  title: string;
  scenes: VideoScene[];
  narration: string;
  duration: number;
}

export interface WebsiteCode {
  html: string;
  css: string;
  js: string;
  preview: string;
}

export interface PDFSection {
  heading: string;
  content: string;
  type: "cover" | "abstract" | "intro" | "section" | "highlight" | "conclusion";
}

export interface PDFDocument {
  title: string;
  author: string;
  sections: PDFSection[];
}

export interface AbstractDocument {
  title: string;
  abstract: string;
  introduction: string;
  literatureReview: string;
  methodology: string;
  results: string;
  conclusion: string;
  keywords: string[];
  department: string;
}

export interface ProjectFile {
  filename: string;
  language: string;
  code: string;
}

export interface ProjectDocument {
  title: string;
  department: string;
  abstract: string;
  problemStatement: string;
  objectives: string[];
  overview: string;
  technologies: string[];
  implementation: string;
  sourceFiles: ProjectFile[];
  diagrams: string[];
  documentation: string;
}
