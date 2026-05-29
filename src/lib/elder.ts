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

// ----- Export / Import (保護資料，避免 iOS 清儲存或換手機後遺失) -----

export function exportAllData(): string {
  const store = getStore();
  const records = (() => {
    try {
      return JSON.parse(localStorage.getItem("records") || "[]");
    } catch {
      return [];
    }
  })();
  return JSON.stringify(
    {
      version: 1,
      exportedAt: Date.now(),
      elderStore: store,
      records,
    },
    null,
    2
  );
}

// Validate one Elder object — guards against prototype pollution / arbitrary fields
function sanitizeElder(raw: unknown): Elder | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== "string") return null;
  return {
    id: typeof r.id === "string" ? r.id : genId(),
    name: String(r.name).slice(0, 100),
    gender: r.gender === "male" || r.gender === "female" ? r.gender : "",
    birthday: typeof r.birthday === "string" ? r.birthday.slice(0, 20) : "",
    bloodType: typeof r.bloodType === "string" ? r.bloodType.slice(0, 10) : "",
    history: typeof r.history === "string" ? r.history.slice(0, 2000) : "",
    allergies: typeof r.allergies === "string" ? r.allergies.slice(0, 1000) : "",
    medications: Array.isArray(r.medications)
      ? r.medications
          .filter((m): m is Medication => !!m && typeof m === "object")
          .slice(0, 50)
          .map((m) => ({
            name: String((m as Medication).name ?? "").slice(0, 100),
            dose: String((m as Medication).dose ?? "").slice(0, 100),
            time: String((m as Medication).time ?? "").slice(0, 100),
          }))
      : [],
    doctor: typeof r.doctor === "string" ? r.doctor.slice(0, 100) : "",
    hospital: typeof r.hospital === "string" ? r.hospital.slice(0, 100) : "",
    contacts: Array.isArray(r.contacts)
      ? r.contacts
          .filter((c): c is Contact => !!c && typeof c === "object")
          .slice(0, 20)
          .map((c) => ({
            name: String((c as Contact).name ?? "").slice(0, 100),
            relation: String((c as Contact).relation ?? "").slice(0, 50),
            phone: String((c as Contact).phone ?? "").slice(0, 30),
          }))
      : [],
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : Date.now(),
  };
}

export function importAllData(json: string): {
  ok: boolean;
  message: string;
  elderCount?: number;
  recordCount?: number;
} {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, message: "JSON 解析失敗" };
  }
  if (!data || typeof data !== "object") {
    return { ok: false, message: "格式錯誤" };
  }
  const d = data as Record<string, unknown>;

  // Sanitize elderStore
  let cleanStore: Store | null = null;
  if (d.elderStore && typeof d.elderStore === "object") {
    const es = d.elderStore as Record<string, unknown>;
    if (Array.isArray(es.elders)) {
      const cleanedElders = es.elders
        .map(sanitizeElder)
        .filter((e): e is Elder => e !== null)
        .slice(0, 50);
      cleanStore = {
        elders: cleanedElders,
        activeId:
          typeof es.activeId === "string" &&
          cleanedElders.some((e) => e.id === es.activeId)
            ? es.activeId
            : cleanedElders[0]?.id ?? "",
      };
      localStorage.setItem(KEY, JSON.stringify(cleanStore));
    }
  }

  // Sanitize records (keep only known fields, cap length)
  let cleanRecords: unknown[] = [];
  if (Array.isArray(d.records)) {
    cleanRecords = d.records
      .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
      .slice(0, 5000)
      .map((r) => ({
        type: typeof r.type === "string" ? r.type.slice(0, 20) : "",
        value: typeof r.value === "string" ? r.value.slice(0, 100) : !!r.value,
        note: typeof r.note === "string" ? r.note.slice(0, 500) : "",
        timestamp: typeof r.timestamp === "number" ? r.timestamp : Date.now(),
        shared: !!r.shared,
      }));
    localStorage.setItem("records", JSON.stringify(cleanRecords));
  }

  return {
    ok: true,
    message: "匯入成功",
    elderCount: cleanStore?.elders.length ?? 0,
    recordCount: cleanRecords.length,
  };
}

// 個資法第 11 條：當事人有刪除權 — 一鍵刪除全部本機資料
export function deleteAllLocalData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(LEGACY_KEY);
  localStorage.removeItem("records");
  localStorage.removeItem(PAIRED_ACTIVE_KEY);
  // 保留 theme 偏好（非個資）
}

// 看護端：被配對到的老人快取（id + 顯示名稱）。家屬端的醫護卡不會寫進這支手機 elderStore，
// 只透過 /api/family/paired 唯讀取得。/record 推播時需要 elderId/name，所以快取在這裡。
const PAIRED_ACTIVE_KEY = "pairedActiveElder";

export type PairedActiveElder = { id: string; name: string };

export function setActivePairedElder(p: PairedActiveElder | null) {
  if (typeof window === "undefined") return;
  if (!p) {
    localStorage.removeItem(PAIRED_ACTIVE_KEY);
    return;
  }
  localStorage.setItem(PAIRED_ACTIVE_KEY, JSON.stringify(p));
}

export function getActivePairedElder(): PairedActiveElder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PAIRED_ACTIVE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && typeof p.id === "string" && typeof p.name === "string") return p;
  } catch {}
  return null;
}

// 給 /record 用：先試 local elderStore（家屬自己的），fallback 到配對快取（看護端）
export function getActiveElderForRecord(): { id: string; name: string } | null {
  const owned = getActiveElder();
  if (owned) return { id: owned.id, name: owned.name };
  const paired = getActivePairedElder();
  return paired;
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
