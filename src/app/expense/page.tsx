"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, AlertTriangle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { getActivePairedElder, setActivePairedElder } from "@/lib/elder";
import { getRole } from "@/lib/role";
import { uploadPhoto } from "@/lib/photo";

type Category = "med" | "supply" | "food" | "medical" | "other";
type Stage = "menu" | "form" | "saved";

type ExpenseItem = {
  id: number;
  item_name: string;
  amount: number;
  category: Category;
  note: string | null;
  verify_status: "pending" | "confirmed" | "disputed";
  verify_note: string | null;
  created_at: string;
  photoUrl: string | null;
};

const CAT_ICON: Record<Category, string> = {
  med: "💊",
  supply: "🧻",
  food: "🍎",
  medical: "🏥",
  other: "📦",
};

export default function ExpensePage() {
  const router = useRouter();
  const t = useT();
  const [stage, setStage] = useState<Stage>("menu");
  const [elderId, setElderId] = useState<string | null>(null);
  const [elderName, setElderName] = useState<string>("");
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  // form state
  const [category, setCategory] = useState<Category>("supply");
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const revokePreview = (url: string | null) => {
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
  };

  // 家屬端不該進這頁
  useEffect(() => {
    if (getRole() === "family") router.replace("/family");
  }, [router]);

  // 線上偵測
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  // 拿配對狀態 + 列表
  useEffect(() => {
    const cache = getActivePairedElder();
    if (cache) {
      setElderId(cache.id);
      setElderName(cache.name);
    }
    fetch("/api/family/paired")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: {
            items?: { elderId: string; displayName: string | null }[];
          } | null
        ) => {
          if (!data?.items) return;
          const first = data.items[0];
          if (first) {
            setActivePairedElder({ id: first.elderId, name: first.displayName ?? "" });
            setElderId(first.elderId);
            setElderName(first.displayName ?? "");
          } else {
            setActivePairedElder(null);
            setElderId(null);
            setElderName("");
          }
        }
      )
      .finally(() => setLoading(false));
  }, []);

  // 拿 elder 後讀記帳列表
  useEffect(() => {
    if (!elderId) return;
    fetch(`/api/expense/list?elderId=${encodeURIComponent(elderId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { ok?: boolean; expenses?: ExpenseItem[] } | null) => {
        if (d?.ok && d.expenses) setItems(d.expenses);
      })
      .catch(() => {});
  }, [elderId, stage]);

  // cleanup blob URL
  useEffect(() => {
    return () => revokePreview(photoPreviewUrl);
  }, [photoPreviewUrl]);

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setSubmitError(null);
    revokePreview(photoPreviewUrl);
    setPhotoPreviewUrl(null);
    setPhotoPath(null);
    try {
      if (!elderId) {
        setSubmitError(t.expense.needPair);
        return;
      }
      const result = await uploadPhoto(file, {
        elderId,
        purpose: "expense",
      });
      if (result.ok && result.path && result.previewUrl) {
        setPhotoPath(result.path);
        setPhotoPreviewUrl(result.previewUrl);
      } else {
        setSubmitError(result.error ?? t.record.photoUploadFail);
      }
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setItemName("");
    setAmount("");
    setNote("");
    revokePreview(photoPreviewUrl);
    setPhotoPath(null);
    setPhotoPreviewUrl(null);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!elderId) {
      setSubmitError(t.expense.needPair);
      return;
    }
    if (!online) {
      setSubmitError(t.expense.needOnline);
      return;
    }
    if (!itemName.trim()) {
      setSubmitError(t.expense.needName);
      return;
    }
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) {
      setSubmitError(t.expense.needAmount);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/expense/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elderId,
          itemName: itemName.trim(),
          amount: n,
          category,
          note: note.trim() || undefined,
          photoPath: photoPath ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "建立失敗");
        return;
      }
      setStage("saved");
      resetForm();
      setTimeout(() => setStage("menu"), 1500);
    } catch {
      setSubmitError("網路錯誤");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="flex flex-col flex-1 pb-32" />;
  }

  // ---------- Stage: saved ----------
  if (stage === "saved") {
    return (
      <main className="flex flex-col flex-1 items-center justify-center pb-8">
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4 shadow-lift">
          <Check className="w-14 h-14 text-emerald-600 dark:text-emerald-300" strokeWidth={3} />
        </div>
        <p className="text-2xl font-bold">{t.expense.successMsg}</p>
      </main>
    );
  }

  // ---------- Stage: form ----------
  if (stage === "form") {
    return (
      <main className="flex flex-col flex-1 pb-[calc(env(safe-area-inset-bottom)+12rem)]">
        <header className="px-5 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setStage("menu");
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/70 shadow-card active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.4} />
          </button>
          <h1 className="text-xl font-bold">💰 {t.expense.addTitle}</h1>
        </header>

        {!online && (
          <div className="mx-5 mb-3 p-3 bg-amber-50 dark:bg-amber-950 ring-1 ring-amber-300/60 dark:ring-amber-800 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-300 shrink-0" strokeWidth={2.4} />
            <p className="text-xs text-amber-900 dark:text-amber-100">{t.expense.needOnline}</p>
          </div>
        )}

        <div className="px-5 space-y-4">
          {/* 分類 */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
              {t.expense.categoryLabel}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(["med", "supply", "food", "medical", "other"] as Category[]).map((c) => {
                const labels = {
                  med: t.expense.catMed,
                  supply: t.expense.catSupply,
                  food: t.expense.catFood,
                  medical: t.expense.catMedical,
                  other: t.expense.catOther,
                };
                const active = category === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${
                      active
                        ? "bg-blue-500 text-white shadow-lift"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-card"
                    }`}
                  >
                    <span className="text-2xl">{CAT_ICON[c]}</span>
                    <span className="text-xs font-semibold">{labels[c]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 品項名稱 */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
              {t.expense.itemNameLabel}
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              maxLength={100}
              placeholder={t.expense.itemNamePlaceholder}
              className="w-full p-4 text-base rounded-2xl bg-white dark:bg-slate-900 shadow-card border border-transparent focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* 金額 */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
              {t.expense.amountLabel}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.expense.amountPlaceholder}
                className="w-full pl-12 pr-4 py-4 text-2xl font-bold tabular-nums rounded-2xl bg-white dark:bg-slate-900 shadow-card border border-transparent focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
              {t.expense.noteLabel}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder={t.expense.notePlaceholder}
              className="w-full p-4 text-base rounded-2xl bg-white dark:bg-slate-900 shadow-card border border-transparent focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* 收據照片 */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
              {t.expense.photoTitle}
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.expense.photoHelp}</p>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoPick}
              className="hidden"
            />
            {!photoPreviewUrl && !photoUploading && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-card font-semibold text-slate-700 dark:text-slate-200 active:scale-[0.98] transition-transform"
              >
                {t.expense.photoAddBtn}
              </button>
            )}
            {photoUploading && (
              <div className="w-full h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-card flex items-center justify-center text-sm text-slate-500">
                {t.expense.photoUploading}
              </div>
            )}
            {photoPreviewUrl && (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreviewUrl}
                  alt="receipt"
                  className="w-full max-h-64 object-contain rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-card"
                />
                <button
                  type="button"
                  onClick={() => {
                    revokePreview(photoPreviewUrl);
                    setPhotoPath(null);
                    setPhotoPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 px-3 h-9 bg-slate-900/80 text-white text-xs rounded-full font-semibold backdrop-blur"
                >
                  ✕ {t.expense.photoRemove}
                </button>
              </div>
            )}
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-950 ring-1 ring-red-300/60 dark:ring-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
              {submitError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !online || !elderId}
            className="w-full h-14 bg-gradient-to-br from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700 text-white rounded-2xl text-lg font-bold shadow-lift disabled:opacity-40 disabled:from-slate-400 disabled:to-slate-500"
          >
            {submitting ? t.expense.submitting : t.expense.submitBtn}
          </button>
        </div>
      </main>
    );
  }

  // ---------- Stage: menu (list) ----------
  const monthTotal = items
    .filter((i) => {
      const d = new Date(i.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, i) => acc + Number(i.amount), 0);

  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/70 shadow-card active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.4} />
        </Link>
        <h1 className="text-xl font-bold flex-1">💰 {t.expense.listTitle}</h1>
      </header>

      {!elderId && (
        <div className="mx-5 mb-4 p-4 bg-amber-50 dark:bg-amber-950 ring-1 ring-amber-300/60 dark:ring-amber-800 rounded-2xl">
          <p className="text-sm text-amber-900 dark:text-amber-100">{t.expense.needPair}</p>
          <Link href="/card" className="text-sm underline text-amber-700 dark:text-amber-300 mt-1 inline-block">
            {t.record.shareToggle.lockedGoPair}
          </Link>
        </div>
      )}

      {/* 本月小計 */}
      {elderId && items.length > 0 && (
        <div className="mx-5 mb-4 p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lift">
          <div className="text-xs opacity-80">
            {t.expense.monthTotal} ({elderName})
          </div>
          <div className="text-3xl font-bold tabular-nums mt-1">
            $ {monthTotal.toLocaleString()}
          </div>
        </div>
      )}

      {/* 新增按鈕 */}
      {elderId && (
        <div className="px-5 mb-4">
          <button
            onClick={() => setStage("form")}
            className="w-full h-14 bg-white dark:bg-slate-900 active:bg-slate-50 dark:active:bg-slate-800 rounded-2xl font-bold text-blue-600 dark:text-blue-400 shadow-card text-lg"
          >
            + {t.expense.addTitle}
          </button>
        </div>
      )}

      {/* 列表 */}
      {elderId && (
        <div className="px-5 space-y-2">
          {items.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">{t.expense.listEmpty}</p>
          )}
          {items.map((it) => (
            <ExpenseRow key={it.id} item={it} t={t} />
          ))}
        </div>
      )}
    </main>
  );
}

function ExpenseRow({ item, t }: { item: ExpenseItem; t: ReturnType<typeof useT> }) {
  const catLabel = {
    med: t.expense.catMed,
    supply: t.expense.catSupply,
    food: t.expense.catFood,
    medical: t.expense.catMedical,
    other: t.expense.catOther,
  }[item.category];

  const statusBadge =
    item.verify_status === "confirmed"
      ? { text: t.expense.statusConfirmed, cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" }
      : item.verify_status === "disputed"
      ? { text: t.expense.statusDisputed, cls: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" }
      : { text: t.expense.statusPending, cls: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-card">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{CAT_ICON[item.category]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-semibold truncate">{item.item_name}</p>
            <span className="font-bold tabular-nums shrink-0">
              ${Number(item.amount).toFixed(0)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {catLabel} · {new Date(item.created_at).toLocaleString("zh-TW", { hour12: false })}
          </p>
          {item.note && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
              💬 {item.note}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusBadge.cls}`}>
              {statusBadge.text}
            </span>
            {item.verify_status === "disputed" && item.verify_note && (
              <span className="text-xs text-red-600 dark:text-red-400 truncate">
                · {item.verify_note}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
