import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
export const dateF = (time: Parameters<typeof dayjs>[0]) =>
  dayjs(time).fromNow();

export function convertChannelNameToSlug(channelName: string): string {
  return channelName
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export const HEAD = {
  title: "Noten",
  meta: [
    {
      name: "description",
      content: "Share stuffs online.",
    },
  ],
};
