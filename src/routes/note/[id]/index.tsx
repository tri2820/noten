import {
  component$,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import TipTap from "~/components/use-tip-tap";
import TopBar from "~/components/top-bar";
import { UIContext } from "~/components/use-ui-provider";
import { HEAD } from "~/utils";
import useTipTap from "~/components/use-tip-tap";

export default component$(() => {
  const loc = useLocation();
  const content = useComputed$(() => `Hey ${loc.params.id}`);
  const ui = useContext(UIContext);
  const ref = useSignal<HTMLElement>();
  const state = useTipTap(ref);

  useVisibleTask$(({ track }) => {
    const l = track(loc);
    state.content = `
     <h2>
      Hi there ${l.params.id},
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
    `;
  });

  return (
    <div class="flex h-screen flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-900">
      <TopBar name={"Just a note"} />

      <div class="flex flex-1 flex-col overflow-y-auto">
        <div ref={ref} class="flex flex-1 flex-col" />;
      </div>
    </div>
  );
});

export const head: DocumentHead = HEAD;
