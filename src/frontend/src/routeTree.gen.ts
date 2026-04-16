// This file is manually maintained to match the route structure.
// TanStack Router v1 compatible route tree.

import { createRoute, createRouter } from "@tanstack/react-router";
import { Route as RootRoute } from "./routes/__root";
import AbstractPage from "./routes/abstract";
import ChatPage from "./routes/chat";
import DocumentGeneratorPage from "./routes/document";
import ImagePage from "./routes/image";
import IndexPage from "./routes/index";
import PdfPage from "./routes/pdf";
import PPTGeneratorPage from "./routes/ppt";
import ProjectPage from "./routes/project";
import PromptsPage from "./routes/prompts";
import VideoGeneratorPage from "./routes/video";
import WebsitePage from "./routes/website";

const indexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: IndexPage,
});
const chatRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/chat",
  component: ChatPage,
});
const imageRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/image",
  component: ImagePage,
});
const videoRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/video",
  component: VideoGeneratorPage,
});
const websiteRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/website",
  component: WebsitePage,
});
const documentRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/document",
  component: DocumentGeneratorPage,
});
const pptRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/ppt",
  component: PPTGeneratorPage,
});
const pdfRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/pdf",
  component: PdfPage,
});
const abstractRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/abstract",
  component: AbstractPage,
});
const projectRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/project",
  component: ProjectPage,
});
const promptsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/prompts",
  component: PromptsPage,
});

export const routeTree = RootRoute.addChildren([
  indexRoute,
  chatRoute,
  imageRoute,
  videoRoute,
  websiteRoute,
  documentRoute,
  pptRoute,
  pdfRoute,
  abstractRoute,
  projectRoute,
  promptsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
