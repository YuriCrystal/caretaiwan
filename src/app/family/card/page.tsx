"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getStore,
  setActiveElder,
  calculateAge,
  type Elder,
} from "@/lib/elder";
import { getRole } from "@/lib/role";

export default function CardPage() {
  const router = useRouter();
  const [elders, setElders] = useState<Elder[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);

  // 看護身分跑錯路由就重導
  useEffect(() => {
    if (getRole() === "caregiver") router.replace("/card");
  }, [router]);

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
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
            <div className="text-5xl mb-3">🆔</div>
            <p className="text-base font-semibold mb-1">尚未建立老人健康檔案</p>
            <p className="text-sm text-slate-500 mb-5">
              填寫後，這張卡片可在就醫時直接給醫護看
            </p>
            <Link
              href="/family/card/edit?id=new"
              className="inline-block px-6 h-12 leading-[3rem] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold"
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
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />
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
                        ? "border-slate-900 dark:border-slate-100 bg-slate-100 dark:bg-slate-800"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 active:bg-slate-50 dark:active:bg-slate-800"
                    }`}
                  >
                    <span className="text-2xl">
                      {e.gender === "female" ? "👵" : e.gender === "male" ? "👴" : "🧓"}
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{e.name || "未命名"}</div>
                      <div className="text-xs text-slate-500">
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
                      <span className="text-xs px-2 py-0.5 bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 rounded-full">
                        目前
                      </span>
                    )}
                  </button>
                );
              })}
              <Link
                href="/family/card/edit?id=new"
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-semibold active:bg-slate-50 dark:active:bg-slate-800"
              >
                + 新增另一位
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-4 space-y-4">
        {/* Header card: name + key info */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-900 dark:border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">受照顧者 / Patient</div>
            {elders.length > 1 && (
              <div className="text-xs text-slate-500">
                {elders.findIndex((e) => e.id === elder.id) + 1} / {elders.length}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold tracking-tight mt-1">{elder.name}</div>
          <div className="flex items-center gap-3 mt-2 text-base text-slate-700 dark:text-slate-300">
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
                  <div className="text-sm text-slate-600 dark:text-slate-400">
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
                <span className="text-slate-500 text-sm mr-2">醫師</span>
                {elder.doctor}
              </div>
            )}
            {elder.hospital && (
              <div className="text-base mt-1">
                <span className="text-slate-500 text-sm mr-2">醫院</span>
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
                    <div className="text-sm text-slate-600 dark:text-slate-400">
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

        {/* 家族 LINE 群組推播 */}
        <GroupNotifySection elderId={elder.id} />

        {/* Share + edit */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleShare}
            className="h-12 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-semibold"
          >
            📤 分享醫護卡
          </button>
          <Link
            href={`/family/card/edit?id=${elder.id}`}
            className="h-12 leading-[3rem] text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold active:bg-slate-50 dark:active:bg-slate-800"
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
    <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
      <Link
        href="/family"
        className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
      >
        ←
      </Link>
      <h1 className="text-xl font-bold flex-1">🆔 醫護卡</h1>
      {elderCount > 1 && onSwitch && (
        <button
          onClick={onSwitch}
          className="px-3 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold active:bg-slate-200 dark:active:bg-slate-700"
        >
          ⇆ 切換 ({elderCount})
        </button>
      )}
      {elderCount === 1 && (
        <Link
          href="/family/card/edit?id=new"
          className="px-3 h-10 leading-10 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold active:bg-slate-200 dark:active:bg-slate-700"
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
  const [confirmUnbind, setConfirmUnbind] = useState(false);
  const [unbindMsg, setUnbindMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
        // 配對碼產生後同步雲端，家屬配對後才看得到醫護卡
        const { autoSyncIfLoggedIn } = await import("@/lib/auto-sync");
        autoSyncIfLoggedIn();
      } else {
        setError(data.error ?? "失敗");
      }
    } catch {
      setError("網路錯誤");
    } finally {
      setLoading(false);
    }
  };

  const handleUnbind = async () => {
    setLoading(true);
    setUnbindMsg(null);
    try {
      const res = await fetch("/api/pairing/unbind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCode(null);
        setPaired(false);
        setConfirmUnbind(false);
        setUnbindMsg({ ok: true, text: "已解除配對。可重新「產生配對碼」給新看護。" });
        setTimeout(() => setUnbindMsg(null), 4000);
      } else {
        setUnbindMsg({ ok: false, text: data.error ?? "解除失敗" });
      }
    } catch {
      setUnbindMsg({ ok: false, text: "網路錯誤" });
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn === null) {
    return null;
  }

  if (!loggedIn) {
    return (
      <section className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
        💡 想讓看護的記錄推送到你的 LINE？先到「
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
        📲 配對看護
      </h2>
      {!code && (
        <>
          <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
            產生 6 位配對碼,傳給看護。看護在他們的 PWA 輸入此碼後,
            之後看護按「送出給家屬」的記錄會直接傳到你的 LINE。
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
          <Link
            href="/family-setup"
            className="block text-center text-xs text-blue-700 dark:text-blue-300 underline mt-3"
          >
            完整教學：怎麼讓家屬接收推播 →
          </Link>
        </>
      )}
      {code && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 text-center">
            <div className="text-xs text-slate-500 mb-1">配對碼</div>
            <div className="text-3xl font-bold tracking-widest tabular-nums">
              {code}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {paired ? "✅ 已配對看護" : "⏳ 等待看護輸入此碼"}
            </div>
          </div>
          <div className="text-xs text-blue-900 dark:text-blue-100 space-y-1">
            <p>1. 把上面 6 碼傳給看護</p>
            <p>2. 看護在 PWA 用 LINE 登入並輸入此碼</p>
            <p>3. 你也要加 LINE Bot 為好友才能收推播</p>
          </div>
          <Link
            href="/family-setup"
            className="block text-center w-full h-11 leading-[2.75rem] bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 rounded-xl font-semibold border border-blue-300 dark:border-blue-700"
          >
            完整 5 步教學 →
          </Link>

          {/* 解除配對 (只有已綁定看護才顯示,因為才有「解除」需求) */}
          {paired && !confirmUnbind && (
            <button
              onClick={() => setConfirmUnbind(true)}
              className="w-full h-11 text-sm bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 rounded-xl font-semibold border border-red-300 dark:border-red-800 active:bg-red-50 dark:active:bg-red-950"
            >
              🔓 解除看護配對
            </button>
          )}
          {paired && confirmUnbind && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-xl">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                確定解除目前看護的配對?
              </p>
              <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                解除後現有看護無法再傳記錄到你的 LINE。可重新「產生配對碼」給新看護。
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setConfirmUnbind(false)}
                  className="flex-1 h-10 bg-white dark:bg-slate-900 rounded-lg font-semibold text-sm"
                  disabled={loading}
                >
                  取消
                </button>
                <button
                  onClick={handleUnbind}
                  disabled={loading}
                  className="flex-1 h-10 bg-red-600 active:bg-red-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50"
                >
                  {loading ? "處理中…" : "確定解除"}
                </button>
              </div>
            </div>
          )}
          {unbindMsg && (
            <div
              className={`p-3 rounded-xl text-sm ${
                unbindMsg.ok
                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-300/60 dark:ring-emerald-800"
                  : "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 ring-1 ring-red-300/60 dark:ring-red-800"
              }`}
            >
              {unbindMsg.text}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function GroupNotifySection({ elderId }: { elderId: string }) {
  const [loaded, setLoaded] = useState(false);
  const [exists, setExists] = useState(false);
  const [paired, setPaired] = useState(false);
  const [groupBound, setGroupBound] = useState(false);
  const [groupPhoto, setGroupPhoto] = useState(true);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmUnbind, setConfirmUnbind] = useState(false);
  const [confirmCreate, setConfirmCreate] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch(`/api/pairing/status?elderId=${encodeURIComponent(elderId)}`);
      if (!res.ok) {
        setLoaded(true);
        return;
      }
      const data = await res.json();
      setExists(!!data.exists);
      setPaired(!!data.paired);
      setGroupBound(!!data.groupBound);
      setGroupPhoto(data.groupPhotoEnabled !== false);
      setPendingCode(data.groupPairingCode ?? null);
    } catch {}
    setLoaded(true);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elderId]);

  // 還沒配對看護 → 整個區塊先不要顯示(避免介面太雜)
  if (!loaded) return null;
  if (!exists || !paired) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/pairing/group-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "失敗" });
        return;
      }
      if (data.alreadyBound) {
        setMsg({ ok: true, text: "此卡已綁定群組,如需更換請先解除" });
        refresh();
        return;
      }
      setPendingCode(data.code);
      setConfirmCreate(false);
    } catch {
      setMsg({ ok: false, text: "網路錯誤" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnbind = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/pairing/group-unbind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "解除失敗" });
        return;
      }
      setMsg({ ok: true, text: "已解除群組推播" });
      setConfirmUnbind(false);
      setPendingCode(null);
      setGroupBound(false);
      setTimeout(() => setMsg(null), 4000);
    } catch {
      setMsg({ ok: false, text: "網路錯誤" });
    } finally {
      setLoading(false);
    }
  };

  const togglePhoto = async (enabled: boolean) => {
    setGroupPhoto(enabled); // optimistic
    try {
      const res = await fetch("/api/pairing/group-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId, enabled }),
      });
      if (!res.ok) {
        setGroupPhoto(!enabled); // revert
      }
    } catch {
      setGroupPhoto(!enabled);
    }
  };

  const copyCode = async () => {
    if (!pendingCode) return;
    try {
      await navigator.clipboard.writeText(pendingCode);
      setMsg({ ok: true, text: "已複製配對碼" });
      setTimeout(() => setMsg(null), 2000);
    } catch {
      setMsg({ ok: false, text: "複製失敗" });
    }
  };

  return (
    <section className="p-4 bg-purple-50 dark:bg-purple-950 border-2 border-purple-200 dark:border-purple-800 rounded-2xl">
      <h2 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-2">
        👨‍👩‍👧‍👦 家族 LINE 群組推播
      </h2>

      {/* 已綁狀態 */}
      {groupBound && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3">
            <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <span>✅</span>
              <span>已綁定家族群組</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              看護按「送出給家屬+群組」的記錄會推到群組裡。
            </p>
          </div>

          {/* 照片 toggle */}
          <button
            onClick={() => togglePhoto(!groupPhoto)}
            className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl"
          >
            <div className="text-left">
              <div className="text-sm font-semibold">群組訊息包含照片</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {groupPhoto ? "目前:開啟" : "目前:關閉(僅文字)"}
              </div>
            </div>
            <div
              className={`relative w-11 h-6 rounded-full transition-colors ${
                groupPhoto ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  groupPhoto ? "translate-x-[1.375rem]" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>

          {/* 解除 */}
          {!confirmUnbind && (
            <button
              onClick={() => setConfirmUnbind(true)}
              className="w-full h-11 text-sm bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 rounded-xl font-semibold border border-red-300 dark:border-red-800 active:bg-red-50 dark:active:bg-red-950"
            >
              🔓 解除群組推播
            </button>
          )}
          {confirmUnbind && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-xl">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                確定解除群組推播?
              </p>
              <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                解除後群組將不再收到看護的記錄。
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setConfirmUnbind(false)}
                  className="flex-1 h-10 bg-white dark:bg-slate-900 rounded-lg font-semibold text-sm"
                  disabled={loading}
                >
                  取消
                </button>
                <button
                  onClick={handleUnbind}
                  disabled={loading}
                  className="flex-1 h-10 bg-red-600 active:bg-red-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50"
                >
                  {loading ? "處理中…" : "確定解除"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 未綁,有待綁定的配對碼 */}
      {!groupBound && pendingCode && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">群組配對碼(24小時有效)</div>
            <div className="text-3xl font-bold tracking-widest tabular-nums text-center">
              {pendingCode}
            </div>
            <button
              onClick={copyCode}
              className="w-full mt-3 h-9 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded-lg text-sm font-semibold"
            >
              📋 複製配對碼
            </button>
          </div>
          <div className="text-xs text-purple-900 dark:text-purple-100 space-y-1">
            <p className="font-semibold">綁定步驟:</p>
            <p>1. 把 Bot「看護助手家屬端」加入家族 LINE 群組</p>
            <p>2. 在群組裡直接傳送上面 6 碼</p>
            <p>3. Bot 回覆「✅ 綁定成功」就完成了</p>
          </div>
        </div>
      )}

      {/* 未綁、沒待綁配對碼:顯示產碼按鈕 */}
      {!groupBound && !pendingCode && !confirmCreate && (
        <>
          <p className="text-sm text-purple-900 dark:text-purple-100 mb-3 leading-relaxed">
            把 Bot 加進家族 LINE 群組,看護的記錄會自動推到群組裡,
            讓兄弟姊妹、媳婦、姪女等家人都能看到。
          </p>
          <button
            onClick={() => setConfirmCreate(true)}
            className="w-full h-12 bg-purple-600 active:bg-purple-700 text-white rounded-xl font-semibold"
          >
            產生群組配對碼
          </button>
        </>
      )}

      {/* 產碼前的隱私警示 */}
      {!groupBound && !pendingCode && confirmCreate && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            ⚠️ 隱私提醒
          </p>
          <ul className="text-xs text-amber-900 dark:text-amber-100 space-y-1 list-disc list-inside">
            <li>群組裡的所有成員(包含後續被加進來的人)都會看到老人的健康記錄與照片</li>
            <li>請勿綁定到陌生人會看到的群組(如鄰居 line 群、廟裡群組)</li>
            <li>照片是否要傳到群組,綁定後可隨時切換</li>
            <li>事後解除請回到本頁,看護的記錄就不會再推到群組</li>
          </ul>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setConfirmCreate(false)}
              className="flex-1 h-10 bg-white dark:bg-slate-900 rounded-lg font-semibold text-sm"
              disabled={loading}
            >
              取消
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 h-10 bg-purple-600 active:bg-purple-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "處理中…" : "我了解,產碼"}
            </button>
          </div>
        </div>
      )}

      {msg && (
        <div
          className={`mt-3 p-3 rounded-xl text-sm ${
            msg.ok
              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-300/60 dark:ring-emerald-800"
              : "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 ring-1 ring-red-300/60 dark:ring-red-800"
          }`}
        >
          {msg.text}
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
          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      }`}
    >
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
