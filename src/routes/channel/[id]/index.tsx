import {
  component$,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { LuHash, LuVolume2 } from "@qwikest/icons/lucide";
import { Channel, LocalDataContext } from "~/components/local-data-provider";
import {
  StreamingContext,
  VoiceRealtimeContext,
} from "~/components/streaming-provider";
import { SupabaseContext } from "~/components/supabase-provider";
import TextChannelView from "~/components/text-channel-view";
import TopBar from "~/components/top-bar";
import VoiceChannelView from "~/components/voice-channel-view";
import { convertChannelNameToSlug, HEAD } from "~/utils";

export default component$(() => {
  const localData = useContext(LocalDataContext);
  const streaming = useContext(StreamingContext);
  const realtime = useContext(VoiceRealtimeContext);
  const supabase = useContext(SupabaseContext);
  const store = useStore<{
    channel?: Channel;
  }>({});

  useVisibleTask$(({ track, cleanup }) => {
    const channel_id = track(localData.channel_id);
    const c = localData.channels.find((x) => x.id == channel_id);
    if (!c) return;
    store.channel = c;
    console.log("CHANNEL IS", c);
    // TODO: load channel

    cleanup(() => {
      store.channel = undefined;
    });
  });

  if (!store.channel) return <></>;

  return (
    <div
      data-ctype={store.channel.type}
      class="flex h-screen flex-1 flex-col overflow-hidden  data-[ctype=text]:bg-white data-[ctype=voice]:bg-neutral-200 data-[ctype=text]:dark:bg-neutral-900 data-[ctype=voice]:dark:bg-black"
    >
      <TopBar>
        <div class="flex items-center space-x-2">
          {store.channel.type == "text" ? (
            <LuHash class="h-4 w-4" />
          ) : (
            <LuVolume2 class="h-4 w-4" />
          )}
          <div class="text-lg font-medium">
            {convertChannelNameToSlug(store.channel.name)}
          </div>
        </div>
      </TopBar>

      {store.channel.type == "text" ? (
        <TextChannelView channel={store.channel} />
      ) : streaming.mode == "preview" ? (
        <div class="flex flex-1 flex-col items-center justify-center">
          <div class="flex flex-col items-center space-y-4">
            <div class="text-center">
              {/* {JSON.stringify(realtime.__ready_peers.map((p) => p.name))} */}
              {realtime.__ready_peers.length > 3 ? (
                <div>
                  {realtime.__ready_peers[0].name},{" "}
                  {realtime.__ready_peers[1].name}, and{" "}
                  {realtime.__ready_peers.length - 2} others
                </div>
              ) : realtime.__ready_peers.length > 2 ? (
                <div>
                  {realtime.__ready_peers[0].name},{" "}
                  {realtime.__ready_peers[1].name}, and{" "}
                  {realtime.__ready_peers[2].name}
                </div>
              ) : realtime.__ready_peers.length > 1 ? (
                <div>
                  {realtime.__ready_peers[0].name} and{" "}
                  {realtime.__ready_peers[1].name}
                </div>
              ) : realtime.__ready_peers.length > 0 ? (
                <div>{realtime.__ready_peers[0].name}</div>
              ) : (
                <div>No one is here</div>
              )}
            </div>

            <button
              class="is-button"
              onClick$={() => {
                streaming.mode = "grid";
              }}
            >
              Join
            </button>
          </div>
        </div>
      ) : (
        <VoiceChannelView />
      )}
    </div>
  );
});

export const head: DocumentHead = HEAD;
