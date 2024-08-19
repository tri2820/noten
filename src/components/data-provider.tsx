import {
  component$,
  createContextId,
  implicit$FirstArg,
  noSerialize,
  NoSerialize,
  QRL,
  Slot,
  Tracker,
  useContext,
  useContextProvider,
  useResource$,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  createBrowserClient,
  createServerClient,
} from "./supabase/supabase-auth-helpers-qwik";
import { Channel } from "./chat-sidebar";
import { Note } from "./library-sidebar";

export type DataContext = {
  channels: Channel[];
  notes: Note[];
  profile: {
    [id: string]:
      | {
          id: string;
          name: string;
          avatar: string;
          created_at: Date;
        }
      | undefined;
  };
};
export const DataContext = createContextId<DataContext>("data");
export default component$(() => {
  const store = useStore<DataContext>({
    profile: {},
    channels: [
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
    ],
    notes: [
      {
        id: "1",
        title: "Why the dinosaurs disappeared",
        content: "Content 1",
        created_at: new Date(),
      },
      {
        id: "2",
        title: "The Secret Life of Batteries",
        content: "Content 2",
        created_at: new Date("2022-01-01"),
      },
      {
        id: "3",
        title: "The Mysterious Case of the Missing Pizza",
        content: "Content 3",
        created_at: new Date("2022-01-02"),
      },
      {
        id: "4",
        title: "The Great Internet Meme Heist",
        content: "",
        created_at: new Date("2022-01-03"),
      },
      {
        id: "5",
        title: "The Great Wall of China",
        content: "Content 4",
        created_at: new Date("2022-01-04"),
      },
      {
        id: "6",
        title: "The Great Fire of London",
        content: "Content 5",
        created_at: new Date("2022-01-05"),
      },
      {
        id: "7",
        title: "The Great Barrier Reef",
        content: "Content 6",
        created_at: new Date("2022-01-06"),
      },
      {
        id: "8",
        title: "The Great Lakes",
        content: "Content 7",
        created_at: new Date("2022-01-07"),
      },
      {
        id: "9",
        title: "The Great Wall of Gorgan",
        content: "Content 8",
        created_at: new Date("2022-01-08"),
      },
      {
        id: "10",
        title: "The Great Rift Valley",
        content: "Content 9",
        created_at: new Date("2022-01-09"),
      },
      {
        id: "11",
        title: "The Great Basin",
        content: "Content 10",
        created_at: new Date("2022-01-10"),
      },
      {
        id: "12",
        title: "The Great Plains",
        content: "Content 11",
        created_at: new Date("2022-01-11"),
      },
      {
        id: "13",
        title: "The Great Plateau of Tibet",
        content: "Content 12",
        created_at: new Date("2022-01-12"),
      },
      {
        id: "14",
        title: "The Great Victoria Desert",
        content: "Content 13",
        created_at: new Date("2022-01-13"),
      },
      {
        id: "15",
        title: "The Great Dividing Range",
        content: "Content 14",
        created_at: new Date("2022-01-14"),
      },
      {
        id: "16",
        title: "The Great Basin Desert",
        content: "Content 15",
        created_at: new Date("2022-01-15"),
      },
      {
        id: "17",
        title: "The Great Appalachian Valley",
        content: "Content 16",
        created_at: new Date("2022-01-16"),
      },
      {
        id: "18",
        title: "The Great Okavango Delta",
        content: "Content 17",
        created_at: new Date("2022-01-17"),
      },
      {
        id: "19",
        title: "The Great Barrier Reef",
        content: "Content 18",
        created_at: new Date("2022-01-18"),
      },
      {
        id: "20",
        title: "The Great Victoria Land",
        content: "Content 19",
        created_at: new Date("2022-01-19"),
      },
      {
        id: "21",
        title: "The Great Central Desert",
        content: "Content 20",
        created_at: new Date("2022-01-20"),
      },
    ],
  });
  useContextProvider(DataContext, store);

  // TODO: Cache locally

  return <Slot />;
});
