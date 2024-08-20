import {
  component$,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { LuHash, LuVolume2 } from "@qwikest/icons/lucide";
import { Channel, LocalDataContext } from "~/components/local-data-provider";
import TextChannelView from "~/components/text-channel-view";
import TopBar from "~/components/top-bar";
import VoiceChannelView from "~/components/voice-channel-view";
import { convertChannelNameToSlug, HEAD } from "~/utils";

export default component$(() => {
  const localData = useContext(LocalDataContext);
  const store = useStore<{
    channel?: Channel;
  }>({});

  useVisibleTask$(({ track, cleanup }) => {
    const channel_id = track(localData.channel_id);
    const c = localData.channels.find((x) => x.id == channel_id);
    if (!c) return;
    store.channel = c;

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
      ) : (
        <VoiceChannelView channel={store.channel} />
      )}
    </div>
  );
});

export const head: DocumentHead = HEAD;
