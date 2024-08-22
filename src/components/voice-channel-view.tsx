import {
  $,
  component$,
  NoSerialize,
  noSerialize,
  useComputed$,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  LuCamera,
  LuCameraOff,
  LuMic,
  LuMicOff,
  LuPhoneOff,
  LuScreenShare,
  LuScreenShareOff,
} from "@qwikest/icons/lucide";
import { beam, createCallsSession, push_tracks } from "~/calls";
import { SupabaseContext } from "./supabase-provider";
import VideoView from "./video-view";
import {
  Device,
  getReadyDevices,
  VoiceChannelContext,
  VoiceChannelManager,
  VoiceChannelManagerContext,
} from "./voice-channel-provider";

const DEFAULT_STORE = () => ({
  video_enabled: true,
  audio_enabled: false,
  screensharing_devices: {},
  readyDevices: {
    with_cam_loading_or_loaded: [],
    with_screen_loading_or_loaded: [],
  },
});
export default component$(() => {
  const supabase = useContext(SupabaseContext);
  const manager = useContext(VoiceChannelManagerContext);
  const vc = useContext(VoiceChannelContext);
  const store = useStore<{
    my_device?: NoSerialize<NonNullable<Device>>;
    pushing?: boolean;
    video_enabled: boolean;
    audio_enabled: boolean;
    readyDevices: {
      with_cam_loading_or_loaded: NonNullable<NoSerialize<Device>>[];
      with_screen_loading_or_loaded: NonNullable<NoSerialize<Device>>[];
    };
  }>(DEFAULT_STORE);

  const num_grid_cell = useComputed$(() =>
    Math.ceil(
      Math.sqrt(
        (store.readyDevices.with_cam_loading_or_loaded.length ?? 0) +
          (store.readyDevices.with_screen_loading_or_loaded.length ?? 0),
      ),
    ),
  );

  const get_local_tracks_and_push = $(
    async (s: { peerConnection: RTCPeerConnection; sessionId: any }) => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        });
      } catch (e) {
        console.warn(e);
        return;
      }

      const transceivers = await beam(s.peerConnection, stream);

      const localTracks = transceivers.map((transceiver) => {
        return {
          location: "local" as const,
          mid: transceiver.mid!,
          trackName: transceiver.sender.track!.id,
        };
      });

      await push_tracks(s.peerConnection, s.sessionId, localTracks);
      const tracks = transceivers.map((transceiver) => {
        return {
          location: "remote" as const,
          sessionId: s.sessionId,
          trackName: transceiver.sender.track!.id,
        };
      });

      return { tracks, stream: stream };
    },
  );

  const stop_sharing = $(async () => {
    if (!store.my_device) {
      console.warn("Cannot stop sharing without a device");
      return;
    }
    if (!store.my_device.screensharing) {
      console.warn("Cannot stop sharing without a screensharing");
      return;
    }

    if (!store.my_device.screensharing.stream) {
      console.warn("Cannot stop sharing without a stream");
      return;
    }

    store.my_device.screensharing.stream.getTracks().forEach((t) => t.stop());
    store.my_device.screensharing = {};
    store.my_device.sync();
  });

  const share_or_stop_screen = $(async () => {
    if (!store.my_device) {
      console.warn("Cannot share screen without a device");
      return;
    }

    if (store.my_device.screensharing) {
      stop_sharing();
      return;
    }

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: {
          noiseSuppression: true,
        },
      });
    } catch (err) {
      console.error(`Error: ${err}`);
      return;
    }

    const s = await createCallsSession();
    stream.getVideoTracks()[0].addEventListener("ended", stop_sharing);
    const transceivers = await beam(s.peerConnection, stream);
    const localTracks = transceivers.map((transceiver) => {
      return {
        location: "local" as const,
        mid: transceiver.mid!,
        trackName: transceiver.sender.track!.id,
      };
    });

    await push_tracks(s.peerConnection, s.sessionId, localTracks);
    const tracks = transceivers.map((transceiver) => {
      return {
        location: "remote" as const,
        sessionId: s.sessionId,
        trackName: transceiver.sender.track!.id,
      };
    });

    store.my_device.screensharing = {
      tracks,
      stream,
    };

    store.my_device.sync();
  });

  //   Startup
  useVisibleTask$(async ({ track, cleanup }) => {
    const channel_id = track(() => vc.id);
    if (!channel_id) return;

    const join = track(() => manager.join);
    if (!join) return;
    await join(channel_id);

    const my_device = manager.my[channel_id];
    store.my_device = my_device;

    cleanup(() => {
      console.log("cleanup...");
      const D = DEFAULT_STORE();
      const keys = Object.keys(D);
      keys.forEach(
        (k) =>
          // @ts-ignore
          (store[k] = D[k]),
      );
      Object.keys(store).forEach((k) => {
        if (keys.includes(k)) return;
        // @ts-ignore
        store[k] = undefined;
      });
    });

    vc.local_stream_lock = true;
    cleanup(() => {
      vc.local_stream_lock = false;
    });

    const devices = track(
      () => manager.devices?.filter((d) => d?.channel_id == channel_id) ?? [],
    );
    console.log("devices ..", devices);

    const r = getReadyDevices(devices);
    store.readyDevices = {
      with_cam_loading_or_loaded: r.with_cam_loading_or_loaded
        .map((d) => noSerialize(d))
        .filter((d) => !!d),
      with_screen_loading_or_loaded: r.with_screen_loading_or_loaded
        .map((d) => noSerialize(d))
        .filter((d) => !!d),
    };

    if (!my_device) {
      console.warn("No my_device");
      return;
    }

    if (!my_device.video.stream && !store.pushing) {
      store.pushing = true;
      const localSession = await createCallsSession();
      const ok = await get_local_tracks_and_push(localSession);
      store.pushing = false;

      if (!ok) return;

      my_device.video = {
        tracks: ok.tracks,
        stream: ok.stream,
      };

      my_device.sync();
    }

    my_device.toggle_audio("video", store.audio_enabled);
    my_device.toggle_video("video", store.video_enabled);
  });

  return (
    <div class="flex flex-1 flex-col items-stretch space-y-4 p-4">
      <div
        class="grid flex-1 gap-2 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${num_grid_cell.value}, minmax(0, 1fr))`,
        }}
      >
        {store.readyDevices?.with_screen_loading_or_loaded.map((d) => (
          <VideoView key={d.device_id} vkey="screensharing" device={d} muted />
        ))}

        {store.readyDevices?.with_cam_loading_or_loaded.map((d) => (
          <VideoView key={d.device_id} vkey="video" device={d} />
        ))}
        {/* 
        {store.with_screen_loading_or_loaded?.map((d) => (
          <div
            key={d.device_id}
            class="flex h-full w-full items-center rounded-lg bg-neutral-100 dark:bg-neutral-800"
          >
            <div class="flex flex-1 flex-col items-center  space-y-2 ">
              <button
                onClick$={async () => {
                  // if (d.id === supabase.user?.id) {
                  //   streaming.mode = "focus_screensharing";
                  //   return;
                  // }
                  // try {
                  //   streaming.screensharing = {
                  //     id: p.id,
                  //     name: `${p.name}'s screen`,
                  //     message_id: p.screensharing.message_id,
                  //   };
                  //   streaming.mode = "focus_screensharing";
                  //   const s = await createCallsSession();
                  //   const stream = await pull_tracks(
                  //     s.peerConnection,
                  //     s.sessionId,
                  //     p.screensharing.tracks,
                  //   );
                  //   streaming.screensharing = {
                  //     ...streaming.screensharing,
                  //     stream: noSerialize(stream),
                  //   };
                  // } catch (e) {
                  //   console.warn("Cannot pull tracks", e);
                  // }
                }}
                class="is-button"
              >
                View screen
              </button>

              <div class="text-center">
                {d.user_name} is sharing their screen
              </div>
            </div>
          </div>
        ))} */}
      </div>

      <div class="flex flex-none items-center space-x-2 ">
        <div class="flex-1" />
        <div class="flex-none  space-x-4">
          <button
            class="rounded-full  bg-neutral-300 p-4 text-black hover:bg-white"
            onClick$={async () => {
              store.video_enabled = !store.video_enabled;
              store.my_device?.toggle_video("video", store.video_enabled);
            }}
          >
            {store.video_enabled ? (
              <LuCamera class="h-6 w-6" />
            ) : (
              <LuCameraOff class="h-6 w-6" />
            )}
          </button>

          <button
            class="rounded-full  bg-neutral-300 p-4 text-black hover:bg-white"
            onClick$={async () => {
              store.audio_enabled = !store.audio_enabled;
              store.my_device?.toggle_audio("video", store.audio_enabled);
            }}
          >
            {store.audio_enabled ? (
              <LuMic class="h-6 w-6" />
            ) : (
              <LuMicOff class="h-6 w-6" />
            )}
          </button>

          {/* start sharing my screen, or stop my sharing, or stop watching other screens */}
          <button
            class="rounded-full  bg-neutral-300 p-4 text-black hover:bg-white"
            onClick$={share_or_stop_screen}
          >
            {store.my_device?.screensharing ? (
              <LuScreenShareOff class="h-6 w-6" />
            ) : (
              <LuScreenShare class="h-6 w-6" />
            )}
          </button>

          <button
            class="rounded-full  bg-neutral-300 p-4 text-black hover:bg-white"
            onClick$={async () => {
              if (store.my_device) {
                const stream = store.my_device.video.stream;
                if (stream) {
                  stream.getTracks().forEach((t) => t.stop());
                  store.my_device.video = {};
                  store.my_device.sync();
                }
              }
              stop_sharing();
              vc.peek = true;
            }}
          >
            <LuPhoneOff class="h-6 w-6" />
          </button>
        </div>
        <div class="flex-1" />
      </div>
    </div>
  );
});
