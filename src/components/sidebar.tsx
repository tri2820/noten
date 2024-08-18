import { component$, useComputed$, useContext } from "@builder.io/qwik";
import { LuPanelLeftClose } from "@qwikest/icons/lucide";

import { BsBookmarkFill, BsChatFill } from "@qwikest/icons/bootstrap";
import chatSidebar from "./chat-sidebar";
import librarySidebar from "./library-sidebar";
import { UIContext } from "./use-ui-provider";

export default component$(() => {
  const ui = useContext(UIContext);
  const S = useComputed$(() => {
    return {
      library: librarySidebar,
      chat: chatSidebar,
    }[ui.sidebar_mode];
  });

  return (
    <div
      data-close={ui.sidebar_close}
      class="flex h-screen w-64 flex-none flex-col items-start overflow-y-hidden border-r duration-300 data-[close]:w-0 "
    >
      <S.value>
        <div class=" flex h-14 w-full flex-none items-center space-x-2 border-b px-4">
          <div class="text-hover flex-none">
            <button
              onClick$={() => {
                ui.sidebar_close = true;
              }}
            >
              <LuPanelLeftClose class="h-4 w-4" />
            </button>
          </div>

          <div class="flex-1" />
        </div>
      </S.value>

      <div class="flex w-full items-center space-x-6 py-4">
        <div class="flex-1" />
        <button
          onClick$={() => {
            ui.sidebar_mode = "library";
          }}
          class="icon-hover flex-none"
        >
          <BsBookmarkFill />
        </button>
        <button
          onClick$={() => {
            ui.sidebar_mode = "chat";
          }}
          class="icon-hover flex-none"
        >
          <BsChatFill />
        </button>
        <div class="flex-1" />
      </div>
    </div>
  );
});
