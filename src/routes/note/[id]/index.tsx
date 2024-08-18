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
    state.content = `hey ${l.params.id}`;
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
