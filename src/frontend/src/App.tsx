import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routeTree.gen";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      storageKey="thozhanx-theme"
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
