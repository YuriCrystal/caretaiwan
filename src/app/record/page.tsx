"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pushRecordToFamily } from "@/app/actions/push-actions";
import { getActiveElder } from "@/lib/elder";

type RecordType = "temp" | "stool" | "sleep" | "fall" | "med" | "meal";

const ITEMS: { id: RecordType; icon: string; label: string }[] = [
  { id: "temp", icon: "🌡️", label: "體溫" },
  { id: "stool", icon: "💩", label: "排便" },
  { id: "sleep", icon: "😴", label: "睡眠" },
  { id: "fall", icon: "🤕", label: "跌倒" },
  { id: "med", icon: "💊", label: "吃藥" },
  { id: "meal", icon: "🍚", label: "吃飯" },
];

// 每類提供常用短語（看護一鍵就能補說明，不必打字）
const NOTE_TEMPLATES: Record<RecordType, string[]> = {
  temp: ["精神還好", "想睡", "沒胃口", "有咳嗽", "退燒中"],
  stool: ["正常", "偏軟", "便秘", "拉肚子", "顏色異常"],
  sleep: ["睡得好", "半夜醒過", "整晚沒睡", "有夢話", "白天嗜睡"],
  fall: ["沒受傷", "擦傷", "撞到頭", "需就醫", "自己爬起來"],
  med: ["按時吃完", "拒吃", "吐了", "漏一餐", "改劑量"],
  meal: ["吃完整份", "吃一半", "拒食", "嗆咳", "改流質"],
};

type Stage = "menu" | "tempInput" | "note" | "saved";

export default function RecordPage() {
  const [stage, setStage] = useState<Stage>("menu");
  const [selected, setSelected] = useState<RecordType | null>(null);
  const [shareWithFamily, setShareWithFamily] = useState(false);
  const [tempValue, setTempValue] = useState("");
  const [note, setNote] = useState("");
  const [recordCount, setRecordCount] = useState(0);
  const [recentHourCount, setRecentHourCount] = useState(0);
  const [recentItems, setRecentItems] = useState<{ icon: string; label: string; ts: number }[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedCount, setClearedCount] = useState<number | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    type R = { type: RecordType; timestamp: number };
    const all = JSON.parse(localStorage.getItem("records") || "[]") as R[];
    setRecordCount(all.length);
    const cutoff = Date.now() - 60 * 60 * 1000;
    const lastHour = all.filter((r) => r.timestamp >= cutoff);
    setRecentHourCount(lastHour.length);
    setRecentItems(
      lastHour
        .slice(-5)
        .reverse()
        .map((r) => ({
          icon: ITEMS.find((it) => it.id === r.type)?.icon ?? "📝",
          label: ITEMS.find((it) => it.id === r.type)?.label ?? "",
          ts: r.timestamp,
        }))
    );
  }, [stage, showClearConfirm]);

  // Scroll confirm dialog into view when it opens
  useEffect(() => {
    if (showClearConfirm && confirmRef.current) {
      confirmRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showClearConfirm]);

  const today = new Date().toLocaleDateString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const handleItemClick = (id: RecordType) => {
    setSelected(id);
    setNote("");
    setTempValue("");
    if (id === "temp") setStage("tempInput");
    else setStage("note");
  };

  const handleSave = () => {
    if (!selected) return;
    const record = {
      type: selected,
      value: selected === "temp" ? tempValue : true,
      note: note.trim(),
      timestamp: Date.now(),
      shared: shareWithFamily,
    };
    const all = JSON.parse(localStorage.getItem("records") || "[]");
    all.push(record);
    localStorage.setItem("records", JSON.stringify(all));

    // Push to family via LINE if shared toggle is on
    if (shareWithFamily) {
      const elder = getActiveElder();
      if (elder?.id) {
        pushRecordToFamily({
          elderId: elder.id,
          elderName: elder.name,
          recordType: selected,
          value: selected === "temp" ? tempValue : undefined,
          note: note.trim(),
          timestamp: record.timestamp,
        }).catch(() => {
          /* silent: record is already saved locally */
        });
      }
    }

    setStage("saved");
    setTimeout(() => {
      setStage("menu");
      setSelected(null);
      setTempValue("");
      setNote("");
    }, 1500);
  };

  const handleClearHistory = () => {
    const before = recordCount;
    localStorage.removeItem("records");
    setRecordCount(0);
    setShowClearConfirm(false);
    setClearedCount(before);
    setTimeout(() => setClearedCount(null), 3000);
  };

  // ----- Stage: saved -----
  if (stage === "saved") {
    return (
      <main className="flex flex-col flex-1 items-center justify-center pb-8">
        <div className="text-6xl mb-4">✅</div>
        <p className="text-2xl font-bold">已儲存</p>
        {shareWithFamily && (
          <p className="text-sm text-zinc-500 mt-2">已通知家屬</p>
        )}
      </main>
    );
  }

  // ----- Stage: temperature input -----
  if (stage === "tempInput") {
    return (
      <main className="flex flex-col flex-1 pb-[calc(env(safe-area-inset-bottom)+12rem)]">
        <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setStage("menu")}
            className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">🌡️ 記錄體溫</h1>
        </header>

        <div className="px-5 pt-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center">
            <div className="text-5xl font-bold tabular-nums">
              {tempValue || "0.0"}
              <span className="text-2xl text-zinc-400 ml-1">°C</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "←"].map((k) => (
              <button
                key={k}
                onClick={() => {
                  if (k === "←") setTempValue((v) => v.slice(0, -1));
                  else setTempValue((v) => (v.length < 5 ? v + k : v));
                }}
                className="h-16 bg-white dark:bg-zinc-900 rounded-xl text-2xl font-semibold border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-transform"
              >
                {k}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStage("note")}
            disabled={!tempValue}
            className="w-full mt-6 h-16 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-xl font-bold disabled:opacity-30"
          >
            下一步
          </button>
        </div>
      </main>
    );
  }

  // ----- Stage: note (description) -----
  if (stage === "note" && selected) {
    const item = ITEMS.find((i) => i.id === selected)!;
    const templates = NOTE_TEMPLATES[selected];
    return (
      <main className="flex flex-col flex-1 pb-[calc(env(safe-area-inset-bottom)+12rem)]">
        <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setStage(selected === "temp" ? "tempInput" : "menu")}
            className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
          >
            ←
          </button>
          <div className="flex-1">
            <div className="text-xs text-zinc-500">補充說明（可跳過）</div>
            <h1 className="text-xl font-bold">
              {item.icon} {item.label}
              {selected === "temp" && tempValue && (
                <span className="ml-2 text-base text-zinc-500">{tempValue}°C</span>
              )}
            </h1>
          </div>
        </header>

        {/* Quick save (top) */}
        <div className="px-5 pt-4">
          <button
            onClick={handleSave}
            className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl font-semibold"
          >
            ⏩ 直接儲存（不寫說明）
          </button>
        </div>

        {/* Quick phrase chips */}
        <div className="px-5 mt-5">
          <h2 className="text-sm font-semibold text-zinc-500 mb-2">常用說明</h2>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => {
              const active = note === t;
              return (
                <button
                  key={t}
                  onClick={() => setNote(active ? "" : t)}
                  className={`px-4 h-12 rounded-full font-medium border-2 transition-colors ${
                    active
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 active:bg-zinc-50 dark:active:bg-zinc-800"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free text */}
        <div className="px-5 mt-5">
          <h2 className="text-sm font-semibold text-zinc-500 mb-2">或自己寫</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例：吃完藥後 30 分鐘吐了一些"
            rows={3}
            maxLength={200}
            className="w-full p-4 text-base rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none resize-none"
          />
          <div className="text-xs text-zinc-400 text-right mt-1">
            {note.length}/200
          </div>
        </div>

        {/* Share toggle */}
        <div className="px-5 mt-3">
          <ShareToggle
            shared={shareWithFamily}
            onChange={setShareWithFamily}
          />
        </div>

        {/* Save */}
        <div className="px-5 mt-5">
          <button
            onClick={handleSave}
            className="w-full h-16 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-xl font-bold"
          >
            儲存
          </button>
        </div>
      </main>
    );
  }

  // ----- Stage: menu (default) -----
  return (
    <main className="flex flex-col flex-1 pb-[calc(env(safe-area-inset-bottom)+12rem)] relative">
      {/* Cleared confirmation toast */}
      {clearedCount !== null && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md">
          <div className="flex items-center gap-3 p-4 bg-emerald-600 text-white rounded-2xl shadow-lg">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <div className="font-semibold">已清除 {clearedCount} 條記錄</div>
              <div className="text-xs opacity-90 mt-0.5">
                本機資料已刪除（已送給家屬的不受影響）
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
        >
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">📝 3 秒記錄</h1>
          <p className="text-xs text-zinc-500">{today}</p>
        </div>
      </header>

      {/* Last 1hr quick view */}
      {recentHourCount > 0 && (
        <div className="px-5 pt-4">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center gap-2">
            <span className="text-xs text-zinc-500 mr-1">最近 1 小時：</span>
            <span className="text-sm font-bold">{recentHourCount} 筆</span>
            <div className="flex gap-1 ml-auto">
              {recentItems.map((r, i) => (
                <span key={i} title={r.label} className="text-lg">
                  {r.icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-5">
        <h2 className="text-sm font-semibold text-zinc-500 mb-3">記錄什麼？</h2>
        <div className="grid grid-cols-2 gap-3">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="aspect-square flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 active:scale-95 transition-transform"
            >
              <span className="text-5xl mb-2">{item.icon}</span>
              <span className="text-base font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Share toggle (default) */}
      <div className="px-5 mt-6">
        <ShareToggle shared={shareWithFamily} onChange={setShareWithFamily} />
      </div>

      {/* Clear history */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-zinc-500 mb-2">歷史記錄</h2>
        {recordCount === 0 ? (
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-sm text-zinc-500 text-center">
            目前沒有記錄
          </div>
        ) : !showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 active:bg-zinc-50 dark:active:bg-zinc-800"
          >
            <div className="text-left">
              <div className="font-semibold">🗑️ 一鍵清歷史</div>
              <div className="text-xs text-zinc-500 mt-0.5">
                目前有 {recordCount} 條記錄
              </div>
            </div>
            <span className="text-zinc-400">›</span>
          </button>
        ) : (
          <div
            ref={confirmRef}
            className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-xl scroll-mt-20"
          >
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              確定要清除全部 {recordCount} 條記錄？
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
              清除後無法復原（已送給家屬的不會受影響）
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 h-12 bg-white dark:bg-zinc-900 rounded-xl font-semibold border border-zinc-200 dark:border-zinc-800"
              >
                取消
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 h-12 bg-red-600 active:bg-red-700 text-white rounded-xl font-semibold"
              >
                確定清除
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// 兩段式說明：點一下整塊切換，並把 2 種模式的差別講清楚
function ShareToggle({
  shared,
  onChange,
}: {
  shared: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
      {/* Mode 1: 僅本地 */}
      <button
        onClick={() => onChange(false)}
        className={`w-full text-left p-4 transition-colors ${
          !shared
            ? "bg-zinc-100 dark:bg-zinc-800"
            : "active:bg-zinc-50 dark:active:bg-zinc-800/60"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 ${
              !shared
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {!shared && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white dark:bg-zinc-900" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold">⚪ 僅本地</div>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 space-y-0.5 list-disc list-inside">
              <li>資料只存在這支手機</li>
              <li>家屬看不到，也不會收到通知</li>
              <li>你可以隨時用「一鍵清歷史」刪掉</li>
            </ul>
          </div>
        </div>
      </button>

      <div className="border-t border-zinc-200 dark:border-zinc-800" />

      {/* Mode 2: 送出給家屬 */}
      <button
        onClick={() => onChange(true)}
        className={`w-full text-left p-4 transition-colors ${
          shared
            ? "bg-emerald-50 dark:bg-emerald-950"
            : "active:bg-zinc-50 dark:active:bg-zinc-800/60"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 ${
              shared
                ? "border-emerald-600 bg-emerald-600"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {shared && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold">🟢 送出給家屬</div>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 space-y-0.5 list-disc list-inside">
              <li>家屬會收到 LINE 推播</li>
              <li>你寫的說明會一起傳過去</li>
              <li>
                <span className="text-amber-700 dark:text-amber-400">
                  送出後家屬端的紀錄無法刪除
                </span>
              </li>
            </ul>
          </div>
        </div>
      </button>
    </div>
  );
}
