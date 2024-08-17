import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { LuMoon, LuSun } from "@qwikest/icons/lucide";
import { ThemeContext } from "./use-theme-provider";

export default component$(() => {
  const _ = useContext(ThemeContext);

  return (
    <button
      class="flex-none"
      onClick$={() => {
        const _theme = document.documentElement.className;
        const nextTheme = _theme === "light" ? "dark" : "light";
        document.documentElement.className = nextTheme;
        localStorage.setItem("theme", nextTheme);
        _.theme = nextTheme;
      }}
    >
      {_.theme == "light" ? (
        <LuSun class="h-4 w-4" />
      ) : (
        <LuMoon class="h-4 w-4" />
      )}
    </button>
  );
});
