import {
  component$,
  Slot,
  useComputed$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { LuHash, LuPlus, LuVolume2 } from "@qwikest/icons/lucide";
import { DataContext } from "./data-provider";

export type Channel = {
  id: string;
  name: string;
  created_at: Date;
  type: "text" | "voice";
};

function convertChannelNameToSlug(channelName: string): string {
  return channelName
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default component$(() => {
  const loc = useLocation();
  const channel_id = useComputed$(() => {
    const regex = /^\/channel\/[a-f0-9-]+\//i;
    if (regex.test(loc.url.pathname)) return loc.params.id;
  });
  const data = useContext(DataContext);

  return (
    <>
      <Slot />

      <div class="my-4 max-w-full flex-1 space-y-8 overflow-y-auto overflow-x-hidden  px-4">
        <div class="space-y-2">
          <button class="text-hover flex flex-none items-center space-x-2">
            <div class="flex-none text-xs ">TEXT CHANNELS</div>
            <LuPlus class="h-4 w-4 flex-none" />
          </button>
          <div>
            {data.channels
              .filter((channel) => channel.type === "text")
              .map((channel) => (
                <div
                  data-active={channel_id.value === channel.id}
                  key={channel.id}
                  class="text-hover flex items-center space-x-2 rounded-lg p-2 data-[active]:bg-neutral-200 data-[active]:text-black data-[active]:dark:bg-neutral-900 data-[active]:dark:text-white"
                >
                  <div class="flex-none">
                    <LuHash class="h-4 w-4" />
                  </div>

                  <Link
                    href={`/channel/${channel.id}`}
                    class=" flex-1 truncate"
                  >
                    {convertChannelNameToSlug(channel.name)}
                  </Link>
                </div>
              ))}
          </div>
        </div>

        <div class="space-y-2 ">
          <button class="text-hover flex flex-none items-center space-x-2">
            <div class="flex-none text-xs ">TEXT CHANNELS</div>
            <LuPlus class="h-4 w-4 flex-none" />
          </button>
          <div class="">
            {data.channels
              .filter((channel) => channel.type === "voice")
              .map((channel) => (
                <div
                  data-active={channel_id.value === channel.id}
                  key={channel.id}
                  class="text-hover flex items-center space-x-2 rounded-lg p-2 data-[active]:bg-neutral-200 data-[active]:text-black data-[active]:dark:bg-neutral-900 data-[active]:dark:text-white"
                >
                  <div class="flex-none">
                    <LuVolume2 class="h-4 w-4" />
                  </div>

                  <Link
                    href={`/channel/${channel.id}`}
                    class=" flex-1 truncate"
                  >
                    {convertChannelNameToSlug(channel.name)}
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
});
