// 已登入 LINE 時，醫護卡儲存後自動同步雲端（fire-and-forget，不阻擋 UI）
// 只在家屬端執行 — 看護端的 cloud_backup 不應該被自動覆蓋（看護不擁有醫護卡資料）
import { exportAllData } from "@/lib/elder";
import { getRole } from "@/lib/role";

let syncing = false;

export async function autoSyncIfLoggedIn() {
  if (typeof window === "undefined") return;
  if (getRole() === "caregiver") return; // 看護端永遠不自動上雲
  if (syncing) return;
  syncing = true;
  try {
    const sess = await fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => null);
    if (!sess?.loggedIn) return;
    const json = exportAllData();
    await fetch("/api/cloud/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
    }).catch(() => {});
  } finally {
    // 留 1 秒避免快速連續儲存時打太多次
    setTimeout(() => {
      syncing = false;
    }, 1000);
  }
}
