import { component$, useContext } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { LuPanelLeftOpen } from "@qwikest/icons/lucide";
import ThemeButton from "~/components/theme-button";
import TipTap from "~/components/tip-tap";
import { UIContext } from "~/components/use-ui-provider";

export default component$(() => {
  const loc = useLocation();
  const ui = useContext(UIContext);

  return (
    <div class="flex h-screen flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-900">
      <div class="flex h-14 flex-none items-center space-x-2 px-4 ">
        {ui.sidebar_close && (
          <button
            onClick$={() => {
              ui.sidebar_close = false;
            }}
          >
            <LuPanelLeftOpen class="h-4 w-4" />
          </button>
        )}
        <div class="flex-1" />
        <ThemeButton />
      </div>

      <div class="flex flex-1 flex-col overflow-y-auto">
        <TipTap content={`Hey ${loc.params.id}`} />
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
