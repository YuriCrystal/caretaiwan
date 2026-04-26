import Link from "next/link";

type Contact = {
  number: string;
  label: string;
  desc: string;
  isUrl?: boolean;
};

const EMERGENCY: Contact[] = [
  { number: "119", label: "119 救護", desc: "生命危急、火災、急救" },
  { number: "110", label: "110 警察", desc: "失蹤、暴力、報案" },
];

const SUPPORT: Contact[] = [
  { number: "1955", label: "1955", desc: "外籍勞工權益專線（24 小時）" },
  { number: "0800-474-580", label: "0800-474-580", desc: "失智症關懷專線（24 小時）" },
  { number: "0800-024-995", label: "0800-024-995", desc: "TASAT 看護自助會" },
  { number: "113", label: "113", desc: "保護專線（家暴、性侵、兒少）" },
];

export default function HelpPage() {
  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">🆘 我需要協助</h1>
      </header>

      {/* Emergency */}
      <section className="px-5 mt-5">
        <h2 className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">
          🚨 緊急救護
        </h2>
        <div className="space-y-2">
          {EMERGENCY.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number}`}
              className="block p-4 bg-red-600 active:bg-red-700 text-white rounded-2xl shadow-md"
            >
              <div className="text-2xl font-bold">📞 {c.label}</div>
              <div className="text-sm opacity-90 mt-0.5">{c.desc}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Support */}
      <section className="px-5 mt-6">
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
          💬 諮詢／申訴
        </h2>
        <div className="space-y-2">
          {SUPPORT.map((c) => (
            <a
              key={c.number}
              href={c.isUrl ? c.number : `tel:${c.number}`}
              className="block p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 active:bg-zinc-50 dark:active:bg-zinc-800"
            >
              <div className="text-lg font-bold">📞 {c.label}</div>
              <div className="text-sm text-zinc-500 mt-0.5">{c.desc}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Trust footer */}
      <div className="px-5 mt-8">
        <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            🔒 此頁不會通知雇主。撥打的電話與時間僅你自己知道。
          </p>
        </div>
      </div>
    </main>
  );
}
