import {
  component$,
  createContextId,
  NoSerialize,
  Slot,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import Cookies from "js-cookie";

type MessageID = string;
type GraduallyBuilt<T> = {
  [K in keyof T]?: T[K];
};

export type Peer = GraduallyBuilt<{
  media_state: {
    audio: boolean;
    video: boolean;
  };
  screensharing?: {
    tracks: any;
    id: MessageID;
  };
  tracks: any;
  profile_id: string;
  name: string;
}>;

type StreamingContext = {
  local: {
    media_state: {
      audio: boolean;
      video: boolean;
    };
    stream?: NoSerialize<MediaStream>;
    name: string;
  };
  screensharing?: {
    id: MessageID;
    profile_id: string;
    stream?: NoSerialize<MediaStream>;
    name: string;
  };
  peers: {
    [profile_id: string]:
      | {
          // TODO:
          // id: MessageID;
          stream?: NoSerialize<MediaStream>;
          name: string;
        }
      | undefined;
  };
};
export const StreamingContext = createContextId<StreamingContext>("streaming");
export default component$(() => {
  const store = useStore<StreamingContext>({
    local: {
      name: "You",
      media_state: {
        video: true,
        audio: false,
      },
    },
    peers: {},
  });
  useContextProvider(StreamingContext, store);
  return <Slot />;
});
