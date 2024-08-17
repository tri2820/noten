import { component$, Slot, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuHash, LuPlus, LuVolume2 } from "@qwikest/icons/lucide";

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
  const channels = useSignal<Channel[]>([
    {
      id: "c9a22d1c-6cb6-4b7f-9e4c-5a9c7f0b7c8c",
      name: "General",
      created_at: new Date(),
      type: "text",
    },
    {
      id: "6e2f3c9a-6f4f-4f1b-8ec4-6f3f3c9a6f4f",
      name: "Rumors",
      created_at: new Date("2022-01-01"),
      type: "text",
    },
    {
      id: "9e9fafc1-9caf-4f5e-8b9f-5f5f5f5f5f5f",
      name: "Random",
      created_at: new Date("2022-01-02"),
      type: "text",
    },
    {
      id: "8c9d5f6a-6f4f-4f1b-8ec4-6f3f3c9a6f4f",
      name: "Meme Central",
      created_at: new Date("2022-01-03"),
      type: "text",
    },
    {
      id: "b11c9be1-b619-4ef5-be1b-a1cd9ef265b7",
      name: "Voice Chat",
      created_at: new Date("2022-01-07"),
      type: "voice",
    },
    {
      id: "b5e2cf01-8bb6-4fcd-ad88-0efb611195da",
      name: "Casual Chat",
      created_at: new Date("2022-01-07"),
      type: "voice",
    },
    {
      id: "caa8b54a-eb5e-4134-8ae2-a3946a428ec7",
      name: "Strategy Session",
      created_at: new Date("2022-01-08"),
      type: "voice",
    },
  ]);
  return (
    <>
      <div class=" flex w-full flex-none items-center space-x-2 px-4">
        <div class="text-hover flex-none">
          <Slot />
        </div>

        <div class="flex-1" />

        {/* <button class="text-hover flex flex-none items-center space-x-2">
          <div class="flex-none text-xs ">CHANNELS</div>
          <LuPlus class="h-4 w-4 flex-none" />
        </button> */}
      </div>

      <div class="my-4 max-w-full flex-1 space-y-8 overflow-y-auto overflow-x-hidden px-4">
        <div class="space-y-2">
          <button class="text-hover flex flex-none items-center space-x-2">
            <div class="flex-none text-xs ">TEXT CHANNELS</div>
            <LuPlus class="h-4 w-4 flex-none" />
          </button>
          <div>
            {channels.value
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
            {channels.value
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
