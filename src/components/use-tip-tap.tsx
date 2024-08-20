import {
  noSerialize,
  NoSerialize,
  render,
  Signal,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Editor } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { LocalDataContext } from "./local-data-provider";
import { SupabaseContext } from "./supabase-provider";
import TiptapCollabProvider from "./tiptap-collab-provider";

const colors = [
  { name: "red", background: "#b91c1c" },
  { name: "red", background: "#b91c1c" },
  { name: "blue", background: "#1d4ed8" },
  { name: "orange", background: "#c2410c" },
  { name: "green", background: "#15803d" },
  { name: "teal", background: "#0f766e" },
  { name: "yellow", background: "#a16207" },
  { name: "purple", background: "#7e22ce" },
  { name: "indigo", background: "#4338ca" },
  { name: "pink", background: "#be185d" },
];

const funnyNames = [
  "Cat Lord",
  "Pupper",
  "Lord McSneeze",
  "Viking Queen",
  "Space Cowboy",
  "Professor Paws",
  "Ninja Wizard",
  "Pirate King",
  "Robot Butler",
  "Superhero",
  "Burger Master",
  "Pizza Ninja",
  "Coffee King",
  "Donut Lord",
];

export const Cursor = ({ user }: { user: any }) => {
  return (
    <div
      class="absolute left-0 top-0 block h-full w-[0.2rem] select-none  rounded-b"
      style={{
        backgroundColor:
          colors[user.color_index]?.background ?? colors[0].background,
      }}
    >
      <div class="absolute -top-[32px] left-0">
        <div
          class=" rounded-r rounded-t px-1 text-sm"
          style={{
            backgroundColor:
              colors[user.color_index]?.background ?? colors[0].background,
            color: "#fff",
          }}
        >
          <p class="text-nowrap text-normal whitespace-nowrap font-normal">
            {user.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export const renderCursor = (user: any) => {
  const parent = document.createElement("span");
  parent.style.position = "relative";
  render(parent, <Cursor user={user} />);
  return parent;
};

export default (ref: Signal<HTMLElement | undefined>) => {
  const localData = useContext(LocalDataContext);
  const store = useStore<{
    init_state?: {
      data: string;
      doc_id: string;
    };
    loading: boolean;
    last_updated?: Date;
    editor?: NoSerialize<Editor>;
  }>({
    loading: false,
  });
  const supabase = useContext(SupabaseContext);

  useVisibleTask$(({ track, cleanup }) => {
    const client = track(() => supabase.client);
    const user = track(() => supabase.user);
    const profile = track(() => supabase.profile);
    const element = track(ref);
    const id = track(localData.note_id);
    const init_state = track(() => store.init_state);

    if (!client) return;
    if (!user) return;
    if (!profile) return;
    if (!element) return;
    if (!id) return;
    if (!init_state) return;
    if (init_state.doc_id != id) return;

    const provider = new TiptapCollabProvider(
      client,
      id,
      init_state.data,
      async (state) => {
        console.log("saving...");
        store.loading = true;
        await (async () => {
          const _update = await client
            .from("note")
            .update({ state })
            .eq("id", id);
        })();
        store.last_updated = new Date();
        store.loading = false;
      },
    );

    console.log("creating...", provider);
    const editor = new Editor({
      element,
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Placeholder.configure({
          placeholder: "Write something…",
        }),
        Collaboration.configure({
          document: provider.doc,
        }),
        CollaborationCursor.configure({
          provider,
          render: renderCursor,
          user: {
            id: user.id,
            name: profile.name,
            color_index: Math.floor(Math.random() * colors.length),
            // key `color` is somehow set automatically, but we don't use it
          },
        }),
      ],
      editorProps: {
        attributes: {
          class:
            "prose prose-sm sm:prose-base lg:prose-lg p-8 lg:p-16 focus:outline-none prose-neutral dark:prose-invert max-w-none flex-1",
        },
      },
    });

    store.editor = noSerialize(editor);

    cleanup(() => {
      editor.destroy();
      provider?.destroy();
      store.editor = undefined;
      store.loading = false;
      store.last_updated = undefined;
    });
  });

  return store;
};
