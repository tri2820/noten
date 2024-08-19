import {
  $,
  component$,
  useComputed$,
  useSignal,
  useStore,
} from "@builder.io/qwik";
import EmojiPicker from "./emoji-picker";

export default component$(() => {
  const store = useStore<{
    show: boolean;
    top: number;
    left: number;
  }>({
    show: false,
    top: 0,
    left: 0,
  });
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

          store.top = bottom;
          store.left = right;
          store.show = true;
        }}
      >
        <img src={src.value} class="h-4 w-4" />
      </button>

      {store.show && (
        <EmojiPicker
          top={store.top}
          left={store.left}
          onClickOutside={$(() => {
            store.show = false;
          })}
          onEmojiSelect={$((emoji) => {
            unified.value = emoji.unified;
            console.log("emoji.unified", emoji.unified);
          })}
        />
      )}
    </div>
  );
});
