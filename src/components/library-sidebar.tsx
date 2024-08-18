import { component$, Slot, useContext, useSignal } from "@builder.io/qwik";
import { LuPlus } from "@qwikest/icons/lucide";
import Twemoji from "./twemoji";
import { Link } from "@builder.io/qwik-city";
import { DataContext } from "./use-data-provider";

export type Note = {
  id: string;
  content: string;
  created_at: Date;
  title: string;
};

export default component$(() => {
  const data = useContext(DataContext);

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
            {data.notes.map((note) => (
              <div key={note.id} class="flex items-center space-x-2 py-2">
                <div class="flex-none">
                  <Twemoji />
                </div>

                <Link
                  href={`/note/${note.id}`}
                  class="text-hover flex-1 truncate"
                >
                  {note.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
});
