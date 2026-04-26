import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CATEGORIES,
  getScenariosByCategory,
  type CategoryId,
} from "@/lib/scenarios";

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((id) => ({ id }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(id in CATEGORIES)) notFound();
  const cat = CATEGORIES[id as CategoryId];
  const list = getScenariosByCategory(id as CategoryId);

  const dotColor = (lv: "red" | "orange" | "green") =>
    ({ red: "bg-red-500", orange: "bg-orange-500", green: "bg-green-500" }[lv]);

  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </h1>
      </header>

      <div className="px-5 mt-4 space-y-2">
        {list.map((s) => (
          <Link
            key={s.id}
            href={`/scenario/${s.id}`}
            className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 active:scale-[0.98] transition-transform"
          >
            <span className={`flex-shrink-0 w-3 h-3 rounded-full ${dotColor(s.level)}`} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{s.title}</div>
              <div className="text-sm text-zinc-500 truncate">{s.headline}</div>
            </div>
            <span className="text-zinc-400">›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
