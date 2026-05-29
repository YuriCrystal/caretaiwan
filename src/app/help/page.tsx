"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRole } from "@/lib/role";
import { useT } from "@/lib/i18n";

type Contact = { number: string; key: keyof ReturnType<typeof useT>["help"]["items"] };

const EMERGENCY: Contact[] = [
  { number: "119", key: "119" },
  { number: "110", key: "110" },
];

const SUPPORT: Contact[] = [
  { number: "1955", key: "1955" },
  { number: "0800-474-580", key: "0800-474-580" },
  { number: "0800-024-995", key: "0800-024-995" },
  { number: "113", key: "113" },
];

export default function HelpPage() {
  const t = useT();
  const [backHref, setBackHref] = useState("/");
  useEffect(() => {
    setBackHref(getRole() === "family" ? "/family" : "/");
  }, []);

  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <Link
          href={backHref}
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">🆘 {t.help.title}</h1>
      </header>

      {/* Emergency */}
      <section className="px-5 mt-5">
        <h2 className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">
          🚨 {t.help.emergencyTitle}
        </h2>
        <div className="space-y-2">
          {EMERGENCY.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number}`}
              className="block p-4 bg-red-600 active:bg-red-700 text-white rounded-2xl shadow-md"
            >
              <div className="text-2xl font-bold">📞 {c.number}</div>
              <div className="text-sm opacity-90 mt-0.5">{t.help.items[c.key]}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Support */}
      <section className="px-5 mt-6">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          💬 {t.help.supportTitle}
        </h2>
        <div className="space-y-2">
          {SUPPORT.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number}`}
              className="block p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800"
            >
              <div className="text-lg font-bold">📞 {c.number}</div>
              <div className="text-sm text-slate-500 mt-0.5">{t.help.items[c.key]}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Trust footer */}
      <div className="px-5 mt-8">
        <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            🔒 {t.help.callNote}
          </p>
        </div>
      </div>
    </main>
  );
}
