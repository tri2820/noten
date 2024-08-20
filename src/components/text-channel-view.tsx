import {
  $,
  component$,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { BsSendFill } from "@qwikest/icons/bootstrap";
import { LuChevronsDown } from "@qwikest/icons/lucide";
import { SupabaseClient } from "@supabase/supabase-js";
import Avatar from "~/components/avatar";
import { Channel, LocalDataContext } from "~/components/local-data-provider";
import PendingMessages from "~/components/pending-messages";
import PendingText from "~/components/pending-text";
import { SupabaseContext } from "~/components/supabase-provider";
import { dateF } from "~/utils";

export default component$((_: { channel: Channel }) => {
  const localData = useContext(LocalDataContext);
  const pinned_to_bottom = useSignal(true);
  const supabase = useContext(SupabaseContext);
  const messages = useSignal<any[] | undefined>();

  const after_insert = $(async (client: SupabaseClient, row: any) => {
    const profile =
      localData.profile[row.author_id] ??
      (await client.from("profile").select().eq("id", row.author_id).single())
        .data;

    if (!profile) {
      console.error("Cannot get profile for message", row);
      return;
    }

    localData.profile = {
      ...localData.profile,
      [profile.id]: profile,
    };
  });

  const load = $(async (client: SupabaseClient) => {
    const _select = await client
      .from("message")
      .select("*")
      .eq("thread_id", _.channel.id);

    if (_select.error) {
      console.warn("error", _select.error);
      return [];
    }

    (async () => {
      const profile_ids = _select.data.map((m) => m.author_id);
      const _select_profiles = await client
        .from("profile")
        .select("*")
        .in("id", profile_ids);
      if (_select_profiles.error) {
        console.error("error", _select_profiles.error);
        return;
      }

      _select_profiles.data.forEach((p) => {
        localData.profile[p.id] = p;
      });
    })();

    return _select.data;
  });

  useVisibleTask$(async ({ track, cleanup }) => {
    track(() => _.channel.id);
    const client = track(() => supabase.client);
    if (!client) return;
    messages.value = await load(client);
    client
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `thread_id=eq.${_.channel.id}`,
        },
        async (payload) => {
          if (!messages.value) return;
          const m = payload.new;
          messages.value = [...messages.value, m];
          after_insert(client, m);
        },
      )
      // TODO: handle UPDATE, DELETE
      .subscribe();

    cleanup(() => {
      messages.value = undefined;
      // it seems that the handle is automatically cleaned somehow?
    });
  });

  const ref = useSignal<HTMLElement>();

  const input = useSignal("");
  const submit = $(async () => {
    if (!input.value) return;
    const _insert = await supabase.client!.from("message").insert({
      thread_id: _.channel.id,
      content: input.value,
    });
    input.value = "";
    pinned_to_bottom.value = true;
  });

  useVisibleTask$(({ track, cleanup }) => {
    const r = track(ref);
    if (!r) return;

    const scrollHandler = () => {
      const scrollTop = r.scrollTop;
      const scrollHeight = r.scrollHeight - r.clientHeight;

      pinned_to_bottom.value = scrollTop > scrollHeight - 50;
    };

    r.addEventListener("scroll", scrollHandler);
    cleanup(() => {
      r.removeEventListener("scroll", scrollHandler);
    });
  });

  useTask$(({ track, cleanup }) => {
    const pinned = track(pinned_to_bottom);
    const r = track(ref);

    if (!pinned) return;
    if (!r) return;

    r.scrollTo({
      top: r.scrollHeight,
      behavior: "instant",
    });

    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          r.scrollTo({
            top: r.scrollHeight,
            behavior: "instant",
          });
        }
      }
    });

    observer.observe(r, config);
    cleanup(() => {
      observer.disconnect();
    });
  });

  return (
    <>
      <div class="flex-1 overflow-y-auto overflow-x-hidden pb-4" ref={ref}>
        {messages.value ? (
          messages.value.length == 0 ? (
            <div class="px-8 py-4 text-sm text-neutral-500">No messages</div>
          ) : (
            <div>
              {messages.value.map((message) => (
                <div
                  key={message.id}
                  class="bg-hover flex cursor-pointer items-start space-x-4 px-8 py-4"
                >
                  <Avatar src={localData.profile[message.author_id]?.avatar} />
                  <div class="flex-1 space-y-1">
                    <div class="font-semibold">
                      <PendingText
                        value={localData.profile[message.author_id]?.name}
                      />
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
          <PendingMessages />
        )}
      </div>

      <div class="relative flex-none px-4 pb-4">
        <div class="absolute left-0 right-0 top-0 flex -translate-y-full p-2 px-4">
          <div class="flex-1" />
          {!pinned_to_bottom.value && (
            <button
              class="flex flex-none items-center space-x-1 rounded-full border bg-white p-2 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 hover:text-black"
              onClick$={() => {
                ref.value?.scrollTo({
                  top: ref.value.scrollHeight,
                  behavior: "smooth",
                });
              }}
            >
              <div class="flex-1">Scroll to bottom</div>
              <LuChevronsDown class="h-4 w-4 flex-none" />
            </button>
          )}
        </div>
        <div class=" flex  items-start rounded-lg border  bg-white dark:bg-neutral-800 ">
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
            class="text-hover m-4 rounded-lg p-2 hover:bg-neutral-200 hover:dark:bg-neutral-700"
          >
            <BsSendFill class="h-4 w-4" />
          </button>
        </div>

        {/* <div class="text-xs text-neutral-500">Ctrl + Enter to send</div> */}
      </div>
    </>
  );
});
