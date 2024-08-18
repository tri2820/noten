import { component$, useSignal } from "@builder.io/qwik";

export default component$((_: { value?: string }) => {
  if (_.value) return <span>{_.value}</span>;

  return (
    <div class="inline-block  animate-pulse ">
      <div class="h-[1rem] w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
});
