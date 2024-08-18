import { component$, NoSerialize, noSerialize, Slot } from "@builder.io/qwik";
import {
  RequestEvent,
  routeLoader$,
  useLocation,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { SupabaseClient } from "@supabase/supabase-js";
import Sidebar from "~/components/sidebar";
import {
  createBrowserClient,
  createServerClient,
} from "~/components/supabase/supabase-auth-helpers-qwik";
import useDataProvider from "~/components/use-data-provider";
import useSupabaseProvider from "~/components/use-supabase-provider";
import useUiProvider, { UIContext } from "~/components/use-ui-provider";

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
  console.log("logged_in", logged_in);
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
  const loc = useLocation();
  const ui = useUI();
  useUiProvider(ui.value);
  useSupabaseProvider();
  useDataProvider();

  if (loc.url.pathname === "/login/") return <Slot />;

  return (
    <div class="min-h-screen bg-neutral-100 dark:bg-neutral-950 dark:text-white">
      <div class="flex items-start">
        <Sidebar />
        <Slot />
      </div>
    </div>
  );
});
