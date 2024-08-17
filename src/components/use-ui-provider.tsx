import {
  createContextId,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

type UIContext = {
  theme: string;
  sidebar_close: boolean;
};
export const UIContext = createContextId<UIContext>("ui");

export default () => {
  const store = useStore<UIContext>({
    theme: "light",
    sidebar_close: false,
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
