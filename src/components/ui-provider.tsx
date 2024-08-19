import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import Cookies from "js-cookie";

export type UIContext = {
  theme: string;
  sidebar_close: boolean;
  sidebar_mode: "library" | "chat";
};
export const UIContext = createContextId<UIContext>("ui");

export default component$((_: { ui: UIContext }) => {
  const store = useStore<UIContext>(_.ui);
  useContextProvider(UIContext, store);
  useVisibleTask$(({ track }) => {
    track(store);
    const s = JSON.stringify(store);
    Cookies.set("ui", s);
  });

  return <Slot />;
});
