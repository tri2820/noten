import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
export const dateF = (time: string) => dayjs(time).fromNow();

export const HEAD = {
  title: "Noten",
  meta: [
    {
      name: "description",
      content: "Share stuffs online.",
    },
  ],
};
