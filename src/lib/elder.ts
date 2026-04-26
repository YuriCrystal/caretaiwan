// 老人健康檔案（模組 C）— 支援多位老人

export type Medication = {
  name: string;
  dose: string;
  time: string;
};

export type Contact = {
  name: string;
  relation: string;
  phone: string;
};

export type Elder = {
  id: string;
  name: string;
  gender: "male" | "female" | "";
  birthday: string;
  bloodType: string;
  history: string;
  allergies: string;
  medications: Medication[];
  doctor: string;
  hospital: string;
  contacts: Contact[];
  updatedAt: number;
};

type Store = {
  elders: Elder[];
  activeId: string;
};

const KEY = "elderStore";
const LEGACY_KEY = "elder"; // single-elder format from earlier version

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function migrateLegacy(): Store | null {
  if (typeof window === "undefined") return null;
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return null;
  try {
    const parsed = JSON.parse(legacy);
    if (parsed && parsed.name) {
      const elder: Elder = { ...parsed, id: genId() };
      const store: Store = { elders: [elder], activeId: elder.id };
      localStorage.setItem(KEY, JSON.stringify(store));
      localStorage.removeItem(LEGACY_KEY);
      return store;
    }
  } catch {}
  return null;
}

export function getStore(): Store {
  if (typeof window === "undefined") return { elders: [], activeId: "" };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {}
  const migrated = migrateLegacy();
  if (migrated) return migrated;
  return { elders: [], activeId: "" };
}

export function saveStore(store: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getActiveElder(): Elder | null {
  const s = getStore();
  return s.elders.find((e) => e.id === s.activeId) ?? s.elders[0] ?? null;
}

export function getElderById(id: string): Elder | null {
  return getStore().elders.find((e) => e.id === id) ?? null;
}

export function setActiveElder(id: string) {
  const s = getStore();
  if (s.elders.find((e) => e.id === id)) {
    s.activeId = id;
    saveStore(s);
  }
}

export function upsertElder(elder: Elder): Store {
  const s = getStore();
  elder.updatedAt = Date.now();
  if (!elder.id) elder.id = genId();
  const idx = s.elders.findIndex((e) => e.id === elder.id);
  if (idx >= 0) s.elders[idx] = elder;
  else s.elders.push(elder);
  if (!s.activeId) s.activeId = elder.id;
  saveStore(s);
  return s;
}

export function deleteElder(id: string): Store {
  const s = getStore();
  s.elders = s.elders.filter((e) => e.id !== id);
  if (s.activeId === id) s.activeId = s.elders[0]?.id ?? "";
  saveStore(s);
  return s;
}

export function emptyElder(): Elder {
  return {
    id: "",
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
