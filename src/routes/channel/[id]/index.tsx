import { $, component$, Resource, useContext } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import ExampleAvatar from "~/components/example-avatar.txt?raw";
import TopBar from "~/components/top-bar";
import {
  SupabaseContext,
  useSupabaseResource$,
  useSupabaseResourceQrl,
} from "~/components/use-supabase-provider";
import { dateF } from "~/utils";

const TextChannelView = component$((_: { channel: any }) => {
  const messageResource = useSupabaseResource$(
    async ({ track, cleanup, client }) => {
      const controller = new AbortController();
      cleanup(() => {
        controller.abort();
      });
      return await client
        .from("message")
        .select()
        .eq("thread_id", _.channel.id)
        .abortSignal(controller.signal);
    },
  );

  return (
    <Resource
      value={messageResource}
      onPending={() => <div>Loading...</div>}
      onRejected={(reason) => (
        <div>Error: {JSON.stringify(reason.message)}</div>
      )}
      onResolved={(res) => {
        if (!res) return;
        if (res.error) return <div>Error: {res.error.message}</div>;
        return (
          <div>
            {res.data.map((message) => (
              <div
                key={message.id}
                class="flex cursor-pointer items-center space-x-4 px-4 py-3 hover:bg-neutral-100 hover:dark:bg-neutral-800"
              >
                <img
                  src={ExampleAvatar}
                  class="h-12 w-12 flex-none rounded-lg border"
                />
                <div class="flex-1 space-y-1">
                  <div class="font-semibold">
                    Tri
                    <span class="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                      {dateF(message.created_at)}
                    </span>
                  </div>

                  <div class="">{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
});

export default component$(() => {
  const loc = useLocation();
  const channelResource = useSupabaseResource$(
    async ({ track, cleanup, client }) => {
      track(() => loc.params.id);

      const controller = new AbortController();
      cleanup(() => {
        controller.abort();
      });
      return await client
        .from("channel")
        .select()
        .eq("id", loc.params.id)
        .abortSignal(controller.signal)
        .single();
    },
  );

  return (
    <div class="flex-1  ">
      <Resource
        value={channelResource}
        onPending={() => <div>Loading...</div>}
        onRejected={(reason) => (
          <div>Error: {JSON.stringify(reason.message)}</div>
        )}
        onResolved={(res) => {
          if (!res) return <></>;
          if (res.error) return <div>Error: {res.error.message}</div>;
          const channel = res.data;
          return (
            <div
              data-ctype={channel.type}
              class="flex h-screen flex-col overflow-hidden  data-[ctype=text]:bg-white data-[ctype=voice]:bg-neutral-200 data-[ctype=text]:dark:bg-neutral-900 data-[ctype=voice]:dark:bg-black"
            >
              <TopBar name={channel.name} />
              <div class="flex-1">
                <TextChannelView channel={channel} />
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
