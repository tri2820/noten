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
      id: "1",
      name: "General",
      created_at: new Date(),
      type: "text",
    },
    {
      id: "2",
      name: "Rumors",
      created_at: new Date("2022-01-01"),
      type: "text",
    },
    {
      id: "3",
      name: "Random",
      created_at: new Date("2022-01-02"),
      type: "text",
    },
    {
      id: "4",
      name: "Meme Central",
      created_at: new Date("2022-01-03"),
      type: "text",
    },
    {
      id: "5",
      name: "Programming",
      created_at: new Date("2022-01-04"),
      type: "text",
    },
    {
      id: "6",
      name: "Art",
      created_at: new Date("2022-01-05"),
      type: "text",
    },
    {
      id: "7",
      name: "Music",
      created_at: new Date("2022-01-06"),
      type: "text",
    },
    {
      id: "8",
      name: "Voice Chat",
      created_at: new Date("2022-01-07"),
      type: "voice",
    },
    {
      id: "9",
      name: "Casual Chat",
      created_at: new Date("2022-01-07"),
      type: "voice",
    },
    {
      id: "10",
      name: "Strategy Session",
      created_at: new Date("2022-01-08"),
      type: "voice",
    },
    {
      id: "11",
      name: "Sales Pitch Practice",
      created_at: new Date("2022-01-09"),
      type: "voice",
    },
    {
      id: "12",
      name: "Product Meeting",
      created_at: new Date("2022-01-10"),
      type: "voice",
    },
    {
      id: "13",
      name: "Design Discussion",
      created_at: new Date("2022-01-11"),
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
