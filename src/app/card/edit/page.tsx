"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getElder,
  saveElder,
  emptyElder,
  type Elder,
  type Medication,
  type Contact,
} from "@/lib/elder";

export default function EditElderPage() {
  const router = useRouter();
  const [elder, setElder] = useState<Elder>(emptyElder());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const existing = getElder();
    if (existing) setElder(existing);
    setLoaded(true);
  }, []);

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
    saveElder(elder);
    router.push("/card");
  };

  if (!loaded) {
    return <main className="flex flex-col flex-1 pb-32" />;
  }

  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/card"
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">✏️ 編輯老人檔案</h1>
      </header>

      <div className="px-5 pt-4 space-y-5">
        {/* Basic */}
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

        {/* Health */}
        <FormSection title="健康狀況">
          <Field label="過敏（藥物／食物／其他）">
            <textarea
              value={elder.allergies}
              onChange={(e) => update("allergies", e.target.value)}
              placeholder="例：青黴素、海鮮"
              rows={2}
              className={inputCls + " resize-none"}
            />
          </Field>
          <Field label="病史">
            <textarea
              value={elder.history}
              onChange={(e) => update("history", e.target.value)}
              placeholder="例：高血壓 10 年、糖尿病 5 年、輕度失智"
              rows={3}
              className={inputCls + " resize-none"}
            />
          </Field>
        </FormSection>

        {/* Medications */}
        <FormSection title="慣用藥">
          {elder.medications.length === 0 && (
            <p className="text-sm text-zinc-500 mb-2">尚未新增</p>
          )}
          <div className="space-y-3">
            {elder.medications.map((m, i) => (
              <div
                key={i}
                className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl space-y-2"
              >
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => updateMed(i, "name", e.target.value)}
                  placeholder="藥名（如：脈優錠）"
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
            className="mt-3 w-full h-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 font-semibold active:bg-zinc-50 dark:active:bg-zinc-800"
          >
            + 新增一筆藥
          </button>
        </FormSection>

        {/* Doctor / Hospital */}
        <FormSection title="主治醫療">
          <Field label="主治醫師">
            <input
              type="text"
              value={elder.doctor}
              onChange={(e) => update("doctor", e.target.value)}
              placeholder="例：陳醫師（內科）"
              className={inputCls}
            />
          </Field>
          <Field label="主要就醫醫院">
            <input
              type="text"
              value={elder.hospital}
              onChange={(e) => update("hospital", e.target.value)}
              placeholder="例：台北榮總"
              className={inputCls}
            />
          </Field>
        </FormSection>

        {/* Contacts */}
        <FormSection title="緊急聯絡人">
          {elder.contacts.length === 0 && (
            <p className="text-sm text-zinc-500 mb-2">尚未新增</p>
          )}
          <div className="space-y-3">
            {elder.contacts.map((c, i) => (
              <div
                key={i}
                className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl space-y-2"
              >
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
            className="mt-3 w-full h-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 font-semibold active:bg-zinc-50 dark:active:bg-zinc-800"
          >
            + 新增聯絡人
          </button>
        </FormSection>

        {/* Save */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSave}
            disabled={!elder.name.trim()}
            className="w-full h-16 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-xl font-bold disabled:opacity-30"
          >
            儲存
          </button>
          {!elder.name.trim() && (
            <p className="text-xs text-zinc-500 text-center">請先填姓名</p>
          )}
        </div>
      </div>
    </main>
  );
}

const inputCls =
  "w-full h-12 px-3 text-base rounded-xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">
        {title}
      </h2>
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
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
