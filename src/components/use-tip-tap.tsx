import {
  component$,
  Signal,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { Content, Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

export default (ref: Signal<HTMLElement | undefined>) => {
  const store = useStore<{ content?: string }>({});

  useVisibleTask$(({ track, cleanup }) => {
    const element = track(ref);
    const content = track(() => store.content);
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
      content,
    });

    cleanup(() => {
      editor.destroy();
    });
  });

  return store;
};
