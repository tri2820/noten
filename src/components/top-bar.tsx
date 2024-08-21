import { component$, Slot, useContext } from "@builder.io/qwik";
import { LuPanelLeftOpen } from "@qwikest/icons/lucide";
import ThemeButton from "./theme-button";
import { UIContext } from "./ui-provider";
import Avatar from "./avatar";
import { SupabaseContext } from "./supabase-provider";

export default component$(() => {
  const ui = useContext(UIContext);
  const supabase = useContext(SupabaseContext);
  return (
    <div class="flex h-14 flex-none items-center space-x-2 border-b px-4">
      {ui.sidebar_close && (
        <button
          onClick$={() => {
            ui.sidebar_close = false;
          }}
        >
          <LuPanelLeftOpen class="h-4 w-4" />
        </button>
      )}

      <Slot />

      <div class="flex-1" />
      <div class="flex-none">
        <Avatar class="h-8 w-8 rounded-lg" src={supabase.profile?.avatar} />
      </div>
      <ThemeButton />
    </div>
  );
});
