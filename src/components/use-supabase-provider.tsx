import {
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

export function useSupabaseRealtime<T extends { id: string }>(_: {
  filter: Signal<
    | {
        table: string;
        col: string;
        value: string;
      }
    | undefined
  >;
}) {
  const supabase = useContext(SupabaseContext);
  const loaded = useSignal<boolean>(false);
  const latest_inserted = useSignal<T>();
  const rows = useSignal<T[]>([]);
  useVisibleTask$(async ({ track, cleanup }) => {
    track(_.filter);
    const client = track(() => supabase.client);
    if (!client) return;
    if (!_.filter.value) return;

    const _select = await client
      .from(_.filter.value.table)
      .select()
      .eq(_.filter.value.col, _.filter.value.value);

    loaded.value = true;
    if (_select.error) {
      console.warn("error", _select.error);
      return;
    }

    rows.value = _select.data as T[];
    console.log("subscribe to", _.filter.value);
    client
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: _.filter.value.table,
          filter: `${_.filter.value.col}=eq.${_.filter.value.value}`,
        },
        (payload) => {
          console.log("received new for", _.filter.value);
          const m = payload.new as T;
          if (rows.value.some((n) => n.id == m.id)) return;
          rows.value = [...rows.value, m];

          latest_inserted.value = m;
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
