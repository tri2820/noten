import {
  component$,
  createContextId,
  NoSerialize,
  noSerialize,
  Signal,
  Slot,
  useComputed$,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { LocalDataContext } from "./local-data-provider";
import { SupabaseContext } from "./supabase-provider";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createCallsSession, pull_tracks } from "~/calls";
import VideoView from "./video-view";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { LuArrowLeft } from "@qwikest/icons/lucide";

type VoiceRealtimeContext = {
  subscribed?: {
    id: string;
    room: NoSerialize<RealtimeChannel>;
    state: {
      [id: string]: Device[] | undefined;
    };
  };
  local?: Peer;
  __ready_peers: ReadyPeer[];
  __screensharing_peers: ScreenSharingPeer[];
};
type StreamingContext = {
  local: {
    name: string;
    message_id: MessageID;
    media_state: {
      audio: boolean;
      video: boolean;
    };
    stream?: NoSerialize<MediaStream>;
  };
  screensharing?: {
    id: string;
    name: string;
    message_id: MessageID;
    stream?: NoSerialize<MediaStream>;
  };
  peer_videos: {
    [id: string]:
      | {
          message_id: MessageID;
          stream?: NoSerialize<MediaStream>;
          //   Copy from Peer over
          name: string;
        }
      | undefined;
  };

  bg_voice_channel?: {
    id: string;
    realtime_id: string;
    peek: boolean;
  };
  mode: "grid" | "focus_screensharing";
  local_stream_lock: boolean;
};

export type MessageID = string;
type GraduallyBuilt<T> = {
  [K in keyof T]?: T[K];
};

// For communication (syncing call state)
export type Peer = GraduallyBuilt<{
  // TODO: populate from presence key (JWT how?) and local data
  id: string;
  name: string;

  media_state: {
    audio: boolean;
    video: boolean;
  };
  screensharing?: {
    tracks: any;
    message_id: MessageID;
  };

  tracks: {
    message_id: MessageID;
    data: any;
  };
}>;

type Device = Peer & { presence_ref: string };
type ReadyPeer = Peer & {
  name: NonNullable<Peer["name"]>;
  id: NonNullable<Peer["id"]>;
  tracks: NonNullable<Peer["tracks"]>;
};
type ScreenSharingPeer = ReadyPeer & {
  screensharing: NonNullable<Peer["screensharing"]>;
};
export const StreamingContext = createContextId<StreamingContext>("streaming");
export const VoiceRealtimeContext = createContextId<VoiceRealtimeContext>(
  "voice-realtime-context",
);
export default component$(() => {
  const streaming = useStore<StreamingContext>({
    local: {
      name: "You",
      message_id: new Date().toISOString(),
      media_state: {
        video: true,
        audio: false,
      },
    },
    peer_videos: {},
    mode: "grid",

    local_stream_lock: false,
  });
  useContextProvider(StreamingContext, streaming);

  const realtime = useStore<VoiceRealtimeContext>({
    __ready_peers: [],
    __screensharing_peers: [],
  });
  useContextProvider(VoiceRealtimeContext, realtime);

  const supabase = useContext(SupabaseContext);
  const nav = useNavigate();

  useTask$(({ track, cleanup }) => {
    const profile = track(() => supabase.profile);
    const local = track(() => realtime.local);
    const subscribed = track(() => realtime.subscribed);

    if (!subscribed?.room) return;
    if (!local) return;
    if (!profile) return;

    console.log("track", local);
    subscribed.room.track({
      ...local,
      // TODO: These should be figured out by the receiver, not by the sender
      id: profile.id,
      name: profile.name,
    });
  });

  // Sometimes race condition occurs, make sure to clean up :)
  useVisibleTask$(async ({ track, cleanup }) => {
    const s = track(() => streaming.local.stream);
    cleanup(() => {
      s?.getTracks().forEach((t) => t.stop());
    });
  });

  useVisibleTask$(async ({ track }) => {
    const u = track(() => supabase.user);
    const ready_peers = track(() => realtime.__ready_peers);
    if (!u) return;

    // Remove streams of invalid peers
    Object.keys(streaming.peer_videos).forEach((k) => {
      const still_valid = ready_peers.some((o) => o.id == k);
      if (still_valid) return;
      streaming.peer_videos[k] = undefined;
    });

    // Pull streams of valid peers
    ready_peers.forEach(async (o) => {
      // Skip myself
      if (o.id === u.id) return;

      // Skipped if already pulled
      const current_peer_video = streaming.peer_videos[o.id];
      if (current_peer_video?.message_id == o.tracks.message_id) return;

      try {
        console.log("pulling...", o.id);
        streaming.peer_videos[o.id] = {
          message_id: o.tracks.message_id,
          name: o.name,
        };

        // TODO: use the same s for every peer (need to rewrite pull_tracks -> ontrack )
        const s = await createCallsSession();

        console.log("gg");
        const stream = await pull_tracks(
          s.peerConnection,
          s.sessionId,
          o.tracks.data,
        );

        streaming.peer_videos[o.id] = {
          ...streaming.peer_videos[o.id]!,
          stream: noSerialize(stream),
        };

        console.log("all good");
      } catch (e) {
        console.warn("Cannot pull tracks", e);
      }
    });

    const s = streaming.screensharing;

    if (!s) return;
    const current_screensharing_peer = ready_peers.find((p) => p.id == s.id);

    if (
      !current_screensharing_peer ||
      !current_screensharing_peer.screensharing
    ) {
      console.log("set grid");
      streaming.screensharing = undefined;
      streaming.mode = "grid";
      return;
    }

    if (current_screensharing_peer.screensharing.message_id == s.message_id)
      return;

    try {
      // TODO: use the same s for every peer (need to rewrite pull_tracks -> ontrack )
      const s = await createCallsSession();

      const stream = await pull_tracks(
        s.peerConnection,
        s.sessionId,
        current_screensharing_peer.screensharing.tracks,
      );

      streaming.screensharing = {
        id: current_screensharing_peer.id,
        message_id: current_screensharing_peer.screensharing.message_id,
        stream: noSerialize(stream),
        name: `${current_screensharing_peer.name}'s screen`,
      };
    } catch (e) {
      console.warn("Cannot pull tracks", e);
    }
  });

  useVisibleTask$(({ track, cleanup }) => {
    const client = track(() => supabase.client);
    const user = track(() => supabase.user);
    const channel_id = track(() => streaming.bg_voice_channel?.realtime_id);

    if (!user) return;
    if (!client) return;
    if (!channel_id) return;
    console.log("init again");
    const room = client.channel(`channel/${channel_id}`, {
      config: {
        // presence: {
        //   key: user.id,
        // },
      },
    });

    room
      .on("presence", { event: "sync" }, () => {
        if (!realtime.subscribed) return;
        const state = room.presenceState();
        realtime.subscribed.state = state;
        console.log("sync", state);

        const __peers: Peer[] = Object.values(
          realtime.subscribed?.state ?? {},
        ).flatMap((x) => x ?? []);
        const __ready_peers = __peers.filter((x): x is ReadyPeer =>
          x.name && x.id && x.tracks ? true : false,
        );

        realtime.__ready_peers = __ready_peers;

        realtime.__screensharing_peers = __ready_peers.filter(
          (p): p is ScreenSharingPeer =>
            p.screensharing && p.id ? true : false,
        );
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        // console.log("join", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        // console.log("leave", key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log("status", status);
        if (status !== "SUBSCRIBED") {
          return;
        }

        console.log("subscribed");
        realtime.subscribed = {
          id: channel_id,
          room: noSerialize(room),
          state: {},
        };
      });

    cleanup(() => {
      console.log("unsub");
      room.untrack();
      room.unsubscribe();
      realtime.subscribed = undefined;
    });
  });

  // Manage mute unmute
  useVisibleTask$(({ track }) => {
    const media_state = track(() => streaming.local.media_state);
    const s = track(() => streaming.local.stream);
    if (!s) return;

    const videoTracks = s.getVideoTracks();
    const audioTracks = s.getAudioTracks();
    videoTracks.forEach((t) => (t.enabled = media_state.video));
    audioTracks.forEach((t) => (t.enabled = media_state.audio));

    // update local state
    realtime.local = {
      ...realtime.local,
      media_state,
    };
  });

  return (
    <div class="relative">
      {/* <div>
        local_stream_lock:{" "}
        {streaming.local_stream_lock ? "showing" : "not_showing"}
      </div>
      <div>bg: {JSON.stringify(streaming.bg_voice_channel)}</div> */}
      {(streaming.mode == "focus_screensharing" ||
        (!streaming.local_stream_lock &&
          streaming.bg_voice_channel &&
          // No stream would ever be available in this case
          // TODO: check by waiting local stream status?
          !streaming.bg_voice_channel.peek)) && (
        <div class="fixed bottom-0 right-0 z-50 px-2 py-4">
          <div class="aspect-video w-64 ">
            {/* TODO: Change to speaking user */}
            {/* TODO: Back to call button */}
            <VideoView type="local" shadow>
              <div class="flex-1" />
              <button
                onClick$={() => {
                  nav(`/channel/${streaming.bg_voice_channel!.id}`);
                }}
                class="flex flex-none items-center space-x-2 px-2 py-2 text-sm leading-none tracking-tight text-neutral-300 hover:text-white"
              >
                <LuArrowLeft class="h-4 w-4 flex-none" />
                <div>Back to call</div>
              </button>
            </VideoView>
          </div>
        </div>
      )}
      <Slot />
    </div>
  );
});
