import type { MetadataRoute } from "next";

const BASE = "https://caretaiwan.app";

// 公開可被搜尋引擎收錄的頁面(closed beta 期間 robots 還是 disallow,這個 sitemap 之後啟用)
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/tutorial`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
