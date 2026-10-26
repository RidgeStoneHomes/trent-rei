"use client";

import { useState } from "react";

export function CopyButton({ text, light = false }: { text: string; light?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`shrink-0 text-xs underline ${light ? "text-brass-light" : "text-lake"}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
