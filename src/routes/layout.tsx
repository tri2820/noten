import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import Sidebar from "~/components/sidebar";
import useSupabaseProvider from "~/components/use-supabase-provider";
import UseUiProvider, { UIContext } from "~/components/use-ui-provider";
import useUiProvider from "~/components/use-ui-provider";

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

export const useUI = routeLoader$<UIContext>(({ sharedMap, cookie }) => {
  const ui: UIContext | undefined = cookie.get("ui")?.json();
  if (!ui)
    return {
      theme: "light",
      sidebar_close: false,
      sidebar_mode: "library",
    };

  return ui;
});

export default component$(() => {
  const ui = useUI();
  useUiProvider(ui.value);
  useSupabaseProvider();
  return (
    <div class="min-h-screen bg-neutral-100 dark:bg-neutral-950 dark:text-white">
      <div class="flex items-start">
        <Sidebar />
        <Slot />
      </div>
    </div>
  );
});
