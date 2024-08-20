import {
  component$,
  createContextId,
  NoSerialize,
  noSerialize,
  Signal,
  Slot,
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
import { useLocation } from "@builder.io/qwik-city";

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
  voice_channel_id: Signal<string | undefined>;
  mode: "grid" | "focus_screensharing" | "preview";
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
  const loc = useLocation();
  const voice_channel_id = useSignal<string>();

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
    voice_channel_id,
  });
  useContextProvider(StreamingContext, streaming);

  useVisibleTask$(({ track }) => {
    const l = track(loc);
    const regex = /^\/channel\/[a-f0-9-]+\//i;
    if (!regex.test(l.url.pathname)) return;
    // Could be id of a text channel, but we care more about the persistence of the value than the correctness
    // Only change if click on another voice channel
    voice_channel_id.value = l.params.id;
    streaming.mode = "grid";
  });

  const realtime = useStore<VoiceRealtimeContext>({
    __ready_peers: [],
    __screensharing_peers: [],
  });
  useContextProvider(VoiceRealtimeContext, realtime);

  const supabase = useContext(SupabaseContext);
  const localData = useContext(LocalDataContext);

  useTask$(({ track, cleanup }) => {
    const profile = track(() => supabase.profile);
    const local = track(() => realtime.local);
    const subscribed = track(() => realtime.subscribed);

    if (!subscribed?.room) return;
    if (!local) return;
    if (!profile) return;

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
    console.log("hey", s);
    if (!s) return;
    const current_screensharing_peer = ready_peers.find((p) => p.id == s.id);
    console.log("yo", current_screensharing_peer);
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
    const channel_id = track(streaming.voice_channel_id);
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
        console.log("join", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("leave", key, leftPresences);
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
      // TODO: maintain even after?
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
      {streaming.mode == "focus_screensharing" && (
        <div class="fixed bottom-0 right-0 z-50 px-2 py-4">
          <div class="aspect-video w-64">
            {/* TODO: Change to speaking user */}
            <VideoView type="local" />
          </div>
        </div>
      )}
      <Slot />
    </div>
  );
});
