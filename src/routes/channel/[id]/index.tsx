import { component$, Resource, useResource$ } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import TopBar from "~/components/top-bar";
import useSupabaseProvider from "~/components/use-supabase-provider";

export default component$(() => {
  const loc = useLocation();

  const supabase = useSupabaseProvider();
  const channelResource = useResource$(async ({ track, cleanup }) => {
    track(() => supabase.client);
    track(() => loc.params.id);

    if (!supabase.client) return null;

    const controller = new AbortController();
    cleanup(() => {
      controller.abort();
    });

    return await supabase
      .client!.from("channel")
      .select()
      .eq("id", loc.params.id)
      .abortSignal(controller.signal)
      .single();
  });

  return (
    <div class="flex-1  ">
      <Resource
        value={channelResource}
        onPending={() => <div>Loading...</div>}
        onRejected={(reason) => <div>Error: {JSON.stringify(reason)}</div>}
        onResolved={(res) => {
          if (!res) return <></>;
          if (res.error) return <div>Error: {res.error.message}</div>;
          const channel = res.data;
          return (
            <div
              data-ctype={channel.type}
              class="flex h-screen flex-col overflow-hidden  data-[ctype=text]:bg-white data-[ctype=voice]:bg-neutral-200 data-[ctype=text]:dark:bg-neutral-900 data-[ctype=voice]:dark:bg-black"
            >
              <TopBar />
              <div class="flex-1 p-4">
                {loc.params.id}

                <div class="">{JSON.stringify(channel)}</div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Noten - Note App for Filen",
  meta: [
    {
      name: "description",
      content: "The note app Filen users deserve.",
    },
  ],
};
