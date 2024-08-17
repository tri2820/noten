import {
  component$,
  createContextId,
  noSerialize,
  NoSerialize,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContext = {
  client?: NoSerialize<SupabaseClient>;
};

export const SupabaseContext = createContextId<SupabaseContext>("supabase");
export default () => {
  const store = useStore<SupabaseContext>({});
  useContextProvider(SupabaseContext, store);
  useVisibleTask$(
    () => {
      const client = new SupabaseClient(
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
