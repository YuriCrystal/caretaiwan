// 使用者角色管理（看護端 / 家屬端，存 localStorage）

export type Role = "caregiver" | "family";

const KEY = "app-role";

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return v === "caregiver" || v === "family" ? v : null;
}

export function setRole(role: Role) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, role);
}

export function clearRole() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
