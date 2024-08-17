import { component$, Slot, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuHash, LuPlus } from "@qwikest/icons/lucide";

type Channel = {
  id: string;
  title: string;
  created_at: Date;
};
export default component$(() => {
  const channels = useSignal<Channel[]>([
    {
      id: "1",
      title: "General",
      created_at: new Date(),
    },
    {
      id: "2",
      title: "Rumors",
      created_at: new Date("2022-01-01"),
    },
    {
      id: "3",
      title: "Random",
      created_at: new Date("2022-01-02"),
    },
    {
      id: "4",
      title: "Meme Central",
      created_at: new Date("2022-01-03"),
    },
    {
      id: "5",
      title: "Programming",
      created_at: new Date("2022-01-04"),
    },
    {
      id: "6",
      title: "Art",
      created_at: new Date("2022-01-05"),
    },
    {
      id: "7",
      title: "Music",
      created_at: new Date("2022-01-06"),
    },
  ]);
  return (
    <>
      <div class=" flex w-full flex-none items-center space-x-2 px-4">
        <div class="text-hover flex-none">
          <Slot />
        </div>

        <div class="flex-1" />

        <button class="text-hover flex flex-none items-center space-x-2">
          <div class="flex-none text-xs ">CHANNELS</div>
          <LuPlus class="h-4 w-4 flex-none" />
        </button>
      </div>

      <div class="my-4 max-w-full flex-1 overflow-y-auto overflow-x-hidden px-4 ">
        {channels.value.map((channel) => (
          <div
            key={channel.id}
            class="text-hover flex items-center space-x-2 py-2"
          >
            <div class="flex-none">
              <LuHash class="h-4 w-4" />
            </div>

            <Link href={`/channel/${channel.id}`} class=" flex-1 truncate">
              {channel.title}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
});
