import {
  createContextId,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

type UIContext = {
  theme: string;
  sidebar_close: boolean;
  sidebar_mode: "library" | "chat";
};
export const UIContext = createContextId<UIContext>("ui");

export default () => {
  const store = useStore<UIContext>({
    theme: "light",
    sidebar_close: false,
    sidebar_mode: "library",
  });
  useContextProvider(UIContext, store);
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
