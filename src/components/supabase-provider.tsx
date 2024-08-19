import {
  $,
  component$,
  createContextId,
  implicit$FirstArg,
  noSerialize,
  NoSerialize,
  QRL,
  Signal,
  Slot,
  Tracker,
  useContext,
  useContextProvider,
  useResource$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { SupabaseClient, User } from "@supabase/supabase-js";
import {
  createBrowserClient,
  createServerClient,
} from "./supabase/supabase-auth-helpers-qwik";
import { DataContext } from "./data-provider";
import { profile } from "console";

type SupabaseContext = {
  client?: NoSerialize<SupabaseClient>;
  user?: NoSerialize<User>;
  profile?: { [key: string]: any };
};

export const SupabaseContext = createContextId<SupabaseContext>("supabase");
export const SupabaseProvider = component$(() => {
  const data = useContext(DataContext);
  const store = useStore<SupabaseContext>({});
  useContextProvider(SupabaseContext, store);

  useVisibleTask$(
    () => {
      console.log("creating...");
      const client = createBrowserClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      );
      store.client = noSerialize(client);
      client.auth.onAuthStateChange(async (ev, session) => {
        console.log("onAuth", ev, session);
        const user = session?.user;

        if (
          ev === "INITIAL_SESSION" ||
          ev === "TOKEN_REFRESHED" ||
          ev === "USER_UPDATED"
        ) {
          store.user = noSerialize(user);
          (async () => {
            if (!user) {
              console.log("no user");
              store.profile = undefined;
              return;
            }

            console.log("get profile...", user);
            const _select = await client
              .from("profile")
              .select()
              .eq("id", user.id)
              .single();
            store.profile = _select.data;
            console.log("got profile", _select.data);
            if (!_select.data) return;
            data.profile[_select.data.id] = _select.data;
          })();
        }
      });
    },
    {
      strategy: "document-ready",
    },
  );

  return <Slot />;
});

export function useSupabaseResourceQrl<T>(
  f: QRL<
    (_: {
      client: SupabaseClient;
      track: Tracker;
      cleanup: (callback: () => void) => void;
    }) => T
  >,
) {
  const supabase = useContext(SupabaseContext);
  const resource = useResource$(({ track, cleanup }) => {
    const client = track(() => supabase.client);
    if (!client) return;
    return f({ client, track, cleanup });
  });
  return resource;
}

export const useSupabaseResource$ = implicit$FirstArg(useSupabaseResourceQrl);
