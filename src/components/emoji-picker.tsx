import {
  component$,
  QRL,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

import data from "@emoji-mart/data/sets/14/twitter.json";
import * as Emoji from "emoji-mart";
import { UIContext } from "./ui-provider";

export default component$(
  (_: {
    top: number;
    left: number;
    onEmojiSelect: QRL<(emoji: any) => void>;
    onClickOutside: QRL<() => void>;
  }) => {
    const ui = useContext(UIContext);
    const ref = useSignal<HTMLElement>();
    const in_lower_half = useComputed$(() => {
      const windowHeight = window.innerHeight;
      const middle = windowHeight / 2;
      return _.top > middle;
    });

    useVisibleTask$(({ track }) => {
      const container = track(ref);
      if (!container) return;
      const picker = new Emoji.Picker({
        theme: ui.theme,
        onEmojiSelect: _.onEmojiSelect,
        onClickOutside: _.onClickOutside,
        set: "twitter",
        data,
      });
      container.appendChild(picker as any);
    });

    return (
      <div
        data-adjust={in_lower_half.value}
        class="fixed z-50  data-[adjust]:-translate-y-full"
        style={{
          top: `${_.top}px`,
          left: `${_.left}px`,
        }}
      >
        <div ref={ref} class="z-50"></div>
      </div>
    );
  },
);
