// LINE Messaging API webhook
// Handles: family adding bot, sending pairing codes, etc.
import { NextResponse } from "next/server";
import {
  isLineBotEnabled,
  verifyLineSignature,
  replyMessage,
} from "@/lib/line-bot";
import { bindFamily, findPairingByCode } from "@/lib/pairing";

export const runtime = "nodejs";

const WELCOME = (
  "歡迎加入看護助手 CareTaiwan 家屬端！\n" +
  "\n" +
  "請傳送看護給你的「配對碼」（6 位英數字）\n" +
  "例如：K2N8X4\n" +
  "\n" +
  "配對成功後，看護記錄送出時你會直接收到通知。\n" +
  "緊急狀況仍請撥 119。"
);

const HELP = (
  "📌 使用說明\n" +
  "\n" +
  "1) 把「配對碼」傳給我（看護端產生的 6 碼）\n" +
  "2) 配對成功後會收到老人記錄推播\n" +
  "3) 訊息會包含體溫／吃藥／跌倒等狀況與看護備註\n" +
  "\n" +
  "需要重新配對請輸入「重新配對」。"
);

const CODE_REGEX = /^[A-HJ-NP-Z2-9]{6}$/i;

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { userId?: string; type?: string };
  message?: { type: string; text?: string };
};

export async function POST(req: Request) {
  if (!isLineBotEnabled()) {
    return NextResponse.json(
      { error: "LINE Bot 尚未啟用（環境變數未設定）" },
      { status: 503 }
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const data = JSON.parse(rawBody) as { events: LineEvent[] };
  await Promise.all(
    (data.events ?? []).map((ev) => handleEvent(ev).catch((e) => console.error("[LINE Webhook]", e)))
  );

  return NextResponse.json({ ok: true });
}

async function handleEvent(event: LineEvent) {
  const userId = event.source?.userId;
  const replyToken = event.replyToken;
  if (!userId || !replyToken) return;

  // Family added bot as friend
  if (event.type === "follow") {
    await replyMessage(replyToken, [{ type: "text", text: WELCOME }]);
    return;
  }

  // Family sent a text message
  if (event.type === "message" && event.message?.type === "text") {
    const text = (event.message.text ?? "").trim();

    if (text === "說明" || text.toLowerCase() === "help") {
      await replyMessage(replyToken, [{ type: "text", text: HELP }]);
      return;
    }

    if (text === "重新配對" || text === "解除配對") {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: "請重新傳送看護給你的新配對碼（6 位英數字）。",
        },
      ]);
      return;
    }

    // Try as pairing code
    if (CODE_REGEX.test(text)) {
      const code = text.toUpperCase();
      const pairing = await findPairingByCode(code);
      if (!pairing) {
        await replyMessage(replyToken, [
          {
            type: "text",
            text: "找不到配對碼。請確認看護端產生的 6 碼正確。",
          },
        ]);
        return;
      }
      const result = await bindFamily(code, userId);
      if (!result.ok) {
        await replyMessage(replyToken, [
          { type: "text", text: `配對失敗：${result.error}` },
        ]);
        return;
      }
      const elderName = result.pairing?.display_name ?? "老人";
      await replyMessage(replyToken, [
        {
          type: "text",
          text:
            `✅ 配對成功！\n\n` +
            `照顧對象：${elderName}\n` +
            `\n` +
            `之後看護按「送出給家屬」的記錄會直接傳到這裡。`,
        },
      ]);
      return;
    }

    // Default
    await replyMessage(replyToken, [
      {
        type: "text",
        text: WELCOME,
      },
    ]);
    return;
  }
}

export async function GET() {
  // For LINE webhook verification (some setups GET first)
  return NextResponse.json({ status: "ok", botEnabled: isLineBotEnabled() });
}
