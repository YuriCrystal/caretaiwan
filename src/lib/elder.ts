// 老人健康檔案（模組 C）— Phase 1 localStorage 版
// Phase 2 將接 Supabase 雲端同步

export type Medication = {
  name: string;       // 藥名
  dose: string;       // 劑量（例：1 顆 / 5mg）
  time: string;       // 時間（例：早餐後 / 三餐＋睡前）
};

export type Contact = {
  name: string;
  relation: string;   // 與老人關係（例：女兒 / 兒子）
  phone: string;
};

export type Elder = {
  name: string;          // 中文姓名
  gender: "male" | "female" | "";
  birthday: string;      // YYYY-MM-DD
  bloodType: string;     // A / B / O / AB / 不確定
  history: string;       // 病史（多行）
  allergies: string;     // 過敏（多行）
  medications: Medication[];
  doctor: string;        // 主治醫師
  hospital: string;      // 主要就醫醫院
  contacts: Contact[];   // 緊急聯絡人（家屬）
  updatedAt: number;
};

const KEY = "elder";

export function getElder(): Elder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Elder;
  } catch {
    return null;
  }
}

export function saveElder(elder: Elder) {
  if (typeof window === "undefined") return;
  elder.updatedAt = Date.now();
  localStorage.setItem(KEY, JSON.stringify(elder));
}

export function emptyElder(): Elder {
  return {
    name: "",
    gender: "",
    birthday: "",
    bloodType: "",
    history: "",
    allergies: "",
    medications: [],
    doctor: "",
    hospital: "",
    contacts: [],
    updatedAt: 0,
  };
}

export function calculateAge(birthday: string): number | null {
  if (!birthday) return null;
  const b = new Date(birthday);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
