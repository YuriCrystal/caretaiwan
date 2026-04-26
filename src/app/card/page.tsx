"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getStore,
  setActiveElder,
  calculateAge,
  type Elder,
} from "@/lib/elder";

export default function CardPage() {
  const [elders, setElders] = useState<Elder[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);

  useEffect(() => {
    const s = getStore();
    setElders(s.elders);
    setActiveId(s.activeId || s.elders[0]?.id || "");
    setLoaded(true);
  }, []);

  const elder = elders.find((e) => e.id === activeId) ?? elders[0] ?? null;

  const handleSwitch = (id: string) => {
    setActiveId(id);
    setActiveElder(id);
    setShowSwitch(false);
  };

  const buildCardText = (e: Elder): string => {
    const lines: string[] = [];
    lines.push(`【醫護卡 / ${e.name}】`);
    const meta = [
      e.gender === "male" ? "男" : e.gender === "female" ? "女" : null,
      calculateAge(e.birthday) !== null ? `${calculateAge(e.birthday)} 歲` : null,
      e.bloodType ? `${e.bloodType} 型` : null,
    ]
      .filter(Boolean)
      .join(" / ");
    if (meta) lines.push(meta);
    if (e.allergies) lines.push(`\n⚠️ 過敏：\n${e.allergies}`);
    if (e.medications.length > 0) {
      lines.push(`\n💊 慣用藥：`);
      e.medications.forEach((m) =>
        lines.push(`・${m.name}　${m.dose}　${m.time}`)
      );
    }
    if (e.history) lines.push(`\n📋 病史：\n${e.history}`);
    if (e.doctor || e.hospital) {
      lines.push(`\n🏥 主治醫療：`);
      if (e.doctor) lines.push(`醫師：${e.doctor}`);
      if (e.hospital) lines.push(`醫院：${e.hospital}`);
    }
    if (e.contacts.length > 0) {
      lines.push(`\n📞 緊急聯絡人：`);
      e.contacts.forEach((c) =>
        lines.push(`・${c.name}（${c.relation}）${c.phone}`)
      );
    }
    return lines.join("\n");
  };

  const handleShare = async () => {
    if (!elder) return;
    const text = buildCardText(elder);
    // Try Web Share API (mobile native sheet)
    if (navigator.share) {
      try {
        await navigator.share({ title: `醫護卡 / ${elder.name}`, text });
        return;
      } catch {
        // user cancelled or share failed → fallback
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      alert("已複製到剪貼簿，可貼到 LINE / 簡訊");
    } catch {
      alert("複製失敗");
    }
  };

  if (!loaded) {
    return <main className="flex flex-col flex-1 pb-32" />;
  }

  // Empty state
  if (elders.length === 0) {
    return (
      <main className="flex flex-col flex-1 pb-32">
        <Header elderCount={0} />
        <div className="px-5 pt-8">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-center">
            <div className="text-5xl mb-3">🆔</div>
            <p className="text-base font-semibold mb-1">尚未建立老人健康檔案</p>
            <p className="text-sm text-zinc-500 mb-5">
              填寫後，這張卡片可在就醫時直接給醫護看
            </p>
            <Link
              href="/card/edit?id=new"
              className="inline-block px-6 h-12 leading-[3rem] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-bold"
            >
              建立檔案
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!elder) {
    return null;
  }

  const age = calculateAge(elder.birthday);
  const genderLabel =
    elder.gender === "male" ? "男" : elder.gender === "female" ? "女" : "";

  return (
    <main className="flex flex-col flex-1 pb-32">
      <Header elderCount={elders.length} onSwitch={() => setShowSwitch(true)} />

      {/* Switch sheet */}
      {showSwitch && (
        <div
          className="fixed inset-0 bg-black/50 z-40 flex items-end justify-center"
          onClick={() => setShowSwitch(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-3">切換老人</h2>
            <div className="space-y-2">
              {elders.map((e) => {
                const active = e.id === activeId;
                return (
                  <button
                    key={e.id}
                    onClick={() => handleSwitch(e.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 ${
                      active
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 active:bg-zinc-50 dark:active:bg-zinc-800"
                    }`}
                  >
                    <span className="text-2xl">
                      {e.gender === "female" ? "👵" : e.gender === "male" ? "👴" : "🧓"}
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{e.name || "未命名"}</div>
                      <div className="text-xs text-zinc-500">
                        {[
                          e.gender === "male" ? "男" : e.gender === "female" ? "女" : null,
                          calculateAge(e.birthday) !== null
                            ? `${calculateAge(e.birthday)} 歲`
                            : null,
                          e.bloodType ? `${e.bloodType} 型` : null,
                        ]
                          .filter(Boolean)
                          .join(" ・ ") || "—"}
                      </div>
                    </div>
                    {active && (
                      <span className="text-xs px-2 py-0.5 bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 rounded-full">
                        目前
                      </span>
                    )}
                  </button>
                );
              })}
              <Link
                href="/card/edit?id=new"
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 font-semibold active:bg-zinc-50 dark:active:bg-zinc-800"
              >
                + 新增另一位
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-4 space-y-4">
        {/* Header card: name + key info */}
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-900 dark:border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500">受照顧者 / Patient</div>
            {elders.length > 1 && (
              <div className="text-xs text-zinc-500">
                {elders.findIndex((e) => e.id === elder.id) + 1} / {elders.length}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold tracking-tight mt-1">{elder.name}</div>
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

        {elder.allergies && (
          <Section title="⚠️ 過敏" emphasis>
            <p className="text-base whitespace-pre-wrap leading-relaxed">{elder.allergies}</p>
          </Section>
        )}

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

        {elder.history && (
          <Section title="📋 病史">
            <p className="text-base whitespace-pre-wrap leading-relaxed">{elder.history}</p>
          </Section>
        )}

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

        {/* Pairing for LINE Bot */}
        <PairingSection elderId={elder.id} elderName={elder.name} />

        {/* Share + edit */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleShare}
            className="h-12 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-semibold"
          >
            📤 分享文字給家屬
          </button>
          <Link
            href={`/card/edit?id=${elder.id}`}
            className="h-12 leading-[3rem] text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-semibold active:bg-zinc-50 dark:active:bg-zinc-800"
          >
            ✏️ 編輯
          </Link>
        </div>
      </div>
    </main>
  );
}

function Header({
  elderCount,
  onSwitch,
}: {
  elderCount: number;
  onSwitch?: () => void;
}) {
  return (
    <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
      <Link
        href="/"
        className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
      >
        ←
      </Link>
      <h1 className="text-xl font-bold flex-1">🆔 醫護卡</h1>
      {elderCount > 1 && onSwitch && (
        <button
          onClick={onSwitch}
          className="px-3 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold active:bg-zinc-200 dark:active:bg-zinc-700"
        >
          ⇆ 切換 ({elderCount})
        </button>
      )}
      {elderCount === 1 && (
        <Link
          href="/card/edit?id=new"
          className="px-3 h-10 leading-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold active:bg-zinc-200 dark:active:bg-zinc-700"
        >
          + 新增
        </Link>
      )}
    </header>
  );
}

function PairingSection({
  elderId,
  elderName,
}: {
  elderId: string;
  elderName: string;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [paired, setPaired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((s) => setLoggedIn(s.loggedIn === true))
      .catch(() => setLoggedIn(false));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pairing/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId, displayName: elderName }),
      });
      const data = await res.json();
      if (res.ok) {
        setCode(data.code);
        setPaired(data.paired);
      } else {
        setError(data.error ?? "失敗");
      }
    } catch {
      setError("網路錯誤");
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn === null) {
    return null;
  }

  if (!loggedIn) {
    return (
      <section className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500">
        💡 想讓家屬透過 LINE 收到記錄通知？先到「
        <Link href="/backup" className="underline">
          備份頁
        </Link>
        」用 LINE 登入，再回來這裡產生配對碼。
      </section>
    );
  }

  return (
    <section className="p-4 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-2xl">
      <h2 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">
        📲 配對家屬 LINE
      </h2>
      {!code && (
        <>
          <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
            產生 6 位配對碼，傳給家屬。家屬加入 LINE 官方帳號後輸入此碼，
            之後你按「送出給家屬」的記錄會直接傳到家屬的 LINE。
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full h-12 bg-blue-600 active:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? "處理中…" : "產生配對碼"}
          </button>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
          )}
        </>
      )}
      {code && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-xs text-zinc-500 mb-1">配對碼</div>
            <div className="text-3xl font-bold tracking-widest tabular-nums">
              {code}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              {paired ? "✅ 已配對家屬" : "⏳ 等待家屬輸入此碼"}
            </div>
          </div>
          <div className="text-xs text-blue-900 dark:text-blue-100 space-y-1">
            <p>1. 把上面 6 碼傳給家屬</p>
            <p>2. 家屬加官方帳號為好友（QR 碼／ID 由你提供）</p>
            <p>3. 家屬把這 6 碼貼給 Bot 即配對</p>
          </div>
        </div>
      )}
    </section>
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
