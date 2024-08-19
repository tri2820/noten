import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { LuMoon, LuSun } from "@qwikest/icons/lucide";
import { UIContext } from "./ui-provider";

export default component$(() => {
  const ui = useContext(UIContext);

  return (
    <button
      class="flex-none"
      onClick$={() => {
        const _theme = document.documentElement.className;
        const nextTheme = _theme === "light" ? "dark" : "light";
        document.documentElement.className = nextTheme;
        localStorage.setItem("theme", nextTheme);
        ui.theme = nextTheme;
      }}
    >
      {ui.theme == "light" ? (
        <LuSun class="h-4 w-4" />
      ) : (
        <LuMoon class="h-4 w-4" />
      )}
    </button>
  );
});
