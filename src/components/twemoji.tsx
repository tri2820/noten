import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import EmojiPicker from "./emoji-picker";

export default component$(() => {
  const show = useSignal<{
    x: number;
    y: number;
    isInLowerHalf: boolean;
  }>();
  const unified = useSignal<string>("1f4d4");
  const src = useComputed$<string | undefined>(() =>
    unified.value
      ? `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/${unified.value}.png`
      : undefined,
  );
  const ref = useSignal<HTMLElement>();

  return (
    <div class="relative ">
      <button
        ref={ref}
        class="rounded-lg p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-900 "
        onClick$={() => {
          console.log("me clicked");
          const { bottom, right } = ref.value!.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const middle = windowHeight / 2;
          const isInLowerHalf = bottom > middle;
          show.value = {
            x: right,
            y: bottom,
            isInLowerHalf,
          };
        }}
      >
        <img src={src.value} class="h-4 w-4" />
      </button>

      {show.value && (
        <div
          data-adjust={show.value.isInLowerHalf}
          class="fixed data-[adjust]:-translate-y-full"
          style={{
            top: `${show.value.y}px`,
            left: `${show.value.x}px`,
          }}
        >
          <EmojiPicker
            onClickOutside={$(() => {
              show.value = undefined;
            })}
            onEmojiSelect={$((emoji) => {
              unified.value = emoji.unified;
              console.log("emoji.unified", emoji.unified);
            })}
          />
        </div>
      )}
    </div>
  );
});
