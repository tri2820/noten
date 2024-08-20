import {
  $,
  component$,
  noSerialize,
  useContext,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  LuArrowLeftToLine,
  LuCamera,
  LuCameraOff,
  LuMic,
  LuMicOff,
  LuScreenShare,
  LuScreenShareOff,
} from "@qwikest/icons/lucide";
import { beam, createCallsSession, pull_tracks, push_tracks } from "~/calls";
import { Channel } from "~/components/local-data-provider";
import { StreamingContext, VoiceRealtimeContext } from "./streaming-provider";
import VideoView from "./video-view";

export default component$((_: { channel: Channel }) => {
  const streaming = useContext(StreamingContext);
  const realtime = useContext(VoiceRealtimeContext);

  const get_local_tracks_and_push = $(
    async (s: { peerConnection: RTCPeerConnection; sessionId: any }) => {
      let _stream: MediaStream;
      try {
        _stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        });

        console.log("set local stream", _stream);
        streaming.local = {
          ...streaming.local,
          message_id: new Date().toISOString(),
          stream: noSerialize(_stream),
        };
      } catch (e) {
        console.warn(e);
        return;
      }

      const transceivers = await beam(s.peerConnection, _stream);

      const localTracks = transceivers.map((transceiver) => {
        return {
          location: "local" as const,
          mid: transceiver.mid!,
          trackName: transceiver.sender.track!.id,
        };
      });

      await push_tracks(s.peerConnection, s.sessionId, localTracks);

      console.log("pushed localTracks", localTracks);

      const tracks = transceivers.map((transceiver) => {
        return {
          location: "remote" as const,
          sessionId: s.sessionId,
          trackName: transceiver.sender.track!.id,
        };
      });

      realtime.local = {
        ...realtime.local,
        tracks: {
          message_id: new Date().toISOString(),
          data: tracks,
        },
      };
    },
  );

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

  const stop_sharing = $(() => {
    console.log("The user has ended sharing the screen");
    streaming.screensharing!.stream?.getTracks().forEach((t) => t.stop());
    streaming.screensharing = undefined;

    realtime.local = {
      ...realtime.local,
      screensharing: undefined,
    };
  });

  const share_or_stop_screen = $(async () => {
    if (streaming.screensharing) {
      stop_sharing();
      return;
    }

    let _stream = null;

    try {
      _stream = await navigator.mediaDevices.getDisplayMedia({
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

    const message_id = new Date().toISOString();
    streaming.screensharing = {
      id: "tri-0000",
      message_id,
      name: `Tri's screen`,
      stream: noSerialize(_stream),
    };

    _stream.getVideoTracks()[0].addEventListener("ended", stop_sharing);

    const s = await createCallsSession();

    const transceivers = await beam(s.peerConnection, _stream);

    const localTracks = transceivers.map((transceiver) => {
      return {
        location: "local" as const,
        mid: transceiver.mid!,
        trackName: transceiver.sender.track!.id,
      };
    });

    await push_tracks(s.peerConnection, s.sessionId, localTracks);

    console.log("pushed localTracks", localTracks);

    const tracks = transceivers.map((transceiver) => {
      return {
        location: "remote" as const,
        sessionId: s.sessionId,
        trackName: transceiver.sender.track!.id,
      };
    });

    realtime.local = {
      ...realtime.local,
      screensharing: {
        message_id,
        tracks,
      },
    };
  });

  //   Startup
  useVisibleTask$(async () => {
    const localSession = await createCallsSession();
    get_local_tracks_and_push(localSession);
  });

  return (
    <div class="flex flex-1 flex-col items-stretch space-y-4 p-4">
      <div
        class="grid flex-1 gap-2 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(
            Math.sqrt(
              realtime.__ready_peers.length +
                realtime.__screensharing_peers.length,
            ),
          )}, minmax(0, 1fr))`,
        }}
      >
        <VideoView type="local" muted />

        {Object.entries(streaming.peer_videos).map(([id, p]) =>
          p ? <VideoView type={{ id }} /> : <></>,
        )}

        {realtime.__screensharing_peers.map((p) => (
          <div
            key={`${p.id} - screen sharing`}
            class="flex h-full w-full items-center rounded-lg bg-neutral-100 dark:bg-neutral-800"
          >
            <div class="flex flex-1 flex-col items-center  space-y-2 ">
              <button
                onClick$={async () => {
                  try {
                    streaming.screensharing = {
                      id: p.id,
                      name: `${p.name}'s screen`,
                      message_id: p.screensharing.message_id,
                    };
                    const s = await createCallsSession();

                    const stream = await pull_tracks(
                      s.peerConnection,
                      s.sessionId,
                      p.screensharing.tracks,
                    );

                    streaming.screensharing = {
                      ...streaming.screensharing,
                      stream: noSerialize(stream),
                    };
                  } catch (e) {
                    console.warn("Cannot pull tracks", e);
                  }
                }}
                class="rounded-full border bg-white px-4 py-2 hover:bg-neutral-50 dark:bg-neutral-900 hover:dark:bg-black"
              >
                View screen
              </button>
              <div class="text-center">{p.name} is sharing their screen</div>
            </div>
          </div>
        ))}
      </div>

      <div class="flex flex-none items-center space-x-2 ">
        <div class="flex-1" />
        <div class="flex-none  space-x-4">
          <button
            class="rounded-full  bg-neutral-300 p-4 text-black hover:bg-white"
            onClick$={async () => {
              streaming.local.media_state = {
                ...streaming.local.media_state,
                video: !streaming.local.media_state.video,
              };
            }}
          >
            {streaming.local.media_state.video ? (
              <LuCamera class="h-6 w-6" />
            ) : (
              <LuCameraOff class="h-6 w-6" />
            )}
          </button>

          <button
            class="rounded-full  bg-neutral-300 p-4 text-black hover:bg-white"
            onClick$={async () => {
              streaming.local.media_state = {
                ...streaming.local.media_state,
                audio: !streaming.local.media_state.audio,
              };
            }}
          >
            {streaming.local.media_state.audio ? (
              <LuMic class="h-6 w-6" />
            ) : (
              <LuMicOff class="h-6 w-6" />
            )}
          </button>

          <button
            class="rounded-full  bg-neutral-300 p-4 text-black hover:bg-white"
            onClick$={share_or_stop_screen}
          >
            {streaming.screensharing ? (
              streaming.screensharing.id == "tri-0000" ? (
                <LuScreenShareOff class="h-6 w-6" />
              ) : (
                <LuArrowLeftToLine class="h-6 w-6" />
              )
            ) : (
              <LuScreenShare class="h-6 w-6" />
            )}
          </button>
        </div>
        <div class="flex-1" />
      </div>
    </div>
  );
});
