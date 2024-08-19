import { component$, Slot, useContext } from "@builder.io/qwik";
import { LuLoader, LuLoader2, LuPanelLeftOpen } from "@qwikest/icons/lucide";
import ThemeButton from "./theme-button";
import { UIContext } from "./ui-provider";
import { EditorStateContext } from "./editor-state-provider";

export default component$(() => {
  const editorState = useContext(EditorStateContext);
  const ui = useContext(UIContext);

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
      <ThemeButton />
    </div>
  );
});
