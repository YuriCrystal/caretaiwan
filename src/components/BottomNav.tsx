"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", icon: "🏠", label: "首頁" },
  { href: "/card", icon: "🆔", label: "醫護卡" },
  { href: "/record", icon: "📝", label: "3 秒記錄" },
  { href: "/help", icon: "🆘", label: "我需要協助", danger: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)] z-30"
    >
      <div className="grid grid-cols-4 gap-1 p-2">
        {ITEMS.map((it) => {
          const active = isActive(it.href);
          const baseCls = "flex flex-col items-center gap-0.5 py-2 rounded-lg transition-colors";
          let cls = baseCls;
          if (it.danger) {
            cls += active
              ? " bg-red-100 dark:bg-red-900"
              : " bg-red-50 dark:bg-red-950 active:bg-red-100 dark:active:bg-red-900";
          } else {
            cls += active
              ? " bg-zinc-100 dark:bg-zinc-800"
              : " active:bg-zinc-100 dark:active:bg-zinc-800";
          }
          const labelCls = it.danger
            ? "text-xs font-bold text-red-700 dark:text-red-300"
            : active
            ? "text-xs font-semibold text-zinc-900 dark:text-zinc-100"
            : "text-xs font-medium text-zinc-600 dark:text-zinc-400";
          return (
            <Link key={it.href} href={it.href} className={cls}>
              <span className="text-2xl">{it.icon}</span>
              <span className={labelCls}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
