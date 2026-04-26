"use client";

import { useState } from "react";
import type { Phrase } from "@/lib/hospital-phrases";

const LANGS: { code: keyof Phrase; label: string; flag: string }[] = [
  { code: "zh", label: "中文", flag: "🇹🇼" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

export default function PhraseCard({
  phrase,
  emphasis,
}: {
  phrase: Phrase;
  emphasis?: boolean;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copy = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden border-2 ${
        emphasis
          ? "border-amber-300 dark:border-amber-800"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {LANGS.map((l, i) => {
        const text = phrase[l.code];
        const isLast = i === LANGS.length - 1;
        return (
          <button
            key={l.code}
            onClick={() => copy(text, i)}
            className={`w-full text-left p-3 flex items-start gap-3 ${
              emphasis ? "bg-amber-50 dark:bg-amber-950" : "bg-white dark:bg-zinc-900"
            } active:bg-zinc-50 dark:active:bg-zinc-800 ${
              isLast ? "" : "border-b border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{l.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-zinc-500 mb-0.5">{l.label}</div>
              <div className="text-base leading-relaxed">{text}</div>
            </div>
            <span className="text-xs text-zinc-400 flex-shrink-0 mt-1">
              {copiedIdx === i ? "✓ 已複製" : "複製"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
