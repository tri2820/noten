import {
  ClassList,
  component$,
  NoSerialize,
  useComputed$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { MessageID, StreamingContext } from "./streaming-provider";
const LoadAnimation = component$(() => {
  return (
    <svg
      class="w-16 text-black dark:text-white"
      version="1.1"
      id="L4"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 52 100"
      enable-background="new 0 0 0 0"
      xml:space="preserve"
    >
      <circle fill="currentColor" stroke="none" cx="6" cy="50" r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.1"
        />
      </circle>
      <circle fill="currentColor" stroke="none" cx="26" cy="50" r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.2"
        />
      </circle>
      <circle fill="currentColor" stroke="none" cx="46" cy="50" r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.3"
        />
      </circle>
    </svg>
  );
});

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
      ready: boolean;
    }>({
      message_id: new Date().toISOString(),
      name: "?",
      ready: false,
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
      store.ready = true;
    });

    return (
      <div class="relative h-full w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
        <div class="absolute bottom-2 left-2 z-10 rounded-lg bg-white/70 px-4 py-2 text-sm leading-none tracking-tight dark:bg-black/70">
          {store.name}
        </div>

        <div class="absolute left-0 top-1/2 w-full -translate-y-1/2 ">
          <div class="relative h-full w-full ">
            <video ref={video} class="w-full" autoplay muted={_.muted} />
            {!store.ready && (
              <div class="absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center ">
                <LoadAnimation />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
