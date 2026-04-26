"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { exportAllData, importAllData } from "@/lib/elder";

export default function BackupPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `caretaiwan-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: "已下載備份檔" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importAllData(String(reader.result));
      if (result.ok) {
        setMessage({
          ok: true,
          text: `匯入成功：${result.elderCount} 位老人 / ${result.recordCount} 筆記錄`,
        });
      } else {
        setMessage({ ok: false, text: `失敗：${result.message}` });
      }
      setTimeout(() => setMessage(null), 5000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">💾 備份與還原</h1>
      </header>

      <div className="px-5 pt-5 space-y-4">
        {message && (
          <div
            className={`p-4 rounded-xl ${
              message.ok
                ? "bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100"
                : "bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-100"
            }`}
          >
            {message.ok ? "✅" : "⚠️"} {message.text}
          </div>
        )}

        <Section title="📤 匯出備份">
          <p className="mb-3">
            把醫護卡資料 + 記錄打包成檔案存到手機。建議**每週備份一次**，以免手機儲存被系統清除。
          </p>
          <button
            onClick={handleExport}
            className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-lg font-bold"
          >
            下載備份檔
          </button>
        </Section>

        <Section title="📥 從備份還原">
          <p className="mb-3">
            選擇你之前下載的備份檔（.json），會把醫護卡資料 + 記錄全部還原。**注意：會覆蓋目前的資料**。
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            className="block w-full text-sm file:mr-4 file:px-4 file:py-3 file:rounded-2xl file:border-0 file:bg-zinc-900 dark:file:bg-zinc-100 file:text-white dark:file:text-zinc-900 file:font-bold file:cursor-pointer"
          />
        </Section>

        <Section title="ℹ️ 為什麼需要備份？" emphasis>
          <ul className="space-y-2 list-disc list-inside">
            <li>iOS Safari 7 天無互動會自動清除網站儲存</li>
            <li>清除瀏覽器資料、換手機都會失去資料</li>
            <li>本 APP 為保護隱私，**完全不收集／同步資料到雲端**</li>
            <li>所以資料只存在你這支手機，請定期備份</li>
          </ul>
        </Section>
      </div>
    </main>
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
      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h2>
      <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
