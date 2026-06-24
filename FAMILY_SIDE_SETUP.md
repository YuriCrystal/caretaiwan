# 家屬端 LINE Bot 設置指南

回家後跑這一輪即可啟用家屬端推播。

---

## 步驟 1：在 Supabase 建新表

到 Supabase 你的 project → SQL Editor → New query → 貼 [`supabase-schema.sql`](./supabase-schema.sql) 全部執行。
（會建 `cloud_backups`、`elder_pairings`、`push_logs` 三張表，已存在的會 skip。）

---

## 步驟 2：建 LINE Messaging API Channel

到 https://developers.line.biz/console/ → 你的 Provider → 「Create a new channel」→ 選 **「Messaging API」**（這次不是 Login）

填：
- App name: `看護助手家屬端` 或 `CareTaiwan Family`
- Channel description: 隨便
- Category: `Healthcare`
- Subcategory: `Healthcare > Other`
- Email: 你的 email

建好後到該 Channel：

### Basic settings 分頁
抓：
- **Channel ID**
- **Channel secret**

### Messaging API 分頁
- **Channel access token**：滾到下方按 **Issue** 產生 long-lived token
- **Webhook URL**：填
  ```
  https://your-app.example.com/api/line/webhook
  ```
  填完按 **Update**，再點 **Verify** 應該回「Success」
- **Use webhook**：開啟 ✅
- **Auto-reply messages**：**Disable** ❌（重要！我們自訂回覆）
- **Greeting messages**：可開可關（我們的 webhook 會處理 follow event）

> 提示：LINE 預設「Auto-reply」會吃掉訊息導致 webhook 收不到。一定要關。

### LIFF 分頁
不用設。

---

## 步驟 3：Vercel 加 3 個新環境變數

到 Vercel → caregiver-app → Settings → Environments → Production：

| Key | Value |
|---|---|
| `LINE_BOT_CHANNEL_ID` | 步驟 2 抓的 Channel ID |
| `LINE_BOT_CHANNEL_SECRET` | 步驟 2 抓的 Channel secret |
| `LINE_BOT_CHANNEL_ACCESS_TOKEN` | 步驟 2 Issue 的 long-lived token |

---

## 步驟 4：Redeploy

Deployments → 最新一筆 ⋮ → Redeploy（不勾 Build Cache）。

---

## 步驟 5：取得 LINE Bot 的「加好友 QR Code 或 ID」

LINE Developers Console → 你的 Messaging API Channel → **Messaging API** 分頁 → 滾到 **「Bot basic ID」** 與 **「QR code」**：
- Bot basic ID 形如 `@123abcde`
- QR code 圖片可下載

要把這兩個其中之一給家屬，他們才能加 Bot。

---

## 完整測試流程

1. 你（看護端）開 [https://your-app.example.com/card](https://your-app.example.com/card)
2. 看到老人卡 → 上方有「📲 配對家屬 LINE」藍色區塊 → 點「產生配對碼」
3. 拿到 6 位碼（例 `K2N8X4`）
4. 用另一個 LINE 帳號（或叫家人測試）加 Bot 為好友（用步驟 5 的 ID/QR）
5. Bot 回歡迎訊息
6. 對 Bot 傳「K2N8X4」（你產的配對碼）
7. Bot 回「✅ 配對成功！照顧對象：王阿嬤」
8. 你回看護端 → 3 秒記錄 → 點任一項 → 開「🟢 送出給家屬」→ 儲存
9. 家屬 LINE 立刻收到推播訊息

---

## 環境變數補充表

完整 production 需要的所有變數：

| 變數 | 來源 |
|---|---|
| `LINE_CHANNEL_ID` | LINE Login Channel（已設）|
| `LINE_CHANNEL_SECRET` | LINE Login Channel（已設）|
| **`LINE_BOT_CHANNEL_ID`** | LINE Messaging Channel（新）|
| **`LINE_BOT_CHANNEL_SECRET`** | LINE Messaging Channel（新）|
| **`LINE_BOT_CHANNEL_ACCESS_TOKEN`** | LINE Messaging Channel（新）|
| `AUTH_SECRET` | 之前產的（已設）|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase（已設）|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase（已設）|

---

## 故障排除

**家屬加 Bot 後沒收到歡迎訊息**：
- LINE Developers Console → Channel → **Use webhook** 是否開啟
- **Auto-reply messages** 是否關閉（沒關會擋掉 webhook）
- Webhook URL 點 **Verify** 是否回 Success

**配對碼傳給 Bot 沒反應**：
- 看護端必須先在 `/card` 點「產生配對碼」才會建立 record
- 配對碼會大寫敏感，但 webhook 會自動 toUpperCase，傳小寫也行
- 環境變數沒設好（webhook 會回 503）

**送出記錄家屬沒收到**：
- 確認該老人已配對（card 頁區塊顯示「✅ 已配對家屬」）
- 確認看護端登入了 LINE Login（雲端備份頁有頭像即代表登入）
- 推播額度免費 200 則 / 月，超過會失敗
