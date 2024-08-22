import {
  $,
  component$,
  NoSerialize,
  QRL,
  Slot,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  Device,
  VoiceChannelContext,
  VoiceChannelManagerContext,
} from "./voice-channel-provider";
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

// my_device, device, vc.voice_channel.screensharing...
export default component$(
  (_: {
    vkey: "screensharing" | "video";
    device: NonNullable<NoSerialize<Device>>;
    muted?: boolean;
    shadow?: boolean;
  }) => {
    const manager = useContext(VoiceChannelManagerContext);
    const video = useSignal<HTMLVideoElement>();
    const store = useStore<{
      done: boolean;
    }>({
      done: false,
    });

    useVisibleTask$(async ({ track }) => {
      const join = track(() => manager.join);
      if (!join) return;
      await join(_.device.channel_id);

      const my_device = manager.my[_.device.channel_id];
      if (!my_device) {
        console.warn("No my_device");
        return;
      }

      const updateStream = async (my_device: Device) => {
        if (!video.value) {
          console.warn("Video element not found");
          return;
        }

        store.done = false;
        if (
          _.device.channel_id == my_device.channel_id &&
          my_device.device_id == _.device.device_id
        ) {
          // Same device, use my_device to have high-quality video
          video.value.srcObject = my_device.video
            .stream as MediaProvider | null;
        } else {
          if (!_.device[_.vkey].tracks) {
            console.info("Track gone"), (video.value.srcObject = null);
            return;
          }
          await _.device.pull(_.vkey);
          video.value.srcObject = _.device.video.stream as MediaProvider | null;
        }
        store.done = true;
      };

      updateStream(my_device);
      _.device.target.addEventListener(`${_.vkey}_changed`, () => {
        updateStream(my_device);
      });
    });

    return (
      <div class="relative h-full w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
        <div class="absolute bottom-0 left-0 right-0 z-10 ">
          <div
            data-shadow={_.shadow}
            class="relative h-full w-full p-2 data-[shadow]:pb-1 data-[shadow]:pt-8 data-[shadow]:text-white"
          >
            {_.shadow && (
              <div class="to-95%% absolute bottom-0 left-0 right-0 top-0 -z-10 bg-gradient-to-t from-black/75" />
            )}

            <div class="flex items-center space-x-2">
              <div
                data-bgtype={_.shadow ? "minimal" : "normal"}
                class="flex-none rounded-lg   py-2 text-sm leading-none tracking-tight data-[bgtype=normal]:bg-white/70 data-[bgtype=minimal]:px-2 data-[bgtype=normal]:px-4 data-[bgtype=normal]:dark:bg-black/70"
              >
                {_.device?.user_name}
              </div>

              <Slot />
            </div>
          </div>
        </div>

        <div class="absolute left-0 top-1/2 w-full -translate-y-1/2 ">
          <div class="relative h-full w-full ">
            <video ref={video} class="w-full" autoplay muted={_.muted} />
            {!store.done && (
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
