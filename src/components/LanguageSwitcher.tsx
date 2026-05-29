"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLang, LANG_LABEL, type Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["zh-TW", "vi", "id"];

// 簡短代號(顯示在按鈕上)
const SHORT: Record<Lang, string> = {
  "zh-TW": "中",
  vi: "VI",
  id: "ID",
};

export default function LanguageSwitcher({
  variant = "icon",
}: {
  variant?: "icon" | "inline";
}) {
  const [lang, setLang] = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 點外部關閉
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // inline 樣式: 三個按鈕並排(用在 RolePicker 頂部)
  if (variant === "inline") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {LANGS.map((l) => {
          const active = lang === l;
          return (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                active
                  ? "bg-blue-600 text-white shadow-card"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:bg-slate-200 dark:active:bg-slate-700"
              }`}
            >
              <span className="text-base">{SHORT[l]}</span>
              <span className={active ? "text-white/90" : "text-slate-500 dark:text-slate-400"}>
                {LANG_LABEL[l]}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // icon 樣式: header 用,小圓鈕 + 下拉選單
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        className="w-11 h-11 flex items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/70 shadow-card active:scale-95 transition-transform"
      >
        <Globe
          className="w-5 h-5 text-slate-700 dark:text-slate-200"
          strokeWidth={2.2}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 min-w-[180px] bg-white dark:bg-slate-900 rounded-2xl shadow-lift ring-1 ring-slate-200/60 dark:ring-slate-800 overflow-hidden">
          {LANGS.map((l) => {
            const active = lang === l;
            return (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-left ${
                  active
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                    : "text-slate-700 dark:text-slate-200 active:bg-slate-50 dark:active:bg-slate-800"
                }`}
              >
                <span className="flex-1">{LANG_LABEL[l]}</span>
                {active && (
                  <Check
                    className="w-4 h-4 text-blue-600 dark:text-blue-300"
                    strokeWidth={2.6}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
