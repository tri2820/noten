import {
  $,
  component$,
  Resource,
  Signal,
  useComputed$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { BsSendFill } from "@qwikest/icons/bootstrap";
import { LuSend } from "@qwikest/icons/lucide";
import { stringify } from "querystring";
import { Channel } from "~/components/chat-sidebar";
import ExampleAvatar from "~/components/example-avatar.txt?raw";
import TopBar from "~/components/top-bar";
import { DataContext } from "~/components/use-data-provider";
import {
  SupabaseContext,
  useSupabaseResource$,
  useSupabaseResourceQrl,
} from "~/components/use-supabase-provider";
import { dateF } from "~/utils";

const MessagePending = component$(() => {
  return (
    <div class="animate-pulse">
      <div class="flex cursor-pointer items-center space-x-4 px-8 py-4 hover:bg-neutral-100 hover:dark:bg-neutral-800">
        <div class="h-12 w-12 flex-none rounded-lg border bg-neutral-300 dark:bg-neutral-600" />
        <div class="flex-1 space-y-1">
          <div class="flex items-center space-x-2 font-semibold">
            <div class="h-[1rem] w-16 flex-none rounded-full bg-neutral-300 dark:bg-neutral-600" />
            <div class="ml-2 h-[1rem] w-8 rounded-full bg-neutral-300 text-xs font-normal text-neutral-500 dark:bg-neutral-600 dark:text-neutral-400" />
          </div>

          <div class="h-[1rem] w-full rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
          <div class="h-[1rem] w-1/2 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
        </div>
      </div>
      <div class="flex cursor-pointer items-center space-x-4 px-8 py-4 hover:bg-neutral-100 hover:dark:bg-neutral-800">
        <div class="h-12 w-12 flex-none rounded-lg border bg-neutral-300 dark:bg-neutral-600" />
        <div class="flex-1 space-y-1">
          <div class="flex items-center space-x-2 font-semibold">
            <div class="h-[1rem] w-16 flex-none rounded-full bg-neutral-300 dark:bg-neutral-600" />
            <div class="ml-2 h-[1rem] w-8 rounded-full bg-neutral-300 text-xs font-normal text-neutral-500 dark:bg-neutral-600 dark:text-neutral-400" />
          </div>

          <div class="h-[1rem] w-full rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
          <div class="h-[1rem] w-1/2 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
        </div>
      </div>
      <div class="flex cursor-pointer items-center space-x-4 px-8 py-4 hover:bg-neutral-100 hover:dark:bg-neutral-800">
        <div class="h-12 w-12 flex-none rounded-lg border bg-neutral-300 dark:bg-neutral-600" />
        <div class="flex-1 space-y-1">
          <div class="flex items-center space-x-2 font-semibold">
            <div class="h-[1rem] w-16 flex-none rounded-full bg-neutral-300 dark:bg-neutral-600" />
            <div class="ml-2 h-[1rem] w-8 rounded-full bg-neutral-300 text-xs font-normal text-neutral-500 dark:bg-neutral-600 dark:text-neutral-400" />
          </div>

          <div class="h-[1rem] w-full rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
          <div class="h-[1rem] w-1/2 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
        </div>
      </div>
    </div>
  );
});

const TextChannelView = component$(
  (_: { channel: Signal<Channel | undefined> }) => {
    const messageResource = useSupabaseResource$(
      async ({ track, cleanup, client }) => {
        track(_.channel);

        const controller = new AbortController();
        cleanup(() => {
          controller.abort();
        });

        if (_.channel.value?.type !== "text") return;

        return await client
          .from("message")
          .select()
          .eq("thread_id", _.channel.value.id)
          .abortSignal(controller.signal);
      },
    );
    const text = useSignal("");
    const submit = $(() => {});
    return (
      <>
        <div class="flex-1 overflow-y-auto pb-4">
          <Resource
            value={messageResource}
            onPending={() => <MessagePending />}
            onRejected={(reason) => (
              <div class="px-8 py-4 text-sm text-neutral-500">
                Error: {reason.message}
              </div>
            )}
            onResolved={(res) => {
              if (!res) return <div></div>;
              if (res.error)
                return (
                  <div class="px-8 py-4 text-sm text-neutral-500">
                    Error: {res.error.message}
                  </div>
                );
              if (res.data.length == 0)
                return (
                  <div class="px-8 py-4 text-sm text-neutral-500">
                    No messages
                  </div>
                );
              return (
                <div>
                  {res.data.map((message) => (
                    <div
                      key={message.id}
                      class="flex cursor-pointer items-center space-x-4 px-8 py-4 hover:bg-neutral-100 hover:dark:bg-neutral-800"
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
        </div>

        <div class="flex-none space-y-2 px-4 pb-4">
          <div class=" flex  items-start rounded-lg border  bg-neutral-100 dark:bg-neutral-800 ">
            <textarea
              bind:value={text}
              onKeyDown$={(ev: KeyboardEvent) => {
                if (ev.ctrlKey && ev.key === "Enter") {
                  submit();
                }
              }}
              class="h-full flex-1 resize-none bg-transparent p-4 focus:outline-none"
            />
            <button
              onClick$={submit}
              class="text-hover m-4 rounded-lg p-2 hover:bg-neutral-300 hover:dark:bg-neutral-700"
            >
              <BsSendFill class="h-4 w-4" />
            </button>
          </div>

          <div class="text-xs text-neutral-500">Ctrl + Enter to send</div>
        </div>
      </>
    );
  },
);

export default component$(() => {
  const loc = useLocation();
  const data = useContext(DataContext);
  const channel = useComputed$(() =>
    data.channels.find((x) => x.id == loc.params.id),
  );

  // Update channel data
  // Here we assume the user can only access the channel by clicking the item on the sidebar, so the channel data is already there
  // const channelResource = useSupabaseResource$(
  //   async ({ track, cleanup, client }) => {
  //     track(() => loc.params.id);

  //     const controller = new AbortController();
  //     cleanup(() => {
  //       controller.abort();
  //     });
  //     return await client
  //       .from("channel")
  //       .select()
  //       .eq("id", loc.params.id)
  //       .abortSignal(controller.signal)
  //       .single();
  //   },
  // );

  if (!channel.value) return <div>...</div>;

  return (
    <div
      data-ctype={channel.value.type}
      class="flex h-screen flex-1 flex-col overflow-hidden  data-[ctype=text]:bg-white data-[ctype=voice]:bg-neutral-200 data-[ctype=text]:dark:bg-neutral-900 data-[ctype=voice]:dark:bg-black"
    >
      <TopBar name={channel.value.name} />

      {channel.value.type == "text" ? (
        <TextChannelView channel={channel} />
      ) : (
        <></>
      )}
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
