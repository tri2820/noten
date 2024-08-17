import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { Content, Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

export default component$((_: { content?: Content }) => {
  const loc = useLocation();
  const ref = useSignal<Element>();

  useVisibleTask$(({ track, cleanup }) => {
    track(loc);
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
      content: _.content,
    });

    cleanup(() => {
      editor.destroy();
    });
  });

  return <div ref={ref} class="flex flex-1 flex-col" />;
});
