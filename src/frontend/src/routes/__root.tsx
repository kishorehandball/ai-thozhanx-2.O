import { Outlet, createRootRoute } from "@tanstack/react-router";
import FloatingAssistant from "../components/FloatingAssistant";
import Layout from "../components/Layout";

export const Route = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <FloatingAssistant />
    </>
  ),
});

export default Route.options.component as React.ComponentType;
