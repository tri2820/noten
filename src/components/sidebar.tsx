import {
  $,
  component$,
  createContextId,
  QRL,
  Slot,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import {
  LuHash,
  LuLibrary,
  LuMessageCircle,
  LuPanelLeftClose,
  LuPlus,
  LuUsers,
} from "@qwikest/icons/lucide";

import {
  BsPeopleFill,
  BsChatFill,
  BsBookmarkFill,
} from "@qwikest/icons/bootstrap";
import { UIContext } from "./use-ui-provider";
import librarySidebar from "./library-sidebar";
import chatSidebar from "./chat-sidebar";

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
      class="flex h-screen w-64 flex-none flex-col items-start overflow-y-hidden border-r py-4 duration-300 data-[close]:w-0 "
    >
      <S.value>
        <button
          onClick$={() => {
            ui.sidebar_close = true;
          }}
        >
          <LuPanelLeftClose class="h-4 w-4" />
        </button>
      </S.value>

      <div class="flex w-full items-center space-x-6">
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
