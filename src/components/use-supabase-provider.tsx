import {
  createContextId,
  implicit$FirstArg,
  noSerialize,
  NoSerialize,
  QRL,
  Tracker,
  useContext,
  useContextProvider,
  useResource$,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  createBrowserClient,
  createServerClient,
} from "./supabase/supabase-auth-helpers-qwik";

type SupabaseContext = {
  client?: NoSerialize<SupabaseClient>;
};

export const SupabaseContext = createContextId<SupabaseContext>("supabase");
export default () => {
  const store = useStore<SupabaseContext>({});
  useContextProvider(SupabaseContext, store);
  useVisibleTask$(
    () => {
      console.log("create...");
      const client = createBrowserClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      );
      store.client = noSerialize(client);
    },
    {
      strategy: "document-ready",
    },
  );

  return store;
};

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
