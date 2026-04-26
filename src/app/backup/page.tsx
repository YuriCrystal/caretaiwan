"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { exportAllData, importAllData } from "@/lib/elder";
import { loginWithLine, logout } from "@/app/actions/auth-actions";

type SessionInfo =
  | { loggedIn: false }
  | { loggedIn: true; name: string | null; picture: string | null; lineUserId: string | null };

export default function BackupPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [busy, setBusy] = useState(false);

  // Load session
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((s) => setSession(s))
      .catch(() => setSession({ loggedIn: false }));
  }, []);

  const showMsg = (ok: boolean, text: string, ms = 4000) => {
    setMessage({ ok, text });
    setTimeout(() => setMessage(null), ms);
  };

  // Local file backup
  const handleExportFile = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `caretaiwan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMsg(true, "已下載備份檔");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importAllData(String(reader.result));
      if (result.ok) {
        showMsg(
          true,
          `匯入成功:${result.elderCount} 位老人 / ${result.recordCount} 筆記錄`,
          5000
        );
      } else {
        showMsg(false, `失敗:${result.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cloud backup
  const handleCloudUpload = async () => {
    setBusy(true);
    try {
      const json = exportAllData();
      const res = await fetch("/api/cloud/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      });
      const data = await res.json();
      if (res.ok) showMsg(true, "已上傳到雲端");
      else showMsg(false, `失敗:${data.error || res.status}`);
    } catch (e) {
      showMsg(false, "網路錯誤");
    } finally {
      setBusy(false);
    }
  };

  const handleCloudDownload = async () => {
    if (!confirm("從雲端還原會覆蓋目前手機上的資料，確定？")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/cloud/download");
      const data = await res.json();
      if (!res.ok) {
        showMsg(false, `失敗:${data.error || res.status}`);
        return;
      }
      if (!data.data) {
        showMsg(false, "雲端沒有備份");
        return;
      }
      const result = importAllData(JSON.stringify(data.data));
      if (result.ok) {
        showMsg(
          true,
          `已還原:${result.elderCount} 位老人 / ${result.recordCount} 筆記錄`,
          5000
        );
      } else {
        showMsg(false, `還原失敗:${result.message}`);
      }
    } catch (e) {
      showMsg(false, "網路錯誤");
    } finally {
      setBusy(false);
    }
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

        {/* Cloud (LINE login) */}
        <Section title="☁️ 雲端備份（LINE 登入）" emphasis>
          <p className="mb-3">
            登入 LINE 之後，可一鍵把資料備份到雲端。換手機、清資料都能還原。
            <br />
            <span className="text-xs text-zinc-500">
              不登入也能用 APP，只是資料只在這支手機。
            </span>
          </p>

          {session === null && (
            <div className="text-sm text-zinc-500">載入中…</div>
          )}

          {session?.loggedIn === false && (
            <form action={loginWithLine}>
              <button
                type="submit"
                className="w-full h-14 bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl font-bold"
              >
                用 LINE 登入
              </button>
            </form>
          )}

          {session?.loggedIn === true && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                {session.picture && (
                  <img
                    src={session.picture}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {session.name || "LINE 使用者"}
                  </div>
                  <div className="text-xs text-zinc-500">已登入</div>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-sm text-zinc-500 px-3 py-2 active:text-zinc-700"
                  >
                    登出
                  </button>
                </form>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCloudUpload}
                  disabled={busy}
                  className="h-14 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-bold disabled:opacity-50"
                >
                  ☁️ 上傳到雲端
                </button>
                <button
                  onClick={handleCloudDownload}
                  disabled={busy}
                  className="h-14 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-100 rounded-2xl font-bold disabled:opacity-50"
                >
                  📥 從雲端還原
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* Local file */}
        <Section title="📤 匯出備份檔（不登入也可用）">
          <p className="mb-3">
            把資料下載成 JSON 檔存到手機。這個方法不需登入，只是要自己保管檔案。
          </p>
          <button
            onClick={handleExportFile}
            className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 rounded-2xl text-base font-bold"
          >
            下載備份檔
          </button>
        </Section>

        <Section title="📥 從備份檔還原">
          <p className="mb-3">選擇你之前下載的 .json 備份檔。**會覆蓋目前資料**。</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            className="block w-full text-sm file:mr-4 file:px-4 file:py-3 file:rounded-2xl file:border-0 file:bg-zinc-900 dark:file:bg-zinc-100 file:text-white dark:file:text-zinc-900 file:font-bold file:cursor-pointer"
          />
        </Section>

        <Section title="ℹ️ 注意事項">
          <ul className="space-y-2 list-disc list-inside">
            <li>登入 LINE 後我們只記住你的 LINE userId（無臉書、密碼、電話等）</li>
            <li>雲端只存「醫護卡 + 記錄」JSON，不上傳任何 LINE 個資</li>
            <li>登出後雲端資料保留（下次登入仍可還原）</li>
            <li>「我需要協助」這個按鈕完全不會通知任何人，跟登入無關</li>
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
          ? "bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-300 dark:border-emerald-800"
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
