const basePath = "https://rtc.live.cloudflare.com/v1";
import { $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";

type R =
  | {
      data: { [key: string]: any };
      error: undefined;
    }
  | {
      data: undefined;
      error: true;
    };
export const calls_api = async function (
  this: any,
  path:
    | "/sessions/new"
    | `/sessions/${string}/tracks/new`
    | `/sessions/${string}/renegotiate`,
  body: string,
  method: "POST" | "PUT" = "POST",
): Promise<R> {
  const appId = this.env.get("CF_CALLS_APP_ID");
  const appToken = this.env.get("CF_CALLS_API_TOKEN");

  const headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${appToken}`,
  };
  const url = `${basePath}/apps/${appId}${path}`;
  const response = await fetch(url, {
    method,
    headers,
    body,
  });
  try {
    const data = await response.json();
    return {
      data,
      error: undefined,
    };
  } catch (e) {
    console.log("e", e, await response.text());
    return {
      data: undefined,
      error: true,
    };
  }
};

const calls_api$ = server$(calls_api);
export const push_tracks = $(
  async (
    pc: RTCPeerConnection,
    sessionId: string,
    tracks: {
      location: "local";
      mid: string;
      trackName: string;
    }[],
  ) => {
    // "Server, do you want to receive it?"
    await pc.setLocalDescription(await pc.createOffer());

    const { data } = await calls_api$(
      `/sessions/${sessionId}/tracks/new`,
      JSON.stringify({
        sessionDescription: pc.localDescription,
        tracks,
      }),
    );

    if (!data) throw new Error("Cannot push track");

    // Server said "I want"
    await pc.setRemoteDescription(
      new RTCSessionDescription(data.sessionDescription),
    );
  },
);

export const pull_tracks = $(
  async (
    pc: RTCPeerConnection,
    sessionId: string,
    tracks: {
      location: "remote";
      sessionId: string;
      trackName: string;
    }[],
  ) => {
    const remoteStream = new MediaStream();
    const at_least_one_track_ready = new Promise<void>((resolve) => {
      (async () => {
        pc.ontrack = (event) => {
          console.debug(`Got media stream track`, event.track);
          remoteStream.addTrack(event.track);
          resolve();
        };

        // Calls API request to ask for the tracks

        const { data, error } = await calls_api$(
          `/sessions/${sessionId}/tracks/new`,
          JSON.stringify({
            tracks,
          }),
        );

        if (error) throw new Error("Cannot pull tracks");

        if (
          data.requiresImmediateRenegotiation &&
          data.sessionDescription.type == "offer"
        ) {
          // Server asked "Does anyone want to receive it?"
          await pc.setRemoteDescription(
            new RTCSessionDescription(data.sessionDescription),
          );
          // "I do"
          await pc.setLocalDescription(await pc.createAnswer());
          await calls_api$(
            `/sessions/${sessionId}/renegotiate`,
            JSON.stringify({
              sessionDescription: pc.localDescription,
            }),
            "PUT",
          );
        } else {
          console.log("error data", data);
          throw new Error("An offer sdp was expected");
        }
      })();
    });
    await at_least_one_track_ready;
    return remoteStream;
  },
);

export const beam = $(async (pc: RTCPeerConnection, stream: MediaStream) => {
  // Add sendonly trancievers to the PeerConnection
  const transceivers = stream.getTracks().map((track) =>
    pc.addTransceiver(track, {
      direction: "sendonly",
    }),
  );
  await pc.setLocalDescription(await pc.createOffer());
  return transceivers;
});

/**
 * Creates a peer connection and connects it to a new Calls session
 */
export const createCallsSession = $(async () => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.cloudflare.com:3478",
      },
    ],
    bundlePolicy: "max-bundle",
  });

  // in order for the ICE connection to be established, there must
  // be at least one track present, but since we want each peer
  // connection and session to have tracks explicitly pushed and
  // pulled, we can add an empty audio track here to force the
  // connection to be established.
  peerConnection.addTransceiver("audio", {
    direction: "inactive",
  });

  // create an offer and set it as the local description
  await peerConnection.setLocalDescription(await peerConnection.createOffer());
  const { data } = await calls_api$(
    "/sessions/new",
    JSON.stringify({
      sessionDescription: peerConnection.localDescription,
    }),
  );

  if (!data) {
    throw new Error("Cannot create new session");
  }

  const connected = new Promise((res, rej) => {
    // timeout after 5s
    setTimeout(rej, 5000);
    const iceConnectionStateChangeHandler = () => {
      if (peerConnection.iceConnectionState === "connected") {
        peerConnection.removeEventListener(
          "iceconnectionstatechange",
          iceConnectionStateChangeHandler,
        );
        res(undefined);
      }
    };
    peerConnection.addEventListener(
      "iceconnectionstatechange",
      iceConnectionStateChangeHandler,
    );
  });

  // Once both local and remote descriptions are set, the ICE process begins
  await peerConnection.setRemoteDescription(data.sessionDescription);
  // Wait until the peer connection's iceConnectionState is "connected"
  await connected;
  return {
    peerConnection,
    sessionId: data.sessionId,
  };
});
