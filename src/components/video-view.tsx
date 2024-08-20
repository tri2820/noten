import {
  component$,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { StreamingContext } from "./streaming-provider";

//   import LoadAnimation from "./load-animation";

export default component$(
  (_: {
    type: "local" | "screensharing" | { id: string };
    muted?: boolean;
  }) => {
    const streaming = useContext(StreamingContext);

    const video = useSignal<HTMLVideoElement>();
    const name = useComputed$(
      () =>
        (_.type == "local"
          ? streaming.local.name
          : _.type == "screensharing"
            ? streaming.screensharing?.name
            : streaming.peer_videos[_.type.id]?.name) ?? "?",
    );
    const stream = useComputed$(() =>
      _.type == "local"
        ? streaming.local.stream
        : _.type == "screensharing"
          ? streaming.screensharing?.stream
          : streaming.peer_videos[_.type.id]?.stream,
    );

    useVisibleTask$(({ track }) => {
      const s = track(stream);
      const v = track(video);
      if (!v) return;
      if (!s) return;
      v.srcObject = s;
    });

    return (
      <div class="relative h-full w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
        <div class="absolute bottom-2 left-2 z-10 rounded-lg bg-white/70 px-4 py-2 text-sm leading-none tracking-tight dark:bg-black/70">
          {name.value}
        </div>

        <div class="absolute left-0 top-1/2 w-full -translate-y-1/2 ">
          {stream.value ? (
            <div class="relative">
              <video ref={video} class="w-full" autoplay muted={_.muted} />
            </div>
          ) : (
            <div class="flex flex-col items-center ">
              {/* <LoadAnimation /> */}
              Loading...
            </div>
          )}
        </div>
      </div>
    );
  },
);
