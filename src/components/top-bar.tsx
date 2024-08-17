import {
  component$,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { UIContext } from "./use-ui-provider";
import { LuPanelLeftOpen } from "@qwikest/icons/lucide";
import ThemeButton from "./theme-button";

export default component$((_: { name: string }) => {
  const ui = useContext(UIContext);
  return (
    <div class="flex h-14 flex-none items-center space-x-2 px-4">
      {ui.sidebar_close && (
        <button
          onClick$={() => {
            ui.sidebar_close = false;
          }}
        >
          <LuPanelLeftOpen class="h-4 w-4" />
        </button>
      )}
      <div class="text-lg font-medium">{_.name}</div>

      <div class="flex-1" />
      <ThemeButton />
    </div>
  );
});
