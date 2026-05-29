import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "./sw-register";
import BottomNav from "@/components/BottomNav";
import PrototypeBanner from "@/components/PrototypeBanner";
import ConsentModal from "@/components/ConsentModal";
import RolePicker from "@/components/RolePicker";

const SITE_URL = "https://caretaiwan.app";
const SITE_NAME = "看護助手 CareTaiwan";
const SITE_DESC = "外籍看護工日常記錄＋家屬 LINE 推播 / Long-term care recording tool for Taiwan migrant caregivers";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESC,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "CareTaiwan" },
  applicationName: SITE_NAME,
  authors: [{ name: "CareTaiwan" }],
  keywords: [
    "看護",
    "外籍看護",
    "長照",
    "照顧",
    "醫護卡",
    "caregiver",
    "Taiwan",
    "elderly care",
    "PWA",
  ],
  // Open Graph (LINE / FB / Discord 分享卡片)
  openGraph: {
    type: "website",
    locale: "zh_TW",
    alternateLocale: ["vi_VN", "id_ID"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  // Twitter / X (sumber 也用 og 圖)
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
    images: ["/og.png"],
  },
  // Robots: closed beta 階段建議 noindex,等正式推廣再開
  robots: {
    index: false,
    follow: false,
  },
  // Apple touch icon
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 不鎖定 maximumScale / userScalable — 視障使用者需要放大（WCAG 1.4.4）
  themeColor: "#2563eb",
  viewportFit: "cover", // iOS Dynamic Island / notch safe area
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full antialiased">
      <head>
        {/* Apply saved theme before paint to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='dark')d.classList.add('dark');else if(t==='light')d.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
        <div className="mx-auto w-full max-w-md min-h-screen flex flex-col pt-[env(safe-area-inset-top)]">
          <PrototypeBanner />
          {children}
        </div>
        <BottomNav />
        <ConsentModal />
        <RolePicker />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
