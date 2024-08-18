import {
  $,
  component$,
  createContextId,
  implicit$FirstArg,
  noSerialize,
  NoSerialize,
  QRL,
  Signal,
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
import { DataContext } from "./use-data-provider";

type SupabaseContext = {
  client?: NoSerialize<SupabaseClient>;
  user?: NoSerialize<User>;
  profile?: { [key: string]: any };
};

export const SupabaseContext = createContextId<SupabaseContext>("supabase");
export default () => {
  const store = useStore<SupabaseContext>({});
  useContextProvider(SupabaseContext, store);

  const getProfile = $(async (client: SupabaseClient, user: User) => {
    console.log("user.id", user.id);
    const _select = await client.from("profile").select();
    //   .eq("id", user.id)
    //   .single();
    // return _select.data;
    console.log("_select", _select);
    return undefined;
  });

  useVisibleTask$(async ({ track, cleanup }) => {
    const u = track(() => store.user);
    if (!u) {
      store.profile = undefined;
      return;
    }

    const _select = await store
      .client!.from("profile")
      .select()
      .eq("id", u.id)
      .single();

    store.profile = _select.data;
    cleanup(() => {
      store.profile = undefined;
    });
  });

  useVisibleTask$(
    () => {
      const client = createBrowserClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      );
      store.client = noSerialize(client);
      client.auth.onAuthStateChange(async (ev, session) => {
        console.log("onAuth", ev, session);
        const user = session?.user;
        if (user?.id !== store.user?.id) {
          store.user = noSerialize(user);
        }
      });
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

export function useSupabaseRealtime<T extends { id: string }>(
  props: Signal<{
    table: string;
    filter: string;
    load?: QRL<(client: SupabaseClient) => Promise<T[]>>;
    select?: string;
    modify_row?: QRL<(client: SupabaseClient, row: T) => Promise<T>>;
  }>,
) {
  const supabase = useContext(SupabaseContext);
  const loaded = useSignal<boolean>(false);
  const latest_inserted = useSignal<T>();
  const rows = useSignal<T[]>([]);
  useVisibleTask$(async ({ track, cleanup }) => {
    const _ = track(props);
    const client = track(() => supabase.client);
    if (!client) return;
    console.log("load...", _);
    rows.value = (await _.load?.(client)) ?? [];
    loaded.value = true;
    client
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: _.table,
          filter: _.filter,
        },
        async (payload) => {
          console.log("received new for", _);
          const m = payload.new as T;
          const row = _.modify_row ? await _.modify_row(client, m) : m;
          rows.value = [...rows.value, row];
          latest_inserted.value = row;
        },
      )
      // TODO: handle UPDATE, DELETE
      .subscribe();

    cleanup(() => {
      rows.value = [];
      loaded.value = false;
      // it seems that the handle is automatically cleaned somehow?
    });
  });

  return {
    rows,
    latest_inserted,
    loaded,
  };
}
