import {
  $,
  component$,
  createContextId,
  QRL,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import {
  LuLibrary,
  LuMessageCircle,
  LuPanelLeftClose,
  LuPlus,
  LuUsers,
} from "@qwikest/icons/lucide";

import {
  BsPeopleFill,
  BsChatFill,
  BsBookmarkFill,
} from "@qwikest/icons/bootstrap";
import data from "@emoji-mart/data/sets/14/twitter.json";
import * as Emoji from "emoji-mart";
import { UIContext } from "./use-ui-provider";

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
        <div class="absolute z-50">
          <div class="fixed">
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
        </div>
      )}
    </div>
  );
});

export default component$(() => {
  const ui = useContext(UIContext);
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
    {
      id: "5",
      title: "The Great Wall of China",
      content: "Content 4",
      created_at: new Date("2022-01-04"),
    },
    {
      id: "6",
      title: "The Great Fire of London",
      content: "Content 5",
      created_at: new Date("2022-01-05"),
    },
    {
      id: "7",
      title: "The Great Barrier Reef",
      content: "Content 6",
      created_at: new Date("2022-01-06"),
    },
    {
      id: "8",
      title: "The Great Lakes",
      content: "Content 7",
      created_at: new Date("2022-01-07"),
    },
    {
      id: "9",
      title: "The Great Wall of Gorgan",
      content: "Content 8",
      created_at: new Date("2022-01-08"),
    },
    {
      id: "10",
      title: "The Great Rift Valley",
      content: "Content 9",
      created_at: new Date("2022-01-09"),
    },
    {
      id: "11",
      title: "The Great Basin",
      content: "Content 10",
      created_at: new Date("2022-01-10"),
    },
    {
      id: "12",
      title: "The Great Plains",
      content: "Content 11",
      created_at: new Date("2022-01-11"),
    },
    {
      id: "13",
      title: "The Great Plateau of Tibet",
      content: "Content 12",
      created_at: new Date("2022-01-12"),
    },
    {
      id: "14",
      title: "The Great Victoria Desert",
      content: "Content 13",
      created_at: new Date("2022-01-13"),
    },
    {
      id: "15",
      title: "The Great Dividing Range",
      content: "Content 14",
      created_at: new Date("2022-01-14"),
    },
    {
      id: "16",
      title: "The Great Basin Desert",
      content: "Content 15",
      created_at: new Date("2022-01-15"),
    },
    {
      id: "17",
      title: "The Great Appalachian Valley",
      content: "Content 16",
      created_at: new Date("2022-01-16"),
    },
    {
      id: "18",
      title: "The Great Okavango Delta",
      content: "Content 17",
      created_at: new Date("2022-01-17"),
    },
    {
      id: "19",
      title: "The Great Barrier Reef",
      content: "Content 18",
      created_at: new Date("2022-01-18"),
    },
    {
      id: "20",
      title: "The Great Victoria Land",
      content: "Content 19",
      created_at: new Date("2022-01-19"),
    },
    {
      id: "21",
      title: "The Great Central Desert",
      content: "Content 20",
      created_at: new Date("2022-01-20"),
    },
  ]);
  return (
    <div
      data-close={ui.sidebar_close}
      class="flex h-screen w-64 flex-none flex-col items-start overflow-y-hidden border-r py-4 duration-300 data-[close]:w-0 "
    >
      <div class=" flex w-full flex-none items-center space-x-2 px-4">
        <div class="text-hover flex-none">
          <button
            onClick$={() => {
              ui.sidebar_close = true;
            }}
          >
            <LuPanelLeftClose class="h-4 w-4" />
          </button>
        </div>

        <div class="flex-1" />

        <button class="text-hover flex flex-none items-center space-x-2">
          <div class="flex-none text-xs ">NOTES</div>
          <LuPlus class="h-4 w-4 flex-none" />
        </button>
      </div>

      <div class="my-4 max-w-full flex-1 overflow-y-auto overflow-x-hidden px-4 ">
        {notes.value.map((note) => (
          <div key={note.id} class="flex items-center space-x-2 py-2">
            <div class="flex-none">
              <TwemojiIcon />
            </div>

            <Link href={`/note/${note.id}`} class="text-hover flex-1 truncate">
              {note.title}
            </Link>
          </div>
        ))}
      </div>

      <div class="flex w-full items-center space-x-6">
        <div class="flex-1" />
        <div class="text-hover flex-none">
          <BsBookmarkFill />
        </div>
        <div class="text-hover flex-none">
          <BsChatFill />
        </div>
        <div class="text-hover flex-none">
          <BsPeopleFill />
        </div>
        <div class="flex-1" />
      </div>
    </div>
  );
});
