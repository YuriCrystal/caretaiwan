import {
  Thermometer,
  Pill,
  Home,
  IdCard,
  NotebookPen,
  LifeBuoy,
  Info,
  Moon,
  Utensils,
  Activity,
  Droplet,
  Wind,
  RotateCw,
  HeartPulse,
  Syringe,
  type LucideIcon,
} from "lucide-react";

export type RecordType =
  | "temp"
  | "stool"
  | "sleep"
  | "fall"
  | "med"
  | "meal"
  // 進階照護項目
  | "ng_feed"
  | "turn"
  | "bp"
  | "glucose"
  | "spo2"
  | "diaper"
  | "back_pat"
  | "ng_change"
  | "catheter_change";

export const RECORD_ICON: Record<RecordType, LucideIcon | null> = {
  temp: Thermometer,
  stool: null,
  sleep: Moon,
  fall: null,
  med: Pill,
  meal: Utensils,
  ng_feed: Syringe,
  turn: RotateCw,
  bp: HeartPulse,
  glucose: Droplet,
  spo2: Wind,
  diaper: null,
  back_pat: Activity,
  ng_change: Syringe,
  catheter_change: Syringe,
};

export const RECORD_EMOJI_FALLBACK: Record<RecordType, string> = {
  temp: "🌡️",
  stool: "💩",
  sleep: "😴",
  fall: "🤕",
  med: "💊",
  meal: "🍚",
  ng_feed: "🥣",
  turn: "🔄",
  bp: "🫀",
  glucose: "🩸",
  spo2: "🫁",
  diaper: "🧷",
  back_pat: "👐",
  ng_change: "💉",
  catheter_change: "💧",
};

export const RECORD_ICON_COLOR: Record<RecordType, string> = {
  temp: "text-orange-600 dark:text-orange-300",
  stool: "text-amber-600 dark:text-amber-300",
  sleep: "text-indigo-600 dark:text-indigo-300",
  fall: "text-red-600 dark:text-red-300",
  med: "text-blue-600 dark:text-blue-300",
  meal: "text-emerald-600 dark:text-emerald-300",
  ng_feed: "text-emerald-700 dark:text-emerald-300",
  turn: "text-sky-600 dark:text-sky-300",
  bp: "text-rose-600 dark:text-rose-300",
  glucose: "text-red-700 dark:text-red-300",
  spo2: "text-cyan-600 dark:text-cyan-300",
  diaper: "text-amber-700 dark:text-amber-300",
  back_pat: "text-teal-600 dark:text-teal-300",
  ng_change: "text-fuchsia-600 dark:text-fuchsia-300",
  catheter_change: "text-violet-600 dark:text-violet-300",
};

export function RecordTypeIcon({
  type,
  className = "w-7 h-7",
}: {
  type: RecordType;
  className?: string;
}) {
  const Lucide = RECORD_ICON[type];
  if (Lucide) {
    return <Lucide className={`${className} ${RECORD_ICON_COLOR[type]}`} strokeWidth={2.2} />;
  }
  return <span className="text-2xl">{RECORD_EMOJI_FALLBACK[type]}</span>;
}

export const NAV_ICON = {
  home: Home,
  card: IdCard,
  record: NotebookPen,
  help: LifeBuoy,
} as const;

export { Info };
