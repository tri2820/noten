import { component$, Slot, useContext } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuHash, LuPlus, LuVolume2 } from "@qwikest/icons/lucide";
import { LocalDataContext } from "./local-data-provider";

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
  const localData = useContext(LocalDataContext);

  return (
    <div class="flex flex-1 flex-col items-stretch overflow-hidden slide-out-to-left">
      <Slot />

      <div class="max-w-full flex-1 space-y-8 overflow-y-auto overflow-x-hidden px-4  pt-4">
        <div class="space-y-2">
          <button class="text-hover flex flex-none items-center space-x-2">
            <div class="flex-none text-xs ">TEXT CHANNELS</div>
            <LuPlus class="h-4 w-4 flex-none" />
          </button>
          <div>
            {localData.channels
              .filter((channel) => channel.type === "text")
              .map((channel) => (
                <div
                  data-active={localData.channel_id.value === channel.id}
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
            <div class="flex-none text-xs ">VOICE CHANNELS</div>
            <LuPlus class="h-4 w-4 flex-none" />
          </button>
          <div class="">
            {localData.channels
              .filter((channel) => channel.type === "voice")
              .map((channel) => (
                <div
                  data-active={localData.channel_id.value === channel.id}
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
    </div>
  );
});
