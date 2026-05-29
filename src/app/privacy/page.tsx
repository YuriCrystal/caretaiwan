import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PrivacyContent } from "@/components/legal/PolicyContent";

export const metadata = {
  title: "隱私權政策 - 看護助手 CareTaiwan",
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link
          href="/about"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/70 shadow-card active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" strokeWidth={2.4} />
        </Link>
        <h1 className="text-xl font-bold">隱私權政策</h1>
      </header>

      <div className="px-5 pt-4">
        <PrivacyContent />
      </div>
    </main>
  );
}
