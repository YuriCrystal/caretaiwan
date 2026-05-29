"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRole } from "@/lib/role";

function ErrorContent() {
  const params = useSearchParams();
  const allParams: [string, string][] = [];
  params.forEach((value, key) => allParams.push([key, value]));
  const [homeHref, setHomeHref] = useState("/");
  useEffect(() => {
    setHomeHref(getRole() === "family" ? "/family" : "/");
  }, []);

  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <Link
          href={homeHref}
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">⚠️ 登入錯誤</h1>
      </header>

      <div className="px-5 pt-5 space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-800 rounded-2xl">
          <h2 className="font-bold text-red-900 dark:text-red-100 mb-2">錯誤代碼</h2>
          <code className="block bg-white dark:bg-slate-900 p-3 rounded text-sm break-all">
            {params.get("error") || "(未知)"}
          </code>
        </div>

        {allParams.length > 0 && (
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="font-bold mb-2">完整參數</h2>
            <div className="space-y-2">
              {allParams.map(([k, v]) => (
                <div key={k} className="text-sm">
                  <span className="font-semibold text-slate-500">{k}:</span>{" "}
                  <code className="break-all">{v}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm space-y-2">
          <p className="font-bold">把上面的「錯誤代碼」告訴開發者，更容易定位問題。</p>
          <p>常見錯誤：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <code>Configuration</code>:伺服器端設定錯誤（環境變數、provider 配置）
            </li>
            <li>
              <code>OAuthSignin</code>:OAuth provider 啟動失敗
            </li>
            <li>
              <code>OAuthCallback</code>:OAuth callback 失敗（callback URL 沒對到）
            </li>
            <li>
              <code>AccessDenied</code>:LINE 拒絕授權
            </li>
          </ul>
        </div>

        <Link
          href={homeHref}
          className="block text-center w-full h-12 leading-[3rem] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-semibold"
        >
          返回首頁
        </Link>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<main className="flex flex-col flex-1 pb-32" />}>
      <ErrorContent />
    </Suspense>
  );
}
