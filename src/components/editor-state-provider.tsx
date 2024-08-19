import {
  $,
  component$,
  createContextId,
  QRL,
  Slot,
  useContextProvider,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";

type EditorStateContext = {
  loading: boolean;
};

export const EditorStateContext =
  createContextId<EditorStateContext>("editor-state");
export default component$(() => {
  const store = useStore<EditorStateContext>({
    loading: false,
  });

  useContextProvider(EditorStateContext, store);

  return <Slot />;
});
