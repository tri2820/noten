import {
  component$,
  createContextId,
  Signal,
  Slot,
  useComputed$,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export type Channel = {
  id: string;
  name: string;
  created_at: Date;
  type: "text" | "voice";
};

export type Note = {
  id: string;
  name: string;
  created_at: Date;
  state?: string;
};

export type LocalDataContext = {
  note_id: Signal<string | undefined>;
  channel_id: Signal<string | undefined>;
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
export const LocalDataContext = createContextId<LocalDataContext>("local-data");
export default component$(() => {
  const loc = useLocation();
  const note_id = useComputed$(() => {
    const regex = /^\/note\/[a-f0-9-]+\//i;
    if (regex.test(loc.url.pathname)) return loc.params.id;
  });

  const channel_id = useComputed$(() => {
    const regex = /^\/channel\/[a-f0-9-]+\//i;
    if (regex.test(loc.url.pathname)) return loc.params.id;
  });

  const store = useStore<LocalDataContext>({
    note_id,
    channel_id,
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
    notes: [],
  });
  useContextProvider(LocalDataContext, store);

  // TODO: Cache locally

  return <Slot />;
});
