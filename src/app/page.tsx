"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { CATEGORIES, SCENARIOS, searchScenarios, type CategoryId } from "@/lib/scenarios";
import ThemeToggle from "@/components/ThemeToggle";

type Rec = {
  type: "temp" | "stool" | "sleep" | "fall" | "med" | "meal";
  value: string | true;
  note: string;
  timestamp: number;
  shared: boolean;
};
const REC_LABEL: Record<Rec["type"], { icon: string; label: string }> = {
  temp:  { icon: "🌡️", label: "體溫" },
  stool: { icon: "💩", label: "排便" },
  sleep: { icon: "😴", label: "睡眠" },
  fall:  { icon: "🤕", label: "跌倒" },
  med:   { icon: "💊", label: "吃藥" },
  meal:  { icon: "🍚", label: "吃飯" },
};

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "剛剛";
  if (m < 60) return `${m} 分鐘前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小時前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} 天前`;
  return new Date(ts).toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<Rec[]>([]);

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem("records") || "[]") as Rec[];
      setRecent(all.slice(-3).reverse());
    } catch {}
  }, []);

  const results = useMemo(() => searchScenarios(query), [query]);
  const showResults = query.trim().length > 0;

  return (
    <main className="flex flex-col flex-1 pb-40">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">看護助手</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">CareTaiwan</p>
        </div>
        <ThemeToggle />
      </header>

      {/* Search */}
      <div className="px-5 pb-4">
        <div className="relative">
          <input
            autoFocus
            inputMode="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 搜尋情境（如「發燒」「跌倒」）"
            className="w-full h-14 px-4 text-lg rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Search results */}
      {showResults && (
        <div className="px-5 space-y-2">
          {results.length === 0 ? (
            <p className="text-zinc-500 py-8 text-center">沒有找到相關情境</p>
          ) : (
            results.map((s) => (
              <Link
                key={s.id}
                href={`/scenario/${s.id}`}
                className="block p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORIES[s.category].icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-xs text-zinc-500">{s.headline}</div>
                  </div>
                  <LevelDot level={s.level} />
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Recent records */}
      {!showResults && recent.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              最近記錄
            </h2>
            <Link
              href="/record"
              className="text-xs text-zinc-500 dark:text-zinc-400 active:text-zinc-700 dark:active:text-zinc-200"
            >
              新增 →
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((r, i) => {
              const meta = REC_LABEL[r.type];
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <span>{meta.label}</span>
                      {r.type === "temp" && typeof r.value === "string" && (
                        <span className="text-zinc-500">{r.value}°C</span>
                      )}
                      {r.shared && (
                        <span className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded">
                          已送
                        </span>
                      )}
                    </div>
                    {r.note && (
                      <div className="text-xs text-zinc-500 truncate mt-0.5">
                        {r.note}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 whitespace-nowrap">
                    {formatRelative(r.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      {!showResults && (
        <div className="px-5">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
            常見情境
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(CATEGORIES) as CategoryId[]).map((id) => {
              const c = CATEGORIES[id];
              const count = SCENARIOS.filter((s) => s.category === id).length;
              return (
                <Link
                  key={id}
                  href={`/category/${id}`}
                  className={`flex flex-col items-center justify-center aspect-square rounded-2xl ${c.color} active:scale-95 transition-transform`}
                >
                  <span className="text-5xl mb-2">{c.icon}</span>
                  <span className="text-base font-semibold">{c.label}</span>
                  <span className="text-xs text-zinc-500 mt-0.5">{count} 條</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </main>
  );
}

function LevelDot({ level }: { level: "red" | "orange" | "green" }) {
  const cls = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
  }[level];
  return <span className={`w-3 h-3 rounded-full ${cls}`} />;
}
