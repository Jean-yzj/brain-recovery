# 大腦不疲勞 · Brain Recovery

> 不是你太懶，是你的大腦真的太累了。

一款幫你看懂大腦疲勞來源，並用 8 週微習慣重啟身心狀態的 App。靈感來自《大腦不疲勞》一書的 SHIFT 框架（Sleep、Hormones、Inflammation、Food、Technology）。

## 功能

- **大腦疲勞檢測**：12 題、約 90 秒，量化你的 SHIFT 五軸。
- **每日狀態打卡**：30 秒記錄精神、壓力、睡眠、專注、手機疲倦、身體警訊、撐過去的方式、壓力來源。
- **Brain Pause**：腦袋過載時，1–3 分鐘的暫停練習（呼吸、肩頸、看遠方、白噪音…）。
- **8 週大腦重啟計畫**：每週 1–3 個微習慣，從觀察開始，循序漸進。
- **大腦洞察**：趨勢圖、壓力來源排行、身體警訊統計、手機×隔日專注的模式偵測。
- **AI 大腦助理 / 每週報告**：把 7–14 天紀錄整理成你看得懂的洞察與下週建議（透過你的 Anthropic API Key）。
- **設定頁**：API Key 管理、資料匯入匯出、清除。

## 資料隱私

所有資料都存在你的瀏覽器 localStorage，不上傳雲端。API Key 也只存在本機。
Server route 只是把請求轉發到 Anthropic，不留任何紀錄。

## 開發

```bash
npm install
npm run dev
```

開啟 http://localhost:3000。

## 部署 (Zeabur)

```bash
zeabur deploy
```

或推到 GitHub 後，從 Zeabur Dashboard 連接 repo 即可。

### 環境變數（選填）

- `ANTHROPIC_API_KEY` — 若有設，使用者不需提供自己的 Key 就能用 AI 功能。

## 技術

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Anthropic SDK
- localStorage（無資料庫，零後端負擔）

## 致謝

書籍：《大腦不疲勞》Mithu Storoni。
本 App 不提供醫療建議。若有嚴重身心症狀，請尋求專業協助。台灣免費安心專線 1925。
