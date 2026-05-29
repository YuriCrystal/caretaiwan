"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getElderById,
  upsertElder,
  deleteElder,
  emptyElder,
  setActiveElder,
  type Elder,
  type Medication,
  type Contact,
} from "@/lib/elder";
import { autoSyncIfLoggedIn } from "@/lib/auto-sync";

function EditElderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "new";
  const [elder, setElder] = useState<Elder>(emptyElder());
  const [loaded, setLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id !== "new") {
      const e = getElderById(id);
      if (e) setElder(e);
    }
    setLoaded(true);
  }, [id]);

  const update = <K extends keyof Elder>(k: K, v: Elder[K]) =>
    setElder((e) => ({ ...e, [k]: v }));

  const addMed = () =>
    update("medications", [...elder.medications, { name: "", dose: "", time: "" }]);
  const updateMed = (i: number, k: keyof Medication, v: string) => {
    const next = [...elder.medications];
    next[i] = { ...next[i], [k]: v };
    update("medications", next);
  };
  const removeMed = (i: number) =>
    update("medications", elder.medications.filter((_, idx) => idx !== i));

  const addContact = () =>
    update("contacts", [...elder.contacts, { name: "", relation: "", phone: "" }]);
  const updateContact = (i: number, k: keyof Contact, v: string) => {
    const next = [...elder.contacts];
    next[i] = { ...next[i], [k]: v };
    update("contacts", next);
  };
  const removeContact = (i: number) =>
    update("contacts", elder.contacts.filter((_, idx) => idx !== i));

  const handleSave = () => {
    const saved = upsertElder(elder);
    setActiveElder(saved.elders[saved.elders.length - 1].id);
    autoSyncIfLoggedIn(); // 自動同步雲端（家屬端才看得到）
    router.push("/family/card");
  };

  const handleDelete = () => {
    if (id !== "new") deleteElder(id);
    autoSyncIfLoggedIn();
    router.push("/family/card");
  };

  if (!loaded) {
    return <main className="flex flex-col flex-1 pb-32" />;
  }

  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/family/card"
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">
          {id === "new" ? "➕ 新增老人" : "✏️ 編輯檔案"}
        </h1>
      </header>

      <div className="px-5 pt-4 space-y-5">
        <FormSection title="基本資料">
          <Field label="姓名" required>
            <input
              type="text"
              value={elder.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="王阿嬤"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="性別">
              <select
                value={elder.gender}
                onChange={(e) => update("gender", e.target.value as Elder["gender"])}
                className={inputCls}
              >
                <option value="">—</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </Field>
            <Field label="血型">
              <select
                value={elder.bloodType}
                onChange={(e) => update("bloodType", e.target.value)}
                className={inputCls}
              >
                <option value="">—</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="O">O</option>
                <option value="AB">AB</option>
                <option value="不確定">不確定</option>
              </select>
            </Field>
          </div>
          <Field label="生日">
            <input
              type="date"
              value={elder.birthday}
              onChange={(e) => update("birthday", e.target.value)}
              className={inputCls}
            />
          </Field>
        </FormSection>

        <FormSection title="健康狀況">
          <Field label="過敏（藥物／食物／其他）">
            <textarea
              value={elder.allergies}
              onChange={(e) => update("allergies", e.target.value)}
              placeholder="例:青黴素、海鮮"
              rows={2}
              className={inputCls + " resize-none py-2"}
            />
          </Field>
          <Field label="病史">
            <textarea
              value={elder.history}
              onChange={(e) => update("history", e.target.value)}
              placeholder="例:高血壓、糖尿病、輕度失智"
              rows={3}
              className={inputCls + " resize-none py-2"}
            />
          </Field>
        </FormSection>

        <FormSection title="慣用藥">
          {elder.medications.length === 0 && (
            <p className="text-sm text-slate-500 mb-2">尚未新增</p>
          )}
          <div className="space-y-3">
            {elder.medications.map((m, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => updateMed(i, "name", e.target.value)}
                  placeholder="藥名（如:脈優錠）"
                  className={inputCls}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={m.dose}
                    onChange={(e) => updateMed(i, "dose", e.target.value)}
                    placeholder="劑量（1 顆）"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={m.time}
                    onChange={(e) => updateMed(i, "time", e.target.value)}
                    placeholder="時間（早餐後）"
                    className={inputCls}
                  />
                </div>
                <button
                  onClick={() => removeMed(i)}
                  className="text-sm text-red-600 dark:text-red-400 active:text-red-700"
                >
                  🗑️ 刪除這項
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addMed}
            className="mt-3 w-full h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-semibold active:bg-slate-50 dark:active:bg-slate-800"
          >
            + 新增一筆藥
          </button>
        </FormSection>

        <FormSection title="主治醫療">
          <Field label="主治醫師">
            <input
              type="text"
              value={elder.doctor}
              onChange={(e) => update("doctor", e.target.value)}
              placeholder="例:陳醫師（內科）"
              className={inputCls}
            />
          </Field>
          <Field label="主要就醫醫院">
            <input
              type="text"
              value={elder.hospital}
              onChange={(e) => update("hospital", e.target.value)}
              placeholder="例:台北榮總"
              className={inputCls}
            />
          </Field>
        </FormSection>

        <FormSection title="緊急聯絡人">
          {elder.contacts.length === 0 && (
            <p className="text-sm text-slate-500 mb-2">尚未新增</p>
          )}
          <div className="space-y-3">
            {elder.contacts.map((c, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateContact(i, "name", e.target.value)}
                    placeholder="姓名"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={c.relation}
                    onChange={(e) => updateContact(i, "relation", e.target.value)}
                    placeholder="關係（女兒）"
                    className={inputCls}
                  />
                </div>
                <input
                  type="tel"
                  value={c.phone}
                  onChange={(e) => updateContact(i, "phone", e.target.value)}
                  placeholder="電話"
                  className={inputCls}
                />
                <button
                  onClick={() => removeContact(i)}
                  className="text-sm text-red-600 dark:text-red-400 active:text-red-700"
                >
                  🗑️ 刪除這位
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addContact}
            className="mt-3 w-full h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-semibold active:bg-slate-50 dark:active:bg-slate-800"
          >
            + 新增聯絡人
          </button>
        </FormSection>

        {/* Save */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSave}
            disabled={!elder.name.trim()}
            className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl text-xl font-bold disabled:opacity-30"
          >
            儲存
          </button>
          {!elder.name.trim() && (
            <p className="text-xs text-slate-500 text-center">請先填姓名</p>
          )}
        </div>

        {/* Delete (existing only) */}
        {id !== "new" && (
          <div className="pt-4">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full h-12 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-semibold active:bg-red-50 dark:active:bg-red-950"
              >
                🗑️ 刪除此筆檔案
              </button>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-xl">
                <p className="font-semibold text-red-900 dark:text-red-100">
                  確定刪除「{elder.name || "這位"}」？
                </p>
                <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                  刪除後無法復原（本地資料）
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 h-12 bg-white dark:bg-slate-900 rounded-xl font-semibold border border-slate-200 dark:border-slate-800"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 h-12 bg-red-600 active:bg-red-700 text-white rounded-xl font-semibold"
                  >
                    確定刪除
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const inputCls =
  "w-full h-12 px-3 text-base rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-slate-100 focus:outline-none";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function EditElderPage() {
  return (
    <Suspense fallback={<main className="flex flex-col flex-1 pb-32" />}>
      <EditElderInner />
    </Suspense>
  );
}
