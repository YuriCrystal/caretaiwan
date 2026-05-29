"use client";

import Link from "next/link";
import {
  ChevronLeft,
  IdCard,
  QrCode,
  MessageCircle,
  Send,
  CheckCircle2,
  Smartphone,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

// Bot 配置（看護助手家屬端 Messaging API Channel）
const BOT_ID = "@688xoxya";
// LINE deep link：手機點擊自動開 LINE 加好友；桌面版會跳到 LINE 加好友網頁
const BOT_ADD_URL = `https://line.me/R/ti/p/${encodeURIComponent(BOT_ID)}`;
// 即時生成 QR Code（用 qrserver.com 免費 API，無需自己上傳 PNG）
const BOT_QR = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(
  BOT_ADD_URL
)}`;

export default function FamilySetupPage() {
  const [copiedBotId, setCopiedBotId] = useState(false);

  const handleCopyBotId = async () => {
    if (!BOT_ID) return;
    try {
      await navigator.clipboard.writeText(BOT_ID);
      setCopiedBotId(true);
      setTimeout(() => setCopiedBotId(false), 2000);
    } catch {}
  };

  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link
          href="/family"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/70 shadow-card active:scale-95 transition-transform"
        >
          <ChevronLeft
            className="w-5 h-5 text-slate-700 dark:text-slate-200"
            strokeWidth={2.4}
          />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">家屬 LINE Bot 連線教學</h1>
          <p className="text-xs text-slate-500">5 步完成配對</p>
        </div>
      </header>

      {/* Hero / Why */}
      <div className="px-5 pt-2 pb-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-950 dark:to-sky-900 ring-1 ring-blue-200/60 dark:ring-blue-900/60 rounded-2xl">
          <h2 className="font-bold text-slate-900 dark:text-white mb-1">
            它能幫你做什麼？
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            家屬建立醫護卡 → 產生 6 位配對碼 → 看護輸入碼 → 看護按「送出給家屬」時，家屬 LINE 即時收到推播。
          </p>
        </div>
      </div>

      {/* Two-column overview */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            label="家屬端"
            sub="建卡 + 收推播"
            color="from-violet-50 to-indigo-100 dark:from-violet-950 dark:to-indigo-900 ring-violet-200/60 dark:ring-violet-900/60"
          />
          <RoleCard
            label="看護端"
            sub="輸碼 + 做記錄"
            color="from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900 ring-emerald-200/60 dark:ring-emerald-900/60"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 space-y-3">
        <Step
          n={1}
          role="family"
          Icon={IdCard}
          title="家屬端：建立醫護卡 + 產生配對碼"
        >
          <p>
            在 PWA 用 LINE 登入 → 建立老人醫護卡 → 點「📲 配對看護」→ 產生配對碼
            <br />
            <span className="text-slate-500">會看到 6 位碼，例如：</span>
            <span className="ml-1 font-mono font-bold tracking-widest text-base text-slate-900 dark:text-white">
              K2N8X4
            </span>
          </p>
          <Link
            href="/family/card"
            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 underline mt-1"
          >
            前往家屬醫護卡 <span aria-hidden>→</span>
          </Link>
          <Note icon={AlertTriangle}>
            配對碼 24 小時內有效。看護未在期限內輸入就要重新產生。
          </Note>
        </Step>

        <Step
          n={2}
          role="family"
          Icon={Smartphone}
          title="家屬端：把自己的 LINE 加 Bot 為好友"
        >
          <p>家屬必須加 Bot 為好友才能收推播。三種方式擇一：</p>

          {/* 主要 CTA：手機點按鈕直接開 LINE 加好友 */}
          <a
            href={BOT_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="my-3 flex items-center justify-center gap-2 w-full h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 active:from-emerald-600 active:to-emerald-700 text-white rounded-2xl text-base font-bold shadow-lift"
          >
            <span className="text-xl">📱</span>
            手機直接點此加 Bot
          </a>
          <p className="text-xs text-slate-500 -mt-1">
            在手機上點按鈕會自動開 LINE → 跳出加好友畫面。
          </p>

          {/* QR Code */}
          <div className="my-3 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-card flex flex-col items-center">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              或者:用 LINE 掃 QR Code
            </div>
            <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BOT_QR}
                alt="LINE Bot QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              LINE 主頁 →「掃描行動條碼」
            </p>
          </div>

          {/* Bot ID 複製 */}
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              或者:用 Bot ID 手動搜尋加好友
            </div>
            <button
              onClick={handleCopyBotId}
              className="w-full flex items-center justify-between gap-2 px-4 h-12 bg-white dark:bg-slate-900 rounded-xl shadow-card active:scale-[0.98] transition-transform"
            >
              <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                {BOT_ID}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 h-7 rounded-full text-xs font-medium ${
                  copiedBotId
                    ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {copiedBotId ? (
                  <>
                    <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" strokeWidth={2.2} />
                    複製
                  </>
                )}
              </span>
            </button>
            <p className="text-xs text-slate-500 mt-2">
              LINE 主頁 → 加入好友 → 搜尋 → 貼上 ID 即可
            </p>
          </div>
          <Note icon={CheckCircle2} positive>
            加完 Bot 後，Bot 會發歡迎訊息。家屬不必再做任何事 ──{" "}
            <strong>不要在 Bot 輸入配對碼</strong>(那是看護要做的)。
          </Note>
        </Step>

        <Step
          n={3}
          role="family"
          Icon={QrCode}
          title="家屬端：把 6 位配對碼傳給看護"
        >
          <p>
            用 LINE / 簡訊 / 紙條把第 1 步產生的 6 位碼給看護。
            <br />
            <span className="text-slate-500">例如:</span>
            <span className="ml-1 font-mono font-bold tracking-widest text-base text-slate-900 dark:text-white">
              K2N8X4
            </span>
          </p>
          <Note icon={AlertTriangle}>
            別把配對碼公開貼到群組。任何拿到此碼的人都可在 24 小時內綁定看護位置。
          </Note>
        </Step>

        <Step
          n={4}
          role="caregiver"
          Icon={Send}
          title="看護端：在 PWA 輸入配對碼"
        >
          <p>
            看護用 LINE 登入 PWA → 進「醫護卡」頁面 → 在輸入框打入 6 位碼 → 按「綁定」
          </p>
          <p className="text-xs text-slate-500 mt-1">
            大小寫不拘，按下後立刻配對成功，看護端就能看到老人的醫護卡（唯讀）。
          </p>
        </Step>

        <Step
          n={5}
          role="caregiver"
          Icon={CheckCircle2}
          title="完成：看護記錄會推到家屬 LINE"
          last
        >
          <p>看護做 3 秒記錄，把「送出給家屬」開關打開，家屬即收到推播：</p>
          <FakeChat>
            【王阿嬤 🌡️ 體溫記錄】
            <br />
            🌡️ 36.8°C
            <br />
            💬 看護備註：午餐後測量
            <br />
            <br />
            📅 2026/05/05 13:25
          </FakeChat>
          <Note icon={CheckCircle2} positive>
            完成。家屬以後不必開 PWA，LINE 自動收到看護記錄。
          </Note>
        </Step>
      </div>

      {/* Troubleshooting */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          🩹 故障排除
        </h2>
        <div className="space-y-2">
          <Trouble
            q="家屬加 Bot 沒收到歡迎訊息？"
            a="LINE 帳號可能已封鎖或者 Bot 設定問題。請確認家屬加好友後對話框出現了 Bot 名稱。若仍沒訊息，把 Bot 從好友刪除後重新加一次。"
          />
          <Trouble
            q="看護輸入配對碼回「已被使用或已過期」？"
            a="配對碼 24 小時失效；或者已被綁定。請家屬到家屬端醫護卡重新產生新配對碼。"
          />
          <Trouble
            q="家屬不小心在 Bot 裡輸入了配對碼？"
            a="Bot 會偵測到「你是這張醫護卡的擁有者」並拒絕綁定，不會破壞配對。請忽略這個錯誤。"
          />
          <Trouble
            q="送出記錄家屬沒收到？"
            a={
              "確認三件事：\n" +
              "1) 家屬端「醫護卡」配對區塊顯示「✅ 已配對家屬」\n" +
              "2) 家屬已加 LINE Bot 為好友（Bot 沒被刪、沒被封鎖）\n" +
              "3) 看護送出時「送出給家屬」開關切到綠色"
            }
          />
          <Trouble
            q="想換看護怎麼辦？"
            a="已綁定的配對無法直接換看護（防綁架機制）。請家屬端把這位老人的醫護卡刪除再重建，會產生全新配對碼。"
          />
        </div>
      </div>
    </main>
  );
}

function RoleCard({
  label,
  sub,
  color,
}: {
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className={`p-3 rounded-2xl shadow-card bg-gradient-to-br ring-1 ${color} text-center`}
    >
      <div className="text-base font-bold text-slate-900 dark:text-white">
        {label}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
        {sub}
      </div>
    </div>
  );
}

function Step({
  n,
  role,
  Icon,
  title,
  children,
  last,
}: {
  n: number;
  role: "caregiver" | "family";
  Icon: typeof IdCard;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  const roleColor =
    role === "caregiver"
      ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200"
      : "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-200";
  const roleLabel = role === "caregiver" ? "看護端" : "家屬端";

  return (
    <div className="relative">
      {!last && (
        <div className="absolute left-[19px] top-12 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
      )}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 z-10 shadow-card">
          {n}
        </div>
        <div className="flex-1 min-w-0 pb-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon
                className="w-5 h-5 text-blue-600 dark:text-blue-300 shrink-0"
                strokeWidth={2.2}
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex-1 min-w-0">
                {title}
              </h3>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleColor}`}
              >
                {roleLabel}
              </span>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FakeChat({
  children,
  self,
}: {
  children: React.ReactNode;
  self?: boolean;
}) {
  return (
    <div
      className={`flex ${self ? "justify-end" : "justify-start"} my-2`}
    >
      <div
        className={`relative max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          self
            ? "bg-emerald-500 text-white rounded-tr-sm"
            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
        }`}
      >
        <div className="flex items-start gap-1.5">
          {!self && (
            <MessageCircle
              className="w-4 h-4 text-slate-500 mt-0.5 shrink-0"
              strokeWidth={2.2}
            />
          )}
          <div className="flex-1 break-words">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Note({
  children,
  icon: Icon,
  positive,
}: {
  children: React.ReactNode;
  icon: typeof AlertTriangle;
  positive?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-2 p-2.5 rounded-xl text-xs leading-relaxed mt-2 ${
        positive
          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-200/60 dark:ring-emerald-800"
          : "bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100 ring-1 ring-amber-200/60 dark:ring-amber-800"
      }`}
    >
      <Icon
        className={`w-4 h-4 mt-0.5 shrink-0 ${
          positive
            ? "text-emerald-600 dark:text-emerald-300"
            : "text-amber-600 dark:text-amber-300"
        }`}
        strokeWidth={2.4}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Trouble({ q, a }: { q: string; a: string }) {
  return (
    <details className="bg-white dark:bg-slate-900 rounded-2xl shadow-card group">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-start gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <span className="text-blue-600 dark:text-blue-400 mt-0.5">Q.</span>
        <span className="flex-1">{q}</span>
        <span className="text-slate-400 transition-transform group-open:rotate-180 mt-0.5">
          ▾
        </span>
      </summary>
      <div className="px-4 pb-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
        {a}
      </div>
    </details>
  );
}
