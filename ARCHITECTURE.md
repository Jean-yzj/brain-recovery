# Architecture

「大腦不疲勞 / Brain Recovery」是一個 client-only 的 Next.js App，
依「資料 → 分析 → 行動 → 整合」四層架構組織。

## 設計原則

1. **無資料庫** — 所有打卡與紀錄存在使用者瀏覽器的 `localStorage`，
   不上雲端、互相天然隔離。
2. **無強制登入** — 主功能完全離線可用。Google 登入只在使用「排入行事曆 / 提醒事項」時才需要。
3. **沒事不問 AI** — Coach 是 rule-based 推薦引擎；AI 只用在每週報告與對話這兩個明確場景。
4. **每個功能都連動** — 每一個練習做完都會推下一步、coach 會讀所有層的資料來決定當下推薦。

---

## 四層架構

### ① 資料輸入 (`src/app/(data)/`)
紀錄使用者狀態的入口。

| 頁面            | 功能                                |
| --------------- | ----------------------------------- |
| `/assessment`   | 12 題大腦疲勞檢測，產出 SHIFT 五軸  |
| `/chronotype`   | Lion/Bear/Wolf/Dolphin 測驗         |
| `/daily`        | 30 秒每日狀態打卡（含情緒、症狀、撐過去的方式、晚間 3 句反思）|
| `/screentime`   | Apple Screen Time 資料（manual / iOS Shortcut / Mac script）|
| `/trigger`      | 衝動一鍵 log，60 秒等浪過去         |
| `/caffeine`     | 咖啡因半衰期追蹤                    |

### ② 分析洞察 (`src/app/(analysis)/`)
把資料變成可讀的模式。

| 頁面          | 分析                                 |
| ------------- | ------------------------------------ |
| `/calendar`   | 月曆視圖：每天 brain score + 活動標記 |
| `/insights`   | 趨勢線圖、壓力來源、SHIFT 五軸雷達、30 天 heatmap |
| `/body`       | 燃盡警戒、症狀×SHIFT 相關性、週幾模式、高壓恢復速度、撐過去×隔日、螢幕×隔日、觸發統計 |
| `/sleep-debt` | 14 天滾動睡眠債                      |
| `/history`    | 歷史條列                             |
| `/report`     | AI 每週報告 + 大腦助理對話           |

### ③ 當下行動 (`src/app/(action)/`)
此刻就能做的微練習。

**情緒急救**：`/sigh` (60s) · `/pause` (1-3min) · `/defuse` (ACT) · `/compassion` (Neff 3 steps) · `/release` (Nagoski 7 doors) · `/walk` (15min)

**睡眠恢復**：`/winddown` (17min) · `/sleep-calc` (90min cycles)

**長期練習**：`/deep-work` (Newport) · `/boredom` (Lembke) · `/morning-pages` (Cameron) · `/detox` (Newport/Price 7/14/30 day) · `/habits` (Clear stacking) · `/quest` (daily) · `/plan` (8 weeks SHIFT)

### ④ 整合 (`src/app/(integration)/`)
接到外部世界。

| 頁面        | 整合                              |
| ----------- | --------------------------------- |
| `/schedule` | Google Calendar + Tasks 一鍵排入  |
| `/learn`    | SHIFT 五軸觀念知識頁              |

### 系統
- `/` — Coach-led 首頁
- `/status` — 控制面板：所有資料來源 / 整合 / 個人化參數一覽
- `/welcome` — 首次 onboarding（目標、時間預算、暱稱）
- `/settings` — API Key、提醒、Google 連線、資料匯出

---

## Coach 推薦引擎

`src/lib/coach.ts` 是整個 App 的大腦。

**輸入**：完整 `AppData` + 當下時間
**輸出**：
```ts
{
  primary: CoachAction;       // RIGHT NOW 該做的一件事
  supporting: CoachAction[];  // 接下來 3 條建議路徑
  stateSummary: string;       // 「今天觀察到：壓力偏高、睡眠債 6 小時」
  weekTheme?: string;         // 依弱軸決定的本週主題
}
```

### 推理規則（rule reasoners）
1. `newUserCoach` — 新使用者優先推檢測
2. `acuteStress` — 高壓 / 焦慮情緒 → sigh / 接地 / 慈悲
3. `sleepCoach` — 睡眠債、晚上 winddown、就寢時間建議
4. `caffeineCoach` — 體內咖啡因殘留警告
5. `phoneCoach` — 螢幕時間 + 觸發頻率 → 排毒挑戰 + 無聊訓練
6. `bodyCoach` — 壓力高且日間 → 散步處方
7. `reflectCoach` — 早上 morning pages、晚上週報
8. `habitCoach` — 待打卡的習慣堆疊
9. `questCoach` — 每日任務

### 個人化權重
- `applyGoalWeights` — 依使用者目標（睡眠/焦慮/專注/手機/耗竭）放大相應 category 的優先級
- `applyTimeBudget` — 超過使用者時間預算的練習降權

---

## 資料流

```
使用者 → ① 資料輸入 (localStorage)
                ↓
        ② 分析洞察 (純函數計算)
                ↓
          Coach 引擎 (rule-based + 個人化)
                ↓
        ③ 當下行動 (微練習)
                ↓
        ④ 整合 (Google / AI)
                ↓
   寫入 Google 行事曆 / 提醒事項（薰衣草色）
```

---

## 連動點

| 觸發                                   | 行動                            |
| -------------------------------------- | ------------------------------- |
| 打卡壓力 ≥ 8                           | 首頁推 `/sigh`                  |
| 情緒勾「胸悶 / 想太多」                | 首頁推 `/pause` 接地            |
| 情緒勾「失落 / 委屈」                  | 首頁推 `/compassion`            |
| 睡眠債 ≥ 5 小時                        | 首頁推 `/sleep-debt`            |
| 晚上 ≥ 20:00 且沒做 winddown           | 首頁推 `/winddown`              |
| 下午之後體內咖啡因 ≥ 80 mg             | 首頁警告                        |
| 連續 3 天平均螢幕 ≥ 6 小時             | 首頁推 `/detox`                 |
| 過去 24h 觸發紀錄 ≥ 5 次               | 首頁推 `/boredom`               |
| 壓力 ≥ 7 且白天時段                    | 首頁推 `/walk`                  |
| Brain Pause 結束                       | NextStep → `/sigh`              |
| Sigh 結束                              | NextStep → `/compassion`        |
| Defuse 結束                            | NextStep → `/compassion`        |
| Compassion 結束                        | NextStep → `/defuse`            |
| Winddown 完成                          | NextStep → `/morning-pages`     |
| Morning pages 完成                     | NextStep → `/daily`             |
| Release（運動門）                      | NextStep → `/walk`              |
| Release（呼吸門）                      | NextStep → `/sigh`              |
| Daily 打卡完                           | NextStep → 回首頁看新推薦       |
| 完成 SHIFT 檢測                        | 8 週計畫自動加入該弱軸的個人化任務 |

---

## 程式結構

```
src/
├── app/
│   ├── layout.tsx              # 全站 layout
│   ├── page.tsx                # 首頁 (coach-led)
│   ├── globals.css
│   ├── welcome/                # onboarding
│   ├── settings/
│   ├── status/                 # 控制面板
│   ├── (data)/                 # 第一層
│   │   ├── layout.tsx
│   │   ├── assessment/
│   │   ├── chronotype/
│   │   ├── daily/
│   │   ├── screentime/
│   │   ├── trigger/
│   │   └── caffeine/
│   ├── (analysis)/             # 第二層
│   │   ├── layout.tsx
│   │   ├── calendar/
│   │   ├── insights/
│   │   ├── body/
│   │   ├── sleep-debt/
│   │   ├── history/
│   │   └── report/
│   ├── (action)/               # 第三層
│   │   ├── layout.tsx
│   │   ├── sigh/ pause/ defuse/ compassion/ release/ walk/
│   │   ├── winddown/ sleep-calc/
│   │   ├── deep-work/ boredom/ morning-pages/ detox/ habits/ quest/ plan/
│   ├── (integration)/          # 第四層
│   │   ├── layout.tsx
│   │   ├── schedule/
│   │   └── learn/
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── calendar/{today,add}/route.ts
│       ├── tasks/add/route.ts
│       ├── chat/route.ts
│       └── report/route.ts
├── lib/
│   ├── types.ts                # 全部 TypeScript 型別
│   ├── storage.ts              # localStorage 包裝
│   ├── coach.ts                # 推薦引擎
│   ├── insights.ts             # 基本統計
│   ├── bodyAnalysis.ts         # 身體×大腦相關性計算
│   ├── assessment.ts           # SHIFT 檢測題目與評分
│   ├── chronotype.ts           # Breus 4 種類型
│   ├── plan.ts                 # 8 週計畫 (依弱軸自適應)
│   ├── pause.ts                # Brain Pause 任務集
│   ├── caffeine.ts             # 半衰期計算
│   ├── release.ts              # Nagoski 7 道門
│   ├── sigh.ts                 # Huberman 生理嘆息
│   ├── boredom.ts              # 無聊訓練
│   ├── compassion.ts           # Neff 三步驟
│   ├── defusion.ts             # ACT 6 技巧
│   ├── detox.ts                # 數位排毒挑戰
│   ├── quests.ts               # 24 個微任務
│   ├── sleepdebt.ts            # 睡眠債計算
│   ├── schedule.ts             # 依 chronotype 算每日時段
│   └── summarize.ts            # AI 報告 summary 製作
├── components/
│   ├── Nav.tsx                 # 底部導覽
│   ├── SectionHeader.tsx       # 路由群組麵包屑
│   ├── ClientOnly.tsx
│   ├── Markdown.tsx            # 自製 markdown 渲染
│   ├── BrainScoreRing.tsx
│   ├── MonthCalendar.tsx
│   ├── SHIFTHeatmap.tsx        # 30 天 SHIFT × 5 軸 熱圖
│   ├── RadarChart.tsx
│   ├── Sparkline.tsx
│   ├── Reminders.tsx
│   ├── ReminderTicker.tsx
│   ├── PWARegister.tsx
│   ├── SignInButton.tsx
│   └── NextStep.tsx            # 跨工具串接卡
└── auth.ts                     # Auth.js v5 設定
```

---

## 隱私 & 安全

| 資料                     | 存放                                    | 隔離方式                          |
| ------------------------ | --------------------------------------- | --------------------------------- |
| 打卡 / 檢測 / 紀錄       | 瀏覽器 localStorage                     | 瀏覽器原生隔離（不同人不同 cookie 域）|
| Google access token      | server-side encrypted JWT cookie        | HTTP-only、`AUTH_SECRET` 加密     |
| Anthropic API Key        | localStorage（使用者自己貼）            | 不上雲端                          |
| Calendar / Tasks 內容    | 直接寫到使用者自己的 Google 帳號        | Google 端按 token 隔離            |

詳見 `GOOGLE_SETUP.md`。

---

## 部署

- **GitHub**: https://github.com/Jean-yzj/brain-recovery
- **Zeabur**: https://brain-recovery.zeabur.app

部署透過 `Dockerfile` 在 Zeabur 端 build Next.js standalone。
環境變數見 `GOOGLE_SETUP.md`。
