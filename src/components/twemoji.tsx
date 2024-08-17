import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import EmojiPicker from "./emoji-picker";

export default component$(() => {
  const show = useSignal(false);
  const unified = useSignal<string>("1f4d4");
  const src = useComputed$<string | undefined>(() =>
    unified.value
      ? `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/${unified.value}.png`
      : undefined,
  );

  return (
    <div class="relative ">
      <button
        class="rounded-lg p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-900 "
        onClick$={() => {
          console.log("me clicked");
          show.value = true;
        }}
      >
        <img src={src.value} class="h-4 w-4" />
      </button>

      {show.value && (
        <div class="absolute z-50">
          <div class="fixed">
            <EmojiPicker
              onClickOutside={$(() => {
                show.value = false;
              })}
              onEmojiSelect={$((emoji) => {
                unified.value = emoji.unified;
                console.log("emoji.unified", emoji.unified);
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
});
