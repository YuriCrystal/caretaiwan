import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "./sw-register";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "看護助手 CareTaiwan",
  description: "外籍看護工的台灣照護工具",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "CareTaiwan" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
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
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
        <div className="mx-auto w-full max-w-md min-h-screen flex flex-col pt-[env(safe-area-inset-top)]">
          {children}
        </div>
        <BottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
