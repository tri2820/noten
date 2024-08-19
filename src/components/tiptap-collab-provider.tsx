import * as awarenessProtocol from "y-protocols/awareness";
import * as Y from "yjs";

// import type { SupabaseClient } from "@supabase/supabase-js";
import {
  REALTIME_LISTEN_TYPES,
  SupabaseClient,
  type RealtimeChannel,
} from "@supabase/supabase-js";

export const hexToBytes = (hexString: string) =>
  new Uint8Array(
    hexString
      .substring(2)
      .match(/.{1,2}/g)!
      .map((hex) => parseInt(hex, 16)),
  );

export const bytesToHex = (src: Uint8Array) =>
  "\\x" + src.reduce((s, n) => s + n.toString(16).padStart(2, "0"), "");

export default class {
  private channel: RealtimeChannel;
  private awareness: awarenessProtocol.Awareness;
  private save_to_db_timeout: ReturnType<typeof setTimeout> | undefined;
  private reload_from_db_interval: ReturnType<typeof setTimeout> | undefined;
  public doc: Y.Doc;

  constructor(
    private supabase: SupabaseClient,
    private id: string,
    private state?: string,
    private onSave?: (state: string) => void,
    private onIntervalReload?: () => Promise<string>,
  ) {
    const c = supabase.channel(`doc/${id}`);
    c.on(
      REALTIME_LISTEN_TYPES.BROADCAST,
      { event: `doc-event` },
      this.onDocEvent.bind(this),
    ).subscribe();
    this.channel = c;

    const document = new Y.Doc();
    this.doc = document;
    this.awareness = new awarenessProtocol.Awareness(document);
    this.awareness.on("update", this.onAwarenessUpdate.bind(this));
    document.on("update", this.onDocUpdate.bind(this));

    if (state) {
      const update = hexToBytes(state);
      Y.applyUpdate(document, update);
    }

    // On DB change
    // this.reload_from_db_interval = setInterval(async () => {
    //   const state = await onIntervalReload?.();
    //   if (state) {
    //     console.log("reload got state", state);
    //     // How to apply state
    // -> editor.commands.setContent
    //   }
    // }, 5000);
  }

  destroy() {
    console.log("destroy provider...");
    this.doc.destroy();
    this.awareness.destroy();
    this.channel.unsubscribe();
    clearTimeout(this.save_to_db_timeout);
  }

  private onAwarenessUpdate({ added, updated, removed }: any, origin: any) {
    const changedClients = added.concat(updated).concat(removed);
    const update = awarenessProtocol.encodeAwarenessUpdate(
      this.awareness,
      changedClients,
    );
    this.channel.send({
      type: "broadcast",
      event: `doc-event`,
      payload: {
        type: "doc-awareness",
        update: Array.from(update),
      },
    });
  }

  private async onDocUpdate(update: Uint8Array, origin: any) {
    this.channel.send({
      type: "broadcast",
      event: `doc-event`,
      payload: {
        type: "doc-update",
        update: Array.from(update),
      },
    });

    clearTimeout(this.save_to_db_timeout);
    this.save_to_db_timeout = setTimeout(async () => {
      const m = Y.encodeStateAsUpdate(this.doc);
      const state = bytesToHex(m);
      console.log("call with id", this.id);
      this.onSave?.(state);
    }, 500);
  }

  private onDocEvent({ payload }: any) {
    if (payload.type === "doc-awareness" && this.awareness) {
      const update = Uint8Array.from(payload.update);
      awarenessProtocol.applyAwarenessUpdate(this.awareness, update, this);
    }

    if (payload.type === "doc-update") {
      const update = Uint8Array.from(payload.update);
      Y.applyUpdate(this.doc, update);
    }
  }
}
