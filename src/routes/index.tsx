import { component$, useContext } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import TipTap from "~/components/use-tip-tap";
import TopBar from "~/components/top-bar";
import { UIContext } from "~/components/use-ui-provider";
import { HEAD } from "~/utils";

export default component$(() => {
  const ui = useContext(UIContext);

  return (
    <div class="flex h-screen flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-900">
      <TopBar name="Home" />

      <div class="flex flex-1 flex-col overflow-y-auto"></div>
    </div>
  );
});

export const head: DocumentHead = HEAD;
