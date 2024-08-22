import {
  component$,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { LuHash, LuVolume2 } from "@qwikest/icons/lucide";
import { LocalDataContext } from "~/components/local-data-provider";
import TextChannelView from "~/components/text-channel-view";
import TopBar from "~/components/top-bar";
import {
  getReadyDevices,
  VoiceChannelContext,
  VoiceChannelManagerContext,
} from "~/components/voice-channel-provider";

import VoiceChannelView from "~/components/voice-channel-view";
import { convertChannelNameToSlug, HEAD } from "~/utils";

const PeekView = component$(() => {
  const manager = useContext(VoiceChannelManagerContext);
  const vc = useContext(VoiceChannelContext);
  const names = useSignal<string[]>([]);

  useVisibleTask$(async ({ track }) => {
    const id = track(() => vc.id);
    if (!id) return;
    const devices = track(
      () => manager.devices?.filter((x) => x?.channel_id == id) ?? [],
    );
    const ready_devices = getReadyDevices(devices);
    names.value = ready_devices.with_cam_loading_or_loaded
      .filter((d) => d.device_id != manager.device_id)
      .map((d) => d.user_name);
  });

  return (
    <div class="flex flex-1 flex-col items-center justify-center">
      <div class="flex flex-col items-center space-y-4">
        <div class="text-center">
          {/* {JSON.stringify(realtime.__ready_peers.map((p) => p.name))} */}
          {names.value.length > 3 ? (
            <div>
              {names.value[0]}, {names.value[1]}, and {names.value.length - 2}{" "}
              others
            </div>
          ) : names.value.length > 2 ? (
            <div>
              {names.value[0]}, {names.value[1]}, and {names.value[2]}
            </div>
          ) : names.value.length > 1 ? (
            <div>
              {names.value[0]} and {names.value[1]}
            </div>
          ) : names.value.length > 0 ? (
            <div>{names.value[0]}</div>
          ) : (
            <div>No one is here</div>
          )}
        </div>

        <button
          class="is-button"
          onClick$={() => {
            vc.peek = false;
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
});

export default component$(() => {
  const manager = useContext(VoiceChannelManagerContext);
  const vc = useContext(VoiceChannelContext);
  const localData = useContext(LocalDataContext);
  const channel = useSignal<{ [key: string]: any }>();

  const loc = useLocation();

  useVisibleTask$(({ track, cleanup }) => {
    const l = track(loc);
    const channel_id = l.params.id;
    console.log("set channel_id", channel_id);
    localData.channel_id = channel_id;
    const c = localData.channels.find((x) => x.id == channel_id);

    if (!c) {
      // TODO: load channel
      return;
    }

    channel.value = c;

    if (c.type == "voice") {
      vc.id = channel_id;
      vc.peek = false;
    } else {
      localData.text_channel_id = c.id;
    }

    cleanup(() => {
      localData.channel_id = undefined;
      channel.value = undefined;
      if (vc.peek && vc.id) {
        vc.id = undefined;
        vc.peek = undefined;
      }
    });
  });

  // TODO: Loading channel...
  if (!channel.value) return <></>;

  // return <div>Hey</div>;

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
      ) : (
        <>{vc.peek ? <PeekView /> : <VoiceChannelView />}</>
      )}
    </div>
  );
});

export const head: DocumentHead = HEAD;
