import { component$ } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import TipTap from "~/components/tip-tap";
import ThemeButton from "~/components/theme-button";
// import twemoji from "@twemoji/api";
// import data from "@emoji-mart/data";

export default component$(() => {
  const loc = useLocation();
  return (
    <div class="flex h-screen flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <div class="flex h-14 flex-none items-center space-x-2 px-4 ">
        <div class="flex-1"></div>
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
