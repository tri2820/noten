import { component$, useContext, useSignal } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { LuPanelLeftOpen } from "@qwikest/icons/lucide";
import { Channel } from "~/components/chat-sidebar";
import ThemeButton from "~/components/theme-button";
import { UIContext } from "~/components/use-ui-provider";

const ChannelView = component$((_: { id: string }) => {
  const channel = useSignal<Channel>({
    id: "1",
    created_at: new Date(),
    name: "General",
    type: "text",
  });

  return (
    <div class="flex-1 p-4">
      {_.id} {JSON.stringify(channel.value)}
    </div>
  );
});

export default component$(() => {
  const loc = useLocation();
  const ui = useContext(UIContext);

  return (
    <div class="flex h-screen flex-1 flex-col overflow-hidden bg-neutral-200 dark:bg-black">
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

      <ChannelView id={loc.params.id} />
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
