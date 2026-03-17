"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Рендерит HTML заказчика внутри Shadow DOM, чтобы его стили
 * (в т.ч. * {}, body {}, глобальные классы) не влияли на страницу.
 * Санитизация (DOMPurify) должна выполняться до передачи html.
 */
export function SandboxedHtml({ html }: { html: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let root = host.shadowRoot;
    if (!root) {
      root = host.attachShadow({ mode: "open" });
    }
    root.innerHTML = html;
  }, [html]);

  return (
    <div
      ref={hostRef}
      className="sandboxed-html-host min-h-[1em] max-w-full"
      suppressHydrationWarning
    />
  );
}
