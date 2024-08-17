import { component$, QRL, useSignal, useVisibleTask$ } from "@builder.io/qwik";

import data from "@emoji-mart/data/sets/14/twitter.json";
import * as Emoji from "emoji-mart";

export default component$(
  (_: {
    onEmojiSelect: QRL<(emoji: any) => void>;
    onClickOutside: QRL<() => void>;
  }) => {
    const ref = useSignal<HTMLElement>();
    useVisibleTask$(({ track }) => {
      const container = track(ref);
      if (!container) return;
      const picker = new Emoji.Picker({
        onEmojiSelect: _.onEmojiSelect,
        onClickOutside: _.onClickOutside,
        set: "twitter",
        data,
      });
      container.appendChild(picker as any);
    });

    return <div ref={ref}></div>;
  },
);
