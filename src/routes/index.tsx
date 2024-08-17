import {
  $,
  component$,
  createContextId,
  NoSerialize,
  noSerialize,
  QRL,
  useComputed$,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { LuMoon, LuPlus, LuStickyNote, LuSun } from "@qwikest/icons/lucide";
// import twemoji from "@twemoji/api";
// import data from "@emoji-mart/data";
import data from "@emoji-mart/data/sets/14/twitter.json";
import * as Emoji from "emoji-mart";

type Note = {
  id: string;
  content: string;
  created_at: Date;
  title: string;
};

type PickerContext = {
  connect: (parent: HTMLElement, onClick$: QRL<(emoji: any) => void>) => void;
};
export const PickerContext = createContextId<PickerContext>("picker");

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

const ThemeButton = component$(() => {
  const theme = useSignal<string>("light");

  useVisibleTask$(
    () => {
      theme.value = localStorage.getItem("theme") ?? "light";
    },
    {
      strategy: "document-ready",
    },
  );
  return (
    <button
      class="flex-none"
      onClick$={() => {
        const _theme = document.documentElement.className;
        const nextTheme = _theme === "light" ? "dark" : "light";
        document.documentElement.className = nextTheme;
        localStorage.setItem("theme", nextTheme);
        theme.value = nextTheme;
      }}
    >
      {theme.value == "light" ? (
        <LuSun class="h-4 w-4" />
      ) : (
        <LuMoon class="h-4 w-4" />
      )}
    </button>
  );
});

const TipTap = component$(() => {
  const ref = useSignal<Element>();

  useVisibleTask$(({ track }) => {
    const element = track(ref);
    if (!element) return;

    const editor = new Editor({
      element,
      extensions: [StarterKit],
      editorProps: {
        attributes: {
          class:
            "prose prose-sm sm:prose-base lg:prose-lg p-8 lg:p-16 focus:outline-none prose-neutral dark:prose-invert max-w-none flex-1",
        },
      },
      content: `
    <h2>
      Hi there,
    </h2>
    <p>
      this is a basic <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
    </p>
    <ul>
      <li>
        That’s a bullet list with one …
      </li>
      <li>
        … or two list items.
      </li>
    </ul>
    <p>
      Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
    </p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
    <p>
      I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
    </p>
    <blockquote>
      Wow, that’s amazing. Good work, boy! 👏
      <br />
      — Mom
    </blockquote>
  `,
    });
  });

  return <div ref={ref} class="flex flex-1 flex-col" />;
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
    <div class="flex items-start">
      <div class="w-64 flex-none p-4">
        <div class="flex items-center space-x-2">
          <div class="flex-none text-xs ">NOTES</div>
          <LuPlus class="h-4 w-4 flex-none" />
        </div>

        <div class="py-4">
          {notes.value.map((note) => (
            <div
              key={note.id}
              class="flex items-center space-x-2 py-2 hover:cursor-pointer"
            >
              <TwemojiIcon />
              <div class="flex-1 truncate text-neutral-500 hover:text-black dark:hover:text-white">
                {note.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div class="flex h-screen flex-1 flex-col overflow-hidden border-l bg-white dark:bg-neutral-950">
        <div class="flex h-14 flex-none items-center space-x-2 px-4 ">
          <div class="flex-1"></div>
          <ThemeButton />
        </div>

        <div class="flex flex-1 flex-col overflow-y-auto">
          <TipTap />
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Noten - Note App for Filen",
  meta: [
    {
      name: "description",
      content: "The note app Filen users deserve.",
    },
  ],
};
