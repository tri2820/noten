import {
  $,
  component$,
  Resource,
  Signal,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
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
  useSupabaseRealtime,
  useSupabaseResource$,
  useSupabaseResourceQrl,
} from "~/components/use-supabase-provider";
import { dateF } from "~/utils";

const MessageLoading = component$(() => {
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
    const filter = useComputed$(() =>
      _.channel.value?.id
        ? {
            table: "message",
            col: "thread_id",
            value: _.channel.value.id,
          }
        : undefined,
    );
    const ref = useSignal<HTMLElement>();
    const {
      rows: messages,
      loaded,
      latest_inserted,
    } = useSupabaseRealtime<{
      id: string;
      content: string;
      created_at: string;
    }>({
      filter,
    });

    const supabase = useContext(SupabaseContext);
    const input = useSignal("");
    const submit = $(async () => {
      if (!input.value) return;
      const _insert = await supabase.client!.from("message").insert({
        thread_id: _.channel.value!.id,
        content: input.value,
      });
      input.value = "";
    });

    useVisibleTask$(({ track }) => {
      track(latest_inserted);
      // TODO: Only if the latest_inserted's author is me, do I scroll
      // Else, show number of new messages and show hint to scroll
      ref.value!.scrollTo({
        top: ref.value!.scrollHeight,
        behavior: "smooth",
      });
    });

    useVisibleTask$(({ track }) => {
      track(loaded);
      track;
      ref.value!.scrollTo({
        top: ref.value!.scrollHeight,
        behavior: "instant",
      });
    });

    return (
      <>
        <div class="flex-1 overflow-y-auto pb-4" ref={ref}>
          {loaded.value ? (
            messages.value.length == 0 ? (
              <div class="px-8 py-4 text-sm text-neutral-500">No messages</div>
            ) : (
              <div>
                {messages.value.map((message) => (
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
            )
          ) : (
            <MessageLoading />
          )}
        </div>

        <div class="flex-none space-y-2 px-4 pb-4">
          <div class=" flex  items-start rounded-lg border  bg-neutral-100 dark:bg-neutral-800 ">
            <textarea
              bind:value={input}
              onKeyDown$={(ev: KeyboardEvent) => {
                if (
                  // ev.ctrlKey &&
                  ev.key === "Enter"
                ) {
                  ev.preventDefault();
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

          {/* <div class="text-xs text-neutral-500">Ctrl + Enter to send</div> */}
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
