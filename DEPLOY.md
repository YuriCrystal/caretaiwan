# 部署指南

## 路徑 A：Vercel CLI（5 分鐘最快）

### 1. 安裝 Vercel CLI（一次性）
```powershell
npm install -g vercel
```

### 2. 在專案資料夾執行
```powershell
cd C:\Users\lisar\caregiver-app
vercel
```

第一次會問：
- **Login**：選 GitHub / Email / Google 任一登入
- **Set up and deploy?** → Y
- **Which scope?** → 你的個人帳號
- **Link to existing project?** → N
- **Project name?** → `caregiver-app`（直接 Enter 用預設）
- **Directory?** → `./`（直接 Enter）
- **Override settings?** → N

執行完會給你 URL 形如：`https://caregiver-app-xxx.vercel.app`

### 3. 之後要更新
```powershell
vercel --prod
```
或推到 GitHub 自動部署（見路徑 B）。

---

## 路徑 B：GitHub + Vercel（建議長期用）

### 1. 在 GitHub 建 repo
- 到 https://github.com/new
- repo 名 `caregiver-app`
- 設 Private（內含醫療測試資料較適合私有）
- 不勾「Add README」（本地已有）

### 2. 推上去
```powershell
cd C:\Users\lisar\caregiver-app
git remote add origin https://github.com/<your-username>/caregiver-app.git
git push -u origin main
```

### 3. 連到 Vercel
- 到 https://vercel.com/new
- 選你剛 push 的 GitHub repo
- 全部用預設值，按 **Deploy**

之後 `git push` → Vercel 自動部署新版。

---

## 環境變數（Supabase 用，先選用）

如果要啟用雲端同步，到 Vercel project Settings → Environment Variables：

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon public key |

未設則 APP fallback 純 localStorage（Phase 1 預設行為）。

---

## 手機測試

部署後拿 Vercel 的 https URL：

### Android Chrome
1. 開網址 → 右上選單 → **「加到主畫面」**
2. 桌面會多一個 APP 圖示，全螢幕運作
3. 飛航模式測離線：開來看 Top 35 情境仍可閱讀

### iOS Safari
1. 開網址 → 下方分享 → **「加入主畫面」**
2. 桌面會有 APP 圖示
3. iOS 對 PWA 支援較有限（無背景通知），但離線、加到主畫面可用

---

## Custom Domain（之後）

Vercel project → Domains → Add，免費 SSL 自動。
