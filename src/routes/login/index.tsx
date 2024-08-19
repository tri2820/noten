import { $, component$, useContext, useSignal } from "@builder.io/qwik";
import { DocumentHead, useNavigate } from "@builder.io/qwik-city";
import { LuLoader2 } from "@qwikest/icons/lucide";
import ExampleAvatar from "~/components/example-avatar.txt?raw";
import { SupabaseContext } from "~/components/supabase-provider";
import { HEAD } from "~/utils";

export default component$(() => {
  const supabase = useContext(SupabaseContext);
  const nav = useNavigate();
  const name = useSignal<string>("");
  const loading = useSignal<boolean>(false);

  const createAnonAccount = $(async () => {
    const c = supabase.client!;
    const _signInAnonymously = await c.auth.signInAnonymously();
    const id = _signInAnonymously.data.user?.id;
    if (!id) {
      console.error("Cannot sign in anonymously");
      return;
    }

    console.log("insert profile");
    await c.from("profile").insert({
      avatar: ExampleAvatar,
      name: name.value,
    });

    // await c.auth.refreshSession();

    nav("/");
  });

  return (
    <div class="flex min-h-screen flex-col bg-neutral-950 text-white">
      <div class="m-auto   rounded bg-neutral-900 p-12 shadow-lg duration-700 animate-in fade-in slide-in-from-bottom">
        <div class="flex w-full max-w-[400px] flex-col items-stretch space-y-8">
          <div class="space-y-2  text-center">
            <div class="text-neutral-500 ">You've been invited to join</div>
            <div class="text-2xl font-bold">The Only Country in My Heart</div>
          </div>

          <div class="space-y-2 ">
            <div class="font-semibold text-neutral-500">NAME</div>
            <input
              bind:value={name}
              class="w-full rounded bg-neutral-950 p-4 placeholder:text-neutral-600 focus:outline-none"
              placeholder="What should everyone call you?"
            />
          </div>

          <button
            disabled={
              name.value == "" || loading.value == true || !supabase.client
            }
            onClick$={async () => {
              loading.value = true;
              await createAnonAccount();
              loading.value = false;
            }}
            class=" flex w-full flex-col items-center rounded bg-orange-500 px-8 py-4 font-semibold enabled:hover:bg-orange-600 disabled:opacity-40"
          >
            {loading.value ? (
              <LuLoader2 class="h-6 w-6 animate-spin" />
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = HEAD;
