import {
  component$,
  Slot,
  useComputed$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { LuPlus } from "@qwikest/icons/lucide";
import Twemoji from "./twemoji";
import { Link, useLocation } from "@builder.io/qwik-city";
import { LocalDataContext } from "./local-data-provider";

export type Note = {
  id: string;
  state: string;
  created_at: Date;
  name: string;
};

export default component$(() => {
  const localData = useContext(LocalDataContext);
  const loc = useLocation();
  const note_id = useComputed$(() => {
    const regex = /^\/note\/[a-f0-9-]+\//i;
    if (regex.test(loc.url.pathname)) return loc.params.id;
  });

  return (
    <>
      <Slot />

      <div class="my-4 max-w-full flex-1 overflow-y-auto overflow-x-hidden px-4 ">
        <div class="space-y-2">
          <button class="text-hover flex flex-none items-center space-x-2">
            <div class="flex-none text-xs ">NOTES</div>
            <LuPlus class="h-4 w-4 flex-none" />
          </button>
          <div>
            {localData.notes.map((note) => (
              <div
                data-active={note_id.value === note.id}
                key={note.id}
                class="text-hover flex items-center space-x-2 rounded-lg p-2 data-[active]:bg-neutral-200 data-[active]:text-black data-[active]:dark:bg-neutral-900 data-[active]:dark:text-white"
              >
                <div class="flex-none">
                  <Twemoji />
                </div>

                <Link href={`/note/${note.id}`} class="flex-1 truncate">
                  {note.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
});
