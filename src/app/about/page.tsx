import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="flex flex-col flex-1 pb-32">
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 dark:active:bg-zinc-800"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">ℹ️ 關於本 APP</h1>
      </header>

      <div className="px-5 pt-5 space-y-4">
        <Section title="🩺 看護助手 CareTaiwan">
          <p>給在台外籍看護工的長照工具，幫助：</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>遇到狀況時 10 秒內查到處置（35 種常見情境）</li>
            <li>記錄老人每日身體狀態，需要時送給家屬</li>
            <li>就醫時把短句翻成英／印／越給醫護看</li>
            <li>緊急時直撥 119 / 1955 / 失智專線</li>
          </ul>
        </Section>

        <Section title="📚 內容來源">
          <ul className="space-y-1.5">
            <li>・臺北市政府外籍看護照顧手冊（中英／中越／中印 2022 版）</li>
            <li>・高雄長庚 × 高市衛生局「給外籍移工的認知症照護手冊」</li>
            <li>・台灣腦中風學會 2025 指引</li>
            <li>・American Heart Association 2025 CPR &amp; ECC 指南</li>
            <li>・天主教失智老人基金會教材</li>
            <li>・健保署藥師諮詢專線 0800-030-598</li>
          </ul>
        </Section>

        <Section title="⚠️ 重要聲明" emphasis>
          <ul className="space-y-2">
            <li>
              <strong>內容為 Phase 1 草稿</strong>，待台灣醫護專業審核才會正式上線。
              請勿單獨依賴此 APP 做醫療判斷。
            </li>
            <li>
              <strong>緊急狀況請撥 119</strong>，APP 只是輔助參考，不取代專業醫療。
            </li>
          </ul>
        </Section>

        <Section title="🔒 隱私保證">
          <ul className="space-y-1.5">
            <li>・不要求註冊，不收集個資</li>
            <li>・所有資料只存在你這支手機</li>
            <li>・「一鍵清歷史」可隨時刪光本機資料</li>
            <li>・「我需要協助」不會通知雇主／家屬</li>
            <li>・看護記錄要你按「送出給家屬」才會傳出去</li>
          </ul>
        </Section>

        <Section title="📦 版本">
          <ul className="space-y-1">
            <li>Phase 1（測試中）</li>
            <li>支援離線使用、PWA 可加到主畫面</li>
          </ul>
        </Section>

        <Section title="📮 回報問題">
          <p>用得不順、找不到功能、內容不正確，都歡迎回報給開發者修正。</p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  emphasis,
  children,
}: {
  title: string;
  emphasis?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`p-4 rounded-2xl ${
        emphasis
          ? "bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-800"
          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h2>
      <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
