import {
  component$,
  NoSerialize,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  useLocation,
  useNavigate,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { LuHash, LuVolume2 } from "@qwikest/icons/lucide";
import { preview } from "vite";
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

const PeekView = component$(() => {
  const streaming = useContext(StreamingContext);
  const realtime = useContext(VoiceRealtimeContext);
  return (
    <div class="flex flex-1 flex-col items-center justify-center">
      <div class="flex flex-col items-center space-y-4">
        <div class="text-center">
          {/* {JSON.stringify(realtime.__ready_peers.map((p) => p.name))} */}
          {realtime.__ready_peers.length > 3 ? (
            <div>
              {realtime.__ready_peers[0].name}, {realtime.__ready_peers[1].name}
              , and {realtime.__ready_peers.length - 2} others
            </div>
          ) : realtime.__ready_peers.length > 2 ? (
            <div>
              {realtime.__ready_peers[0].name}, {realtime.__ready_peers[1].name}
              , and {realtime.__ready_peers[2].name}
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
            streaming.bg_voice_channel = {
              ...streaming.bg_voice_channel!,
              peek: false,
            };
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
});

export default component$(() => {
  const streaming = useContext(StreamingContext);
  const localData = useContext(LocalDataContext);
  const channel = useSignal<{ [key: string]: any }>();

  const loc = useLocation();

  useVisibleTask$(({ track, cleanup }) => {
    const l = track(loc);

    if (l.isNavigating) return;

    const channel_id = l.params.id;
    localData.channel_id = channel_id;
    const c = localData.channels.find((x) => x.id == channel_id);

    if (!c) {
      // TODO: load channel
      return;
    }

    channel.value = c;

    if (c.type == "voice") {
      streaming.bg_voice_channel = {
        id: channel_id,
        realtime_id: channel_id,
        peek: false,
      };
    } else {
      localData.text_channel_id = c.id;
    }

    cleanup(() => {
      localData.channel_id = undefined;
      streaming.mode = "grid";
      channel.value = undefined;
      if (streaming.bg_voice_channel?.peek) {
        streaming.bg_voice_channel = undefined;
      }
    });
  });

  // TODO: Loading channel...
  if (!channel.value) return <></>;

  return (
    <div
      data-ctype={channel.value.type}
      class="flex h-screen flex-1 flex-col overflow-hidden  data-[ctype=text]:bg-white data-[ctype=voice]:bg-neutral-200 data-[ctype=text]:dark:bg-neutral-900 data-[ctype=voice]:dark:bg-black"
    >
      <TopBar>
        <div class="flex items-center space-x-2">
          {channel.value.type == "text" ? (
            <LuHash class="h-4 w-4" />
          ) : (
            <LuVolume2 class="h-4 w-4" />
          )}
          <div class="text-lg font-medium">
            {convertChannelNameToSlug(channel.value.name)}
          </div>
        </div>
      </TopBar>

      {channel.value.type == "text" ? (
        <TextChannelView />
      ) : streaming.bg_voice_channel?.peek ? (
        <PeekView />
      ) : (
        <VoiceChannelView />
      )}
    </div>
  );
});

export const head: DocumentHead = HEAD;
