import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import Sidebar from "~/components/sidebar";
import useThemeProvider from "~/components/use-theme-provider";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  useThemeProvider();

  return (
    <div class="min-h-screen bg-neutral-100 dark:bg-black dark:text-white">
      <div class="flex items-start">
        <Sidebar />
        <Slot />
      </div>
    </div>
  );
});
