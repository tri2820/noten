import {
  $,
  component$,
  createContextId,
  QRL,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuPlus } from "@qwikest/icons/lucide";
import data from "@emoji-mart/data/sets/14/twitter.json";
import * as Emoji from "emoji-mart";

type Note = {
  id: string;
  content: string;
  created_at: Date;
  title: string;
};

const Picker = component$(
  (_: {
    onEmojiSelect: QRL<(emoji: any) => void>;
    onClickOutside: QRL<() => void>;
  }) => {
    const ref = useSignal<HTMLElement>();
    useVisibleTask$(({ track }) => {
      const container = track(ref);
      if (!container) return;
      const picker = new Emoji.Picker({
        onEmojiSelect: _.onEmojiSelect,
        onClickOutside: _.onClickOutside,
        set: "twitter",
        data,
      });
      container.appendChild(picker as any);
    });

    return <div ref={ref}></div>;
  },
);

const TwemojiIcon = component$(() => {
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
        <div class="absolute bottom-0 right-0 z-50 translate-x-full translate-y-full">
          <Picker
            onClickOutside={$(() => {
              show.value = false;
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

export default component$(() => {
  const notes = useSignal<Note[]>([
    {
      id: "1",
      title: "Why the dinosaurs disappeared",
      content: "Content 1",
      created_at: new Date(),
    },
    {
      id: "2",
      title: "The Secret Life of Batteries",
      content: "Content 2",
      created_at: new Date("2022-01-01"),
    },
    {
      id: "3",
      title: "The Mysterious Case of the Missing Pizza",
      content: "Content 3",
      created_at: new Date("2022-01-02"),
    },
    {
      id: "4",
      title: "The Great Internet Meme Heist",
      content: "",
      created_at: new Date("2022-01-03"),
    },
  ]);
  return (
    <div class="min-h-screen w-64 flex-none border-r p-4">
      <button class="text-hover flex items-center space-x-2">
        <div class="flex-none text-xs ">NOTES</div>
        <LuPlus class="h-4 w-4 flex-none" />
      </button>

      <div class="py-4">
        {notes.value.map((note) => (
          <Link
            key={note.id}
            href={`/note/${note.id}`}
            class="flex items-center space-x-2 py-2"
          >
            <TwemojiIcon />
            <div class="text-hover flex-1 truncate">{note.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
});
