import { component$, useComputed$, useContext } from "@builder.io/qwik";
import { LuPanelLeftClose } from "@qwikest/icons/lucide";

import { BsBookmarkFill, BsChatFill } from "@qwikest/icons/bootstrap";
import chatSidebar from "./chat-sidebar";
import librarySidebar from "./library-sidebar";
import { UIContext } from "./ui-provider";
import { SupabaseContext } from "./supabase-provider";
import Avatar from "./avatar";

export default component$(() => {
  // const supabase = useContext(SupabaseContext);
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
      class="flex h-screen w-64 flex-none flex-col items-stretch border-r duration-300 data-[close]:w-0 "
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

      <div class="flex w-full items-center space-x-6 p-4">
        <div class="flex-1" />
        <button
          onClick$={() => {
            ui.sidebar_mode = "library";
          }}
          data-active={ui.sidebar_mode === "library"}
          class="icon-hover flex-none data-[active]:text-black data-[active]:dark:text-white"
        >
          <BsBookmarkFill />
        </button>
        <button
          onClick$={() => {
            ui.sidebar_mode = "chat";
          }}
          data-active={ui.sidebar_mode === "chat"}
          class="icon-hover flex-none data-[active]:text-black data-[active]:dark:text-white"
        >
          <BsChatFill />
        </button>
        <div class="flex-1" />

        {/* <div>{supabase.profile?.name}</div> */}
        {/* <div class="flex-none">
          <Avatar class="h-8 w-8 rounded-lg" src={supabase.profile?.avatar} />
        </div> */}
      </div>
    </div>
  );
});
