import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import TopBar from "~/components/top-bar";

import { LocalDataContext } from "~/components/local-data-provider";
import { SupabaseContext } from "~/components/supabase-provider";
import useTipTap from "~/components/use-tip-tap";
import { HEAD } from "~/utils";

export default component$(() => {
  const ref = useSignal<HTMLElement>();
  const tiptap = useTipTap(ref);
  const supabase = useContext(SupabaseContext);
  const hide_tiptap = useSignal(false);
  const localData = useContext(LocalDataContext);
  const note = useSignal<any>();

  useVisibleTask$(async ({ track, cleanup }) => {
    const id = track(localData.note_id);
    const client = track(() => supabase.client);
    if (!client) return;

    const n = localData.notes.find((x) => x.id == id);
    note.value = n;

    const _select = await client.from("note").select().eq("id", id).single();
    if (_select.error) {
      console.error("Error getting note", _select.error);
      return;
    }

    note.value = _select.data;

    console.log("_select.data.state", _select.data.state);
    tiptap.state = _select.data.state;
    tiptap.ready = true;
    // hide_tiptap.value = _select.data.state ? false : true;

    // tiptap.state = `
    //      <h2>
    //       Hi there ${l.params.id},
    //     </h2>
    //     <p>
    //       this is a basic <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
    //     </p>
    //     <ul>
    //       <li>
    //         That’s a bullet list with one …
    //       </li>
    //       <li>
    //         … or two list items.
    //       </li>
    //     </ul>
    //     <p>
    //       Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
    //     </p>
    // <pre><code class="language-css">body {
    //   display: none;
    // }</code></pre>
    //     <p>
    //       I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
    //     </p>
    //     <blockquote>
    //       Wow, that’s amazing. Good work, boy! 👏
    //       <br />
    //       — Mom
    //     </blockquote>
    //     `;

    cleanup(() => {
      note.value = undefined;
    });
  });

  return (
    <div class="flex h-screen flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-900">
      <TopBar name={note.value?.name} />

      <div class="flex flex-1 flex-col overflow-y-auto">
        <div
          data-hidden={hide_tiptap.value}
          ref={ref}
          class="flex flex-1 flex-col data-[hidden]:hidden"
        />

        {hide_tiptap.value && <div>Pick your template</div>}
      </div>
    </div>
  );
});

export const head: DocumentHead = HEAD;
