import {
  component$,
  NoSerialize,
  useComputed$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { MessageID, StreamingContext } from "./streaming-provider";

//   import LoadAnimation from "./load-animation";

export default component$(
  (_: {
    type: "local" | "screensharing" | { id: string };
    muted?: boolean;
  }) => {
    const streaming = useContext(StreamingContext);
    const video = useSignal<HTMLVideoElement>();
    const store = useStore<{
      message_id: MessageID;
      name: string;
    }>({
      message_id: new Date().toISOString(),
      name: "?",
    });

    useVisibleTask$(({ track }) => {
      const k = track(() =>
        _.type == "local"
          ? streaming.local
          : _.type == "screensharing"
            ? streaming.screensharing
            : streaming.peer_videos[_.type.id],
      );

      const v = track(video);
      console.log("k changed", k);
      if (!v) return;
      if (!k) return;

      store.name = k.name;

      if (!k.stream) return;
      if (store.message_id == k.message_id) return;

      store.message_id = k.message_id;
      v.srcObject = k.stream;
    });

    return (
      <div class="relative h-full w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
        <div class="absolute bottom-2 left-2 z-10 rounded-lg bg-white/70 px-4 py-2 text-sm leading-none tracking-tight dark:bg-black/70">
          {store.name}
        </div>

        <div class="absolute left-0 top-1/2 w-full -translate-y-1/2 ">
          <div class="relative">
            <video ref={video} class="w-full" autoplay muted={_.muted} />
          </div>
          {/* {stream.value ? (
            <div class="relative">
              <video ref={video} class="w-full" autoplay muted={_.muted} />
            </div>
          ) : (
            <div class="flex flex-col items-center ">
              <LoadAnimation />
              Loading...
            </div>
          )} */}
        </div>
      </div>
    );
  },
);
