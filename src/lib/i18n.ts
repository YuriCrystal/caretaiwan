// 看護端 i18n - 支援 zh-TW（預設）/ vi（越南文）/ id（印尼文）
// 使用方式: const t = useT(); <h1>{t.card.title}</h1>
import { useEffect, useState } from "react";
import { DICT, type Dict } from "./i18n/dict";

export type Lang = "zh-TW" | "vi" | "id";

export const LANG_LABEL: Record<Lang, string> = {
  "zh-TW": "繁體中文",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
};

const KEY = "app-lang";

export function getLang(): Lang {
  if (typeof window === "undefined") return "zh-TW";
  const v = localStorage.getItem(KEY);
  if (v === "vi" || v === "id" || v === "zh-TW") return v;
  return "zh-TW";
}

export function setLang(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, lang);
  // 觸發跨元件同步
  window.dispatchEvent(new CustomEvent("lang-change", { detail: lang }));
}

// 元件 hook: 取當前語言的字典 + 自動跟著切換 re-render
export function useT(): Dict {
  const [lang, setLangState] = useState<Lang>("zh-TW");
  useEffect(() => {
    setLangState(getLang());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Lang>).detail;
      if (detail) setLangState(detail);
    };
    window.addEventListener("lang-change", onChange);
    return () => window.removeEventListener("lang-change", onChange);
  }, []);
  return DICT[lang];
}

export function useLang(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("zh-TW");
  useEffect(() => {
    setLangState(getLang());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Lang>).detail;
      if (detail) setLangState(detail);
    };
    window.addEventListener("lang-change", onChange);
    return () => window.removeEventListener("lang-change", onChange);
  }, []);
  const set = (l: Lang) => {
    setLang(l);
    setLangState(l);
  };
  return [lang, set];
}
