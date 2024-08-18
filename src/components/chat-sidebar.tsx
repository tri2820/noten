import { component$, Slot, useContext, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuHash, LuPlus, LuVolume2 } from "@qwikest/icons/lucide";
import { DataContext } from "./use-data-provider";

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
  const data = useContext(DataContext);

  return (
    <>
      <Slot />

      <div class="my-4 max-w-full flex-1 space-y-8 overflow-y-auto overflow-x-hidden px-4">
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
                  key={channel.id}
                  class="text-hover flex items-center space-x-2 py-2"
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

        <div class="space-y-2">
          <button class="text-hover flex flex-none items-center space-x-2">
            <div class="flex-none text-xs ">TEXT CHANNELS</div>
            <LuPlus class="h-4 w-4 flex-none" />
          </button>
          <div>
            {data.channels
              .filter((channel) => channel.type === "voice")
              .map((channel) => (
                <div
                  key={channel.id}
                  class="text-hover flex items-center space-x-2 py-2"
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
