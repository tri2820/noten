import {
  $,
  component$,
  createContextId,
  JSXOutput,
  NoSerialize,
  noSerialize,
  QRL,
  Signal,
  Slot,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { createCallsSession, pull_tracks } from "~/calls";
import { LocalDataContext } from "./local-data-provider";
import { SupabaseContext } from "./supabase-provider";

type DeviceMetadata = {
  device_id: string;
  // TODO: Should be figured out by the receiver
  user_name: string;
  video: {
    tracks?: any[];
  };
  screensharing: {
    tracks?: any[];
  };
};

export type CallStream = { tracks?: any[]; stream?: MediaStream };

class TypedEventTarget<T extends Record<string, any>> {
  private target = new EventTarget();

  addEventListener<K extends keyof T>(
    type: K,
    listener: (event: T[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.target.addEventListener(
      type as string,
      (event) => {
        listener((event as CustomEvent).detail);
      },
      options,
    );
  }

  removeEventListener<K extends keyof T>(
    type: K,
    listener: (event: T[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void {
    this.target.removeEventListener(
      type as string,
      listener as EventListener,
      options,
    );
  }

  dispatchEvent<K extends keyof T>(type: K, detail: T[K]): boolean {
    const event = new CustomEvent(type as string, { detail });
    return this.target.dispatchEvent(event);
  }
}

export class Device {
  private _video: CallStream = {};
  private _screensharing: CallStream = {};

  public get video(): CallStream {
    return this._video;
  }

  public set video(value: CallStream) {
    this._video = value;
    this.target.dispatchEvent("video_changed", {});
  }

  public get screensharing(): CallStream {
    return this._screensharing;
  }

  public set screensharing(value: CallStream) {
    this._screensharing = value;
    this.target.dispatchEvent("screensharing_changed", {});
  }
  public target = new TypedEventTarget<{
    video_changed: {};
    screensharing_changed: {};
  }>();

  private pulling = {
    video: false,
    screensharing: false,
  };

  constructor(
    public channel_id: string,
    public track: QRL<(m: DeviceMetadata) => void>,
    public device_id: string,
    public user_name: string,
  ) {}

  public sync() {
    const m = this.metadata();
    console.log("self sync", m);
    this.track(m);
  }

  public destroy() {
    this.video.stream = undefined;
    this.screensharing.stream = undefined;
    this.target.dispatchEvent("screensharing_changed", {});
    this.target.dispatchEvent("video_changed", {});
  }

  private async __pull(callstream: CallStream) {
    if (!callstream.tracks) {
      console.warn("Cannot pull, no tracks");
      return;
    }

    try {
      // TODO: use the same s for every peer (need to rewrite pull_tracks -> ontrack )
      const s = await createCallsSession();
      const stream = await pull_tracks(
        s.peerConnection,
        s.sessionId,
        callstream.tracks,
      );

      callstream.stream = stream;
    } catch (e) {
      console.warn("Cannot pull", e);
    }
  }

  public async pull(key: "video" | "screensharing") {
    const callstream = key == "screensharing" ? this.screensharing : this.video;
    if (callstream.stream) return;
    if (this.pulling[key]) return;
    this.pulling[key] = true;
    await this.__pull(callstream);
    this.pulling[key] = false;

    this.target.dispatchEvent(`${key}_changed`, {});
  }

  public toggle_audio(key: "video" | "screensharing", audio_enabled: boolean) {
    const callstream = key == "screensharing" ? this.screensharing : this.video;
    if (!callstream.stream) {
      console.warn("No stream, cannot toggle audio");
      return;
    }
    const audioTracks = callstream.stream.getAudioTracks();
    audioTracks.forEach((t) => (t.enabled = audio_enabled));
  }

  public toggle_video(key: "video" | "screensharing", video_enabled: boolean) {
    const callstream = key == "screensharing" ? this.screensharing : this.video;
    if (!callstream.stream) {
      console.warn("No stream, cannot toggle video");
      return;
    }
    const videoTracks = callstream.stream.getVideoTracks();
    videoTracks.forEach((t) => (t.enabled = video_enabled));
  }

  public metadata(): DeviceMetadata {
    return {
      device_id: this.device_id,
      user_name: this.user_name,
      screensharing: {
        tracks: this.screensharing.tracks,
      },
      video: {
        tracks: this.video.tracks,
      },
    };
  }
}

export const getReadyDevices = (devices: Device[]) => {
  return {
    with_cam_loading_or_loaded: devices
      .filter((d) => !!d)
      .filter((d) => d.video?.tracks),
    with_screen_loading_or_loaded: devices
      .filter((d) => !!d)
      .filter((d) => d.screensharing?.tracks),
  };
};

type VoiceChannelManagerContext = {
  client?: SupabaseClient;
  user_id?: string;
  device_id: string;
  // Promise I will only use it in the browser
  devices: NoSerialize<Device[]>;
  my: {
    [channel_id: string]: NoSerialize<Device>;
  };
  join?: QRL<(channel_id: string) => Promise<void>>;
};
export const VoiceChannelManagerContext =
  createContextId<VoiceChannelManagerContext>("VoiceChannelManagerContext");
export const VoiceChannelManager = component$(() => {
  const supabase = useContext(SupabaseContext);
  const store: VoiceChannelManagerContext =
    useStore<VoiceChannelManagerContext>({
      device_id: crypto.randomUUID(),
      devices: noSerialize([]),
      my: {},
    });

  useVisibleTask$(({ track }) => {
    const client = track(() => supabase.client);
    const profile = track(() => supabase.profile);
    if (!client) return;
    if (!profile) return;

    store.client = client;
    store.user_id = profile.id;

    // Bind functions

    const onSync = $(async (channel_id: string, channel: RealtimeChannel) => {
      const state = channel.presenceState<DeviceMetadata>();
      const of_other_channels = store.devices?.filter(
        (d) => d.channel_id != channel_id,
      );

      // Add or update new devices
      const new_devices = Object.entries(state).flatMap(([user_id, devices]) =>
        devices.map((D) => {
          let new_dev =
            store.devices?.find(
              (d) => d.channel_id == channel_id && d.device_id == D.device_id,
            ) ??
            new Device(
              channel_id,
              $((m) => {
                console.warn("remote device does not allow tracking");
              }),
              D.device_id,
              D.user_name,
            );
          new_dev.video = {
            ...D.video,
          };
          new_dev.screensharing = {
            ...D.screensharing,
          };
          return new_dev;
        }),
      );

      const shall_be_new: Device[] = [
        ...(of_other_channels ?? []),
        ...new_devices,
      ].filter((x) => !!x);
      store.devices?.forEach((d) => {
        if (!d) return;
        if (!shall_be_new.includes(d)) {
          d.destroy();
        }
      });

      console.log("shall_be_new", shall_be_new);
      store.devices = noSerialize(shall_be_new);
    });

    store.join = $(async (channel_id: string) => {
      if (store.my[channel_id]) return;
      return new Promise<void>((res) => {
        const channel = store.client!.channel(`channel/${channel_id}`, {
          config: {
            presence: {
              key: store.user_id,
            },
          },
        });

        channel
          .on("presence", { event: "join" }, async (payload) => {
            console.log("joined", payload);
          })
          .on("presence", { event: "leave" }, async (payload) => {
            console.log("leave", payload);
          })
          .on("presence", { event: "sync" }, () => {
            console.log("sync");
            onSync(channel_id, channel);
          })
          .subscribe(async (status) => {
            console.log("status", status);
            if (status !== "SUBSCRIBED") return;
            const c = noSerialize(channel);

            const my_device = new Device(
              channel_id,
              $((m) => {
                c?.track(m);
              }),
              store.device_id,
              `${store.user_id}/${store.device_id}`,
            );

            store.my[channel_id] = noSerialize(my_device);
            res();
          });
      });
    });
  });

  useContextProvider(VoiceChannelManagerContext, store);

  return <Slot />;
});

// const FloatingVideoCompositor = component$(() => {
//   const localData = useContext(LocalDataContext);
//   const vc = useContext(VoiceChannelContext);
//   const store = useStore<{
//     my_device?: NoSerialize<Device>;
//   }>({});

//   const nav = useNavigate();

//   useVisibleTask$(({ track }) => {
//     const current_channel_id = track(() => vc.id);
//     const manager = track(() => vc.manager);
//     if (!manager) return;
//     if (!current_channel_id) return;

//     manager.hub.addEventListener("sync", async (ev) => {
//       if (ev.detail.channel_id != vc.id) return;
//       const { my_device } = await manager.getChannelConfig(current_channel_id);
//       store.my_device = noSerialize(my_device);
//     });
//   });

//   return (
//     <div class="relative">
//       {
//         // streaming.mode == "focus_screensharing" ||
//         !vc.local_stream_lock &&
//           vc.id &&
//           // No stream would ever be available in this case
//           // TODO: check by waiting local stream status?
//           !vc.peek && (
//             <div class="fixed bottom-0 right-0 z-50 px-2 py-4">
//               <div class="aspect-video w-64 ">
//                 {/* TODO: Change to speaking user */}
//                 {/* TODO: Back to call button */}
//                 {store.my_device && (
//                   <VideoView
//                     vkey="video"
//                     channel_id={vc.id}
//                     device_id={store.my_device?.device_id}
//                     shadow
//                   >
//                     {localData.channel_id != vc.id && (
//                       <>
//                         <div class="flex-1" />
//                         <button
//                           onClick$={() => {
//                             vc.peek = false;
//                             nav(`/channel/${vc.id}`);
//                           }}
//                           class="flex flex-none items-center space-x-2 px-2 py-2 text-sm leading-none tracking-tight text-neutral-300 hover:text-white"
//                         >
//                           <LuArrowLeft class="h-4 w-4 flex-none" />
//                           <div>Back to call</div>
//                         </button>
//                       </>
//                     )}
//                   </VideoView>
//                 )}
//               </div>
//             </div>
//           )
//       }

//       <Slot />
//     </div>
//   );
// });

type VoiceChannelContext = {
  id?: string;
  peek?: boolean;
  local_stream_lock?: boolean;
};
export const VoiceChannelContext =
  createContextId<VoiceChannelContext>("streaming");
export default component$(() => {
  const store = useStore<VoiceChannelContext>({});
  useContextProvider(VoiceChannelContext, store);

  return (
    <VoiceChannelManager>
      <Slot />
    </VoiceChannelManager>
  );

  // return (
  //   <FloatingVideoCompositor>
  //     <Slot />
  //   </FloatingVideoCompositor>
  // );
});
