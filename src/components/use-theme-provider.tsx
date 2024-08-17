import {
  createContextId,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

type ThemeContext = {
  theme: string;
};
export const ThemeContext = createContextId<ThemeContext>("theme");

export default () => {
  const store = useStore<ThemeContext>({
    theme: "light",
  });
  useContextProvider(ThemeContext, store);
  useVisibleTask$(
    () => {
      store.theme = localStorage.getItem("theme") ?? "light";
    },
    {
      strategy: "document-ready",
    },
  );
  return store;
};
