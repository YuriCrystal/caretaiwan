"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getElder, calculateAge, type Elder } from "@/lib/elder";

export default function CardPage() {
  const [elder, setElder] = useState<Elder | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setElder(getElder());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <main className="flex flex-col flex-1 pb-32" />;
  }

  // No data: prompt to create
  if (!elder || !elder.name) {
    return (
      <main className="flex flex-col flex-1 pb-32">
        <Header />
        <div className="px-5 pt-8">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-center">
            <div className="text-5xl mb-3">🆔</div>
            <p className="text-base font-semibold mb-1">尚未建立老人健康檔案</p>
            <p className="text-sm text-zinc-500 mb-5">
              填寫後，這張卡片可在就醫時直接給醫護看
            </p>
            <Link
              href="/card/edit"
              className="inline-block px-6 h-12 leading-[3rem] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-bold"
            >
              建立檔案
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const age = calculateAge(elder.birthday);
  const genderLabel = elder.gender === "male" ? "男" : elder.gender === "female" ? "女" : "";

  return (
    <main className="flex flex-col flex-1 pb-32">
      <Header />

      <div className="px-5 pt-4 space-y-4">
        {/* Header card: name + key info */}
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-900 dark:border-zinc-100 shadow-sm">
          <div className="text-xs text-zinc-500 mb-1">受照顧者 / Patient</div>
          <div className="text-3xl font-bold tracking-tight">{elder.name}</div>
          <div className="flex items-center gap-3 mt-2 text-base text-zinc-700 dark:text-zinc-300">
            {genderLabel && <span>{genderLabel}</span>}
            {age !== null && <span>{age} 歲</span>}
            {elder.bloodType && (
              <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-md text-sm font-bold">
                {elder.bloodType} 型
              </span>
            )}
          </div>
        </div>

        {/* Allergies — most critical */}
        {elder.allergies && (
          <Section title="⚠️ 過敏" emphasis>
            <p className="text-base whitespace-pre-wrap leading-relaxed">{elder.allergies}</p>
          </Section>
        )}

        {/* Medications */}
        {elder.medications.length > 0 && (
          <Section title="💊 慣用藥">
            <ul className="space-y-2">
              {elder.medications.map((m, i) => (
                <li key={i} className="border-l-4 border-blue-500 pl-3 py-1">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {m.dose} ・ {m.time}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* History */}
        {elder.history && (
          <Section title="📋 病史">
            <p className="text-base whitespace-pre-wrap leading-relaxed">{elder.history}</p>
          </Section>
        )}

        {/* Doctor / Hospital */}
        {(elder.doctor || elder.hospital) && (
          <Section title="🏥 主治醫療">
            {elder.doctor && (
              <div className="text-base">
                <span className="text-zinc-500 text-sm mr-2">醫師</span>
                {elder.doctor}
              </div>
            )}
            {elder.hospital && (
              <div className="text-base mt-1">
                <span className="text-zinc-500 text-sm mr-2">醫院</span>
                {elder.hospital}
              </div>
            )}
          </Section>
        )}

        {/* Contacts */}
        {elder.contacts.length > 0 && (
          <Section title="📞 緊急聯絡人">
            <div className="space-y-2">
              {elder.contacts.map((c, i) => (
                <a
                  key={i}
                  href={`tel:${c.phone}`}
                  className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-xl active:bg-emerald-100 dark:active:bg-emerald-900"
                >
                  <span className="text-2xl">📞</span>
                  <div className="flex-1">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {c.relation} ・ {c.phone}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Edit button */}
        <Link
          href="/card/edit"
          className="block text-center py-3 text-sm text-zinc-500 dark:text-zinc-400 active:text-zinc-700 dark:active:text-zinc-200"
        >
          ✏️ 編輯檔案
        </Link>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
      <Link
        href="/"
        className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
      >
        ←
      </Link>
      <h1 className="text-xl font-bold">🆔 醫護卡</h1>
    </header>
  );
}

function Section({
  title,
  emphasis,
  children,
}: {
  title: string;
  emphasis?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`p-4 rounded-2xl ${
        emphasis
          ? "bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-800"
          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
