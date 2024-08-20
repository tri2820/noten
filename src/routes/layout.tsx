import { component$, Slot } from "@builder.io/qwik";
import {
  RequestEvent,
  routeLoader$,
  useLocation,
  type RequestHandler,
} from "@builder.io/qwik-city";
import DataProvider from "~/components/local-data-provider";
import Sidebar from "~/components/sidebar";
import StreamingProvider from "~/components/streaming-provider";
import { SupabaseProvider } from "~/components/supabase-provider";
import { createServerClient } from "~/components/supabase/supabase-auth-helpers-qwik";
import UiProvider, { UIContext } from "~/components/ui-provider";

async function isLoggedIn(ev: RequestEvent) {
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    ev,
  );
  const user = await supabase.auth.getUser();

  return user.data.user ? true : false;
}

export const onRequest: RequestHandler = async (ev) => {
  const logged_in = await isLoggedIn(ev);
  if (!logged_in && ev.url.pathname !== "/login/") {
    throw ev.redirect(308, "/login/");
  }

  if (logged_in && ev.url.pathname === "/login/") {
    throw ev.redirect(308, "/");
  }
};

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

export const useUICookie = routeLoader$<UIContext>(({ sharedMap, cookie }) => {
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
  const ui = useUICookie();
  const loc = useLocation();

  return (
    <div class="min-h-screen bg-neutral-100 dark:bg-neutral-950 dark:text-white">
      <DataProvider>
        <UiProvider ui={ui.value}>
          <SupabaseProvider>
            <StreamingProvider>
              {loc.url.pathname === "/login/" ? (
                <Slot />
              ) : (
                <div class="flex items-start">
                  <Sidebar />
                  <Slot />
                </div>
              )}
            </StreamingProvider>
          </SupabaseProvider>
        </UiProvider>
      </DataProvider>
    </div>
  );
});
