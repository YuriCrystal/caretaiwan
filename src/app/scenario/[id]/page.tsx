import { notFound } from "next/navigation";
import Link from "next/link";
import { SCENARIOS, getScenarioById, CATEGORIES } from "@/lib/scenarios";
import { SCENARIO_PHRASES, UNIVERSAL_PHRASES } from "@/lib/hospital-phrases";
import PhraseCard from "@/components/PhraseCard";

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ id: s.id }));
}

const LEVEL_STYLES = {
  red: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-300 dark:border-red-800",
    label: "🔴 立刻送醫",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-300 dark:border-orange-800",
    label: "🟠 觀察 + 處置",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-300 dark:border-green-800",
    label: "🟢 日常處置",
  },
} as const;

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = getScenarioById(id);
  if (!s) notFound();

  const cat = CATEGORIES[s.category];
  const lvl = LEVEL_STYLES[s.level];

  return (
    <main className="flex flex-col flex-1 pb-32">
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
        >
          ←
        </Link>
        <div className="flex-1">
          <div className="text-xs text-zinc-500">
            {cat.icon} {cat.label}
          </div>
          <h1 className="text-base font-semibold leading-tight">{s.title}</h1>
        </div>
      </header>

      {/* Level + Headline */}
      <div className={`mx-5 mt-5 p-5 rounded-2xl border-2 ${lvl.bg} ${lvl.border}`}>
        <div className={`text-xl font-bold ${lvl.text}`}>{lvl.label}</div>
        <div className="text-2xl font-bold mt-1">{s.headline}</div>
      </div>

      {/* Steps */}
      <section className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
          做這 {s.steps.length} 件事
        </h2>
        <ol className="space-y-3">
          {s.steps.map((step, i) => (
            <li
              key={i}
              className="flex gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <p className="text-base leading-relaxed pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Emergency call */}
      {s.level === "red" && (
        <a
          href="tel:119"
          className="mx-5 mt-5 flex items-center justify-center gap-3 h-16 bg-red-600 active:bg-red-700 text-white rounded-2xl text-2xl font-bold shadow-lg"
        >
          📞 撥 119
        </a>
      )}

      {/* When to ER */}
      {s.whenToER !== "—" && (
        <section className="px-5 mt-6">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            何時送醫
          </h2>
          <p className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-base">
            {s.whenToER}
          </p>
        </section>
      )}

      {/* Details */}
      {s.details && (
        <details className="px-5 mt-6">
          <summary className="cursor-pointer text-sm font-semibold text-zinc-500 dark:text-zinc-400 list-none flex items-center gap-2">
            <span>▾ 詳細說明</span>
          </summary>
          <p className="mt-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {s.details}
          </p>
        </details>
      )}

      {/* Hospital communication phrases (red scenarios only) */}
      {s.level === "red" && (
        <section className="px-5 mt-8">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            🏥 就醫溝通短句（給醫護看／聽）
          </h2>
          {SCENARIO_PHRASES[s.id] && (
            <div className="mb-3">
              <PhraseCard phrase={SCENARIO_PHRASES[s.id]} emphasis />
            </div>
          )}
          <details>
            <summary className="cursor-pointer text-sm text-zinc-500 mb-2 list-none flex items-center gap-2">
              <span>▾ 通用短句（自我介紹／請聯絡家屬）</span>
            </summary>
            <div className="space-y-2 mt-2">
              {UNIVERSAL_PHRASES.map((p, i) => (
                <PhraseCard key={i} phrase={p} />
              ))}
            </div>
          </details>
        </section>
      )}

      {/* Source */}
      <footer className="px-5 mt-8 pb-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          📚 來源：{s.source}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
          ⚠️ 內容草稿，待醫護專業審核
        </p>
      </footer>
    </main>
  );
}
