import { component$, Slot, useContext } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuPlus } from "@qwikest/icons/lucide";
import { LocalDataContext } from "./local-data-provider";
import Twemoji from "./twemoji";

export default component$(() => {
  const localData = useContext(LocalDataContext);

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
                data-active={localData.note_id.value === note.id}
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
