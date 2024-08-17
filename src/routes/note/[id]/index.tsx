import { component$, useContext } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import TipTap from "~/components/tip-tap";
import TopBar from "~/components/top-bar";
import { UIContext } from "~/components/use-ui-provider";

export default component$(() => {
  const loc = useLocation();
  const ui = useContext(UIContext);

  return (
    <div class="flex h-screen flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-900">
      <TopBar name={"Just a note"} />

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
