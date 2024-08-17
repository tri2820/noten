import { component$, createContextId, useStore } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{head.title}</title>

      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
      <script
        dangerouslySetInnerHTML={`
          (function() {
            try {
              const cookies = document.cookie.split(';').map(c => c.trim());
              const ui = cookies.find(c => c.startsWith('ui='));
              if (!ui) return;
              const j = JSON.parse(decodeURIComponent(ui.split('=')[1]));
              document.documentElement.className = j.theme ?? 'light';
            } catch (e) {
              console.warn("Cannot check theme", e);
            }
          })();
        `}
      ></script>
    </>
  );
});
