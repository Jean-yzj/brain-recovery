# 大腦不疲勞 · Brain Recovery

> 不是你太懶，是你的大腦真的太累了。

一款幫你看懂大腦疲勞來源，並用微習慣循序重啟身心狀態的 App。
靈感取自《大腦不疲勞》（Mithu Storoni）的 SHIFT 框架（Sleep、Hormones、Inflammation、Food、Technology），整合多本睡眠 / 壓力 / 注意力相關書籍的研究設計成連動方案。

線上版：**https://brain-recovery.zeabur.app**

---

## 設計哲學

整個 App 採「**資料 → 分析 → 行動 → 整合**」四層架構：

```
① 資料輸入    紀錄你的狀態（打卡、螢幕時間、衝動、咖啡因…）
② 分析洞察    把資料變成可讀模式（趨勢、雷達、月曆、症狀×SHIFT 相關）
③ 當下行動    Coach 引擎讀完狀態，推此刻最該做的一件事
④ 整合        把行動排進 Google 日曆 / 提醒事項
```

每個練習做完都會推下一步（嘆息 → 慈悲 / 慈悲 → 解離 / winddown → 晨間日記），
Coach 推薦會依你的目標、時間預算、chronotype 自動調權重。

---

## 主要功能

### 紀錄
- **12 題大腦疲勞檢測** — 量化 SHIFT 五軸
- **Chronotype 測驗** — Lion / Bear / Wolf / Dolphin（Breus）
- **每日 30 秒打卡** — 精神、壓力、睡眠、專注、手機、情緒輪、症狀、撐過去的方式、晚間 3 句反思
- **Apple Screen Time 整合** — 手動 / iOS Shortcut / Mac 腳本三條路
- **咖啡因半衰期追蹤** — Walker《Why We Sleep》
- **觸發紀錄** — 衝動一鍵 log + 60 秒等浪過去

### 分析
- **月曆視圖** — 每天 brain score 顏色 + 活動標記
- **身體 × 大腦因果分析** — 燃盡警戒、症狀×SHIFT 相關、週幾模式、高壓恢復速度、撐過去×隔日、螢幕×隔日
- **SHIFT 30 天 heatmap** — 5 軸 × 30 天的疲勞地圖
- **14 天睡眠債** — Walker 模型 + 還債建議
- **AI 每週報告 / 大腦助理** — Anthropic Haiku 4.5

### 當下行動
- **60 秒生理嘆息** — Huberman 2022 Stanford 研究
- **Brain Pause** — 6 種 1-3 分鐘練習（呼吸、肩頸、看遠方、白噪、不下決定、5-4-3-2-1 接地、3 分鐘呼吸空間 MBSR）
- **ACT 思緒解離** — 6 個技巧 (Hayes & Strosahl)
- **Kristin Neff 自我慈悲三步驟**
- **Nagoski 壓力循環 7 道出口** — Burnout
- **散步處方** — 前後壓力對照 + 90 秒換提示
- **17 分鐘睡前儀式** — 6 步驟
- **90 分鐘睡眠週期計算器** — 雙模式
- **Deep Work 計時器** — Cal Newport
- **無聊訓練** — Anna Lembke《Dopamine Nation》
- **晨間日記** — Julia Cameron
- **數位排毒** — 7/14/30 天挑戰 (Newport / Price)
- **習慣堆疊** — Atomic Habits (Clear)
- **每日大腦任務** — 24 個微挑戰，連續完成 streak
- **8 週重啟計畫** — 依弱軸自適應

### 整合
- **Google 行事曆** — 一鍵把練習排進去（薰衣草色標記）
- **Google 提醒事項** — 帶截止時間
- **瀏覽器原生提醒** — 早上打卡 / 下午暫停 / 睡前儀式

---

## 系統狀態

打開 `/status` 可看到所有資料來源、整合連線、coach 個人化參數一覽。

---

## 隱私

- **無資料庫** — 所有打卡與紀錄存在你的瀏覽器 localStorage
- **無雲端同步** — 換裝置就要重來（可在「設定」匯出 JSON 備份）
- **每個人只看到自己的資料** — 透過自己的 Google 帳號登入，token 由 Google 端隔離
- **Session = 加密 JWT cookie**

詳見 [`ARCHITECTURE.md`](./ARCHITECTURE.md) 和 [`GOOGLE_SETUP.md`](./GOOGLE_SETUP.md)。

---

## 技術棧

- Next.js 14 (App Router, route groups) + TypeScript
- Tailwind CSS
- Auth.js v5 (Google OAuth, JWT session)
- Anthropic SDK
- 純 localStorage（無 DB）

---

## 開發

```bash
npm install
cp .env.local.example .env.local  # 填入 AUTH_SECRET / AUTH_GOOGLE_* 等
npm run dev
```

Google OAuth 設定見 [`GOOGLE_SETUP.md`](./GOOGLE_SETUP.md)。

---

## 部署到 Zeabur

```bash
zeabur deploy
```

或推到 GitHub 後，從 Zeabur 連接 repo 自動部署。
環境變數設定也在 `GOOGLE_SETUP.md`。

---

## 一句話

**一款幫你看懂大腦疲勞來源，並用 8 週微習慣重啟身心狀態的 App。**

或更口語的版本：

**不是你太懶，是你的大腦真的太累了。**

---

書本來源：
《大腦不疲勞》Mithu Storoni · 《Why We Sleep》Walker · 《The Power of When》Breus · 《Burnout》Nagoski · 《Digital Minimalism》《Deep Work》Newport · 《How to Break Up with Your Phone》Price · 《Dopamine Nation》Lembke · 《Atomic Habits》Clear · 《How Emotions Are Made》Barrett · 《Self-Compassion》Neff · 《The Artist's Way》Cameron · ACT (Hayes & Strosahl)

本 App 不提供醫療建議。如有嚴重身心症狀，請尋求專業協助。  
台灣免費安心專線 1925。
