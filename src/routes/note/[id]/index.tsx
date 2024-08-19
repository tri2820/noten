import {
  $,
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import TopBar from "~/components/top-bar";

import { LocalDataContext, Note } from "~/components/local-data-provider";
import { SupabaseContext } from "~/components/supabase-provider";
import useTipTap from "~/components/use-tip-tap";
import { HEAD } from "~/utils";
import { LuLoader2 } from "@qwikest/icons/lucide";

const templates: { [id: string]: string } = {
  blank: "",
  wiki: `<h2>
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
        </blockquote>`,
};

export default component$(() => {
  const ref = useSignal<HTMLElement>();
  const tiptap = useTipTap(ref);
  const supabase = useContext(SupabaseContext);
  const hide_tiptap = useSignal(false);
  const localData = useContext(LocalDataContext);
  const note = useSignal<Note>();

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
    // TipTap is already loaded and prepared for a specific doc_id,
    //that's why we need to versioning the init_state (doc_id) to avoid mismatch and override
    tiptap.init_state = {
      data: _select.data.state,
      doc_id: _select.data.id,
    };
    tiptap.ready = true;
    hide_tiptap.value = _select.data.state ? false : true;

    cleanup(() => {
      note.value = undefined;
      tiptap.init_state = undefined;
      tiptap.ready = false;
    });
  });

  const select_template = $(async (id: string) => {
    const body = templates[id];
    if (!body === undefined) return;
    // TODO: check state is still empty in DB
    tiptap.editor!.commands.setContent(body);
    hide_tiptap.value = false;
  });

  return (
    <div class="flex h-screen flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-900">
      <TopBar>
        <div class="flex items-center space-x-2">
          <div class="text-lg font-medium">{note.value?.name}</div>
          {tiptap.loading && <LuLoader2 class="h-4 w-4 animate-spin" />}
        </div>
      </TopBar>

      <div class="flex flex-1 flex-col overflow-y-auto">
        <div
          data-hidden={hide_tiptap.value}
          ref={ref}
          class="flex flex-1 flex-col data-[hidden]:hidden"
        />

        {hide_tiptap.value && tiptap.editor && (
          <div class="m-auto w-full max-w-[600px] space-y-8">
            <div class="space-y-4">
              <div class="text-center text-4xl font-bold">
                Pick your template
              </div>
              <div class="text-center text-neutral-500">
                Start writing right away - pick a template below.
              </div>
            </div>

            <div class="space-y-4">
              <div
                class="bg-hover w-full cursor-pointer space-y-2"
                onClick$={() => {
                  select_template("blank");
                }}
              >
                <div class="space-y-1 border p-4">
                  <div class="font-bold">Blank</div>
                  <div>
                    A blank slate. Start writing without any distractions.
                  </div>
                </div>
              </div>

              <div
                class="bg-hover w-full cursor-pointer space-y-2"
                onClick$={() => {
                  select_template("wiki");
                }}
              >
                <div class="space-y-1 border p-4">
                  <div class="font-bold">Wiki</div>
                  <div>
                    Create a collaborative documentation with sections and
                    subsections.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = HEAD;
