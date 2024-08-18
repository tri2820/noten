import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="animate-pulse">
      <div class="flex cursor-pointer items-start space-x-4 px-8 py-4 hover:bg-neutral-100 hover:dark:bg-neutral-800">
        <div class="h-12 w-12 flex-none rounded-lg  bg-neutral-200 dark:bg-neutral-700" />
        <div class="flex-1 space-y-1">
          <div class="flex items-center space-x-2 font-semibold">
            <div class="h-[1rem] w-16 flex-none rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div class="ml-2 h-[1rem] w-8 rounded-full bg-neutral-200 text-xs font-normal text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400" />
          </div>

          <div class="h-[1rem] w-full rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
          <div class="h-[1rem] w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
        </div>
      </div>
      <div class="flex cursor-pointer items-start space-x-4 px-8 py-4 hover:bg-neutral-100 hover:dark:bg-neutral-800">
        <div class="h-12 w-12 flex-none rounded-lg  bg-neutral-200 dark:bg-neutral-700" />
        <div class="flex-1 space-y-1">
          <div class="flex items-center space-x-2 font-semibold">
            <div class="h-[1rem] w-16 flex-none rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div class="ml-2 h-[1rem] w-8 rounded-full bg-neutral-200 text-xs font-normal text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400" />
          </div>

          <div class="h-[1rem] w-full rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
          <div class="h-[1rem] w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
        </div>
      </div>
      <div class="flex cursor-pointer items-start space-x-4 px-8 py-4 hover:bg-neutral-100 hover:dark:bg-neutral-800">
        <div class="h-12 w-12 flex-none rounded-lg  bg-neutral-200 dark:bg-neutral-700" />
        <div class="flex-1 space-y-1">
          <div class="flex items-center space-x-2 font-semibold">
            <div class="h-[1rem] w-16 flex-none rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div class="ml-2 h-[1rem] w-8 rounded-full bg-neutral-200 text-xs font-normal text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400" />
          </div>

          <div class="h-[1rem] w-full rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
          <div class="h-[1rem] w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
        </div>
      </div>
    </div>
  );
});
