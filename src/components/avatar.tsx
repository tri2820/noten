import { ClassList, component$, useSignal } from "@builder.io/qwik";

export default component$((_: { src?: string; class?: ClassList }) => {
  const done = useSignal(false);
  const _class = _.class ?? "h-12 w-12 flex-none rounded-lg";

  return (
    <div>
      <div
        data-show={!done.value}
        class={
          "hidden bg-neutral-200 data-[show]:block dark:bg-neutral-700 " +
          _class
        }
      />
      <img
        data-show={done.value}
        onLoad$={() => (done.value = true)}
        {..._}
        class={"hidden border data-[show]:block " + _class}
      />
    </div>
  );
});
