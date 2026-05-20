# Google 行事曆 / 提醒事項串接設定

這份文件說明：
1. 如何在 Google Cloud Console 設定 OAuth 應用程式
2. 如何在 Zeabur 設定環境變數
3. 多使用者隔離與隱私如何運作

## 一、Google Cloud Console 設定

### 1. 建立或選擇一個專案
1. 進入 [Google Cloud Console](https://console.cloud.google.com/)
2. 上方點專案下拉選單 → 「新增專案」
3. 命名為例如 `brain-recovery`

### 2. 啟用必要的 API
在左側選單「APIs & Services」→「Library」，搜尋並啟用：
- **Google Calendar API**
- **Tasks API**

### 3. 設定 OAuth 同意畫面 (Consent Screen)
1. 「APIs & Services」→「OAuth consent screen」
2. User Type 選 **External**
3. 填寫：
   - App name：`大腦不疲勞`
   - User support email：你的 email
   - Developer contact information：你的 email
4. **Scopes** 區段加入：
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
   - `https://www.googleapis.com/auth/calendar.events`（讀寫今天的事件）
   - `https://www.googleapis.com/auth/tasks`（讀寫提醒事項）
5. **Test users** 區段：先加入你自己的 Google email（測試階段只能允許名單中的人登入）

> 上線後若希望任何人都能登入，需要將 App 從「Testing」改成「In production」並可能需要 Google 驗證流程。如果只是給自己/朋友用，留在 Testing 模式即可，每個專案最多可加 100 個測試用戶。

### 4. 建立 OAuth Client ID
1. 「APIs & Services」→「Credentials」
2. 「Create credentials」→「OAuth client ID」
3. Application type：**Web application**
4. Name：`Brain Recovery Web`
5. **Authorized redirect URIs** 加入兩個：
   - `http://localhost:3000/api/auth/callback/google` （開發用）
   - `https://brain-recovery.zeabur.app/api/auth/callback/google` （正式）
   - 若有自訂網域也一併加入
6. 建立後會拿到 **Client ID** 和 **Client Secret**，等下會用到

## 二、設定環境變數

### 必要環境變數
| 變數名稱            | 用途                                  | 取得方式                                                          |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| `AUTH_SECRET`       | 加密 session cookie 的金鑰            | 終端機跑 `openssl rand -base64 32`                                |
| `AUTH_GOOGLE_ID`    | OAuth Client ID                       | 上一節建立的 Client ID                                            |
| `AUTH_GOOGLE_SECRET`| OAuth Client Secret                   | 上一節建立的 Client Secret                                        |
| `AUTH_URL`          | App 正式網域                          | 例如 `https://brain-recovery.zeabur.app`（Zeabur 自動偵測可省略） |

### 本地開發 (`.env.local`)
```
AUTH_SECRET=你產生的隨機字串
AUTH_GOOGLE_ID=xxxxxxxxxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxxxxxxxxx
AUTH_URL=http://localhost:3000
```

### Zeabur 設定
1. 進入 Zeabur dashboard 找到 `brain-recovery` 服務
2. 進入「Variables」分頁
3. 加入上面 4 個變數（`AUTH_URL` 設為實際的正式網域）
4. 重新部署

或用 CLI：
```bash
zeabur variable create --service-id <SVC_ID> --env-id <ENV_ID> \
  -k AUTH_SECRET -v "$(openssl rand -base64 32)"
zeabur variable create --service-id <SVC_ID> --env-id <ENV_ID> \
  -k AUTH_GOOGLE_ID -v "你的 client id"
zeabur variable create --service-id <SVC_ID> --env-id <ENV_ID> \
  -k AUTH_GOOGLE_SECRET -v "你的 client secret"
zeabur variable create --service-id <SVC_ID> --env-id <ENV_ID> \
  -k AUTH_URL -v "https://brain-recovery.zeabur.app"
```

## 三、多使用者隔離與隱私設計

### 每個使用者只看到自己的資料 — 怎麼做到的？

App 沒有自己的資料庫。所有跟使用者相關的資料分成兩塊：

1. **打卡、檢測、Brain Pause 等本地紀錄**
   - 全部存在使用者瀏覽器的 `localStorage` 裡
   - 不同瀏覽器/裝置之間天然隔離
   - App 後端從未接觸這些資料

2. **行事曆、提醒事項**
   - 使用者用**自己的 Google 帳號**登入
   - OAuth 流程結束後拿到該帳號的 access token
   - 所有 Calendar / Tasks API call 都帶這個 token
   - Google 那一端強制執行 token 隔離 — token 只能存取它對應的帳號

### Session 怎麼存？

- Auth.js v5 (NextAuth) 採 **JWT session 模式**
- Session 加密簽章後放在 HTTP-only cookie
- 瀏覽器互相看不到對方的 cookie（瀏覽器安全模型）
- Cookie 由 `AUTH_SECRET` 加密，server 才能解
- 沒有「session 存在資料庫」這件事 — 無 DB 表示無法跨用戶污染

### Access token 不會洩漏

- Token 只放在 server-side JWT 內，**從不送到瀏覽器 JS**
- 所有 Google API 呼叫都在 server route 進行
- 瀏覽器只看到 server route 回傳的事件列表，看不到 token

### 使用者如何撤銷授權

到 [Google 第三方應用程式管理](https://myaccount.google.com/permissions)，可以隨時撤銷對「大腦不疲勞」的授權。撤銷後 access/refresh token 立刻失效。

## 四、本地測試

```bash
npm install
# .env.local 填好上面的變數
npm run dev
```

打開 http://localhost:3000/schedule，按「用 Google 登入」即可。

## 五、常見問題

**Q：登入時跳「Access blocked: 大腦不疲勞 has not completed verification」**
A：你的 App 還在 Testing 模式，且當前登入的 Google 帳號不在 Test users 名單裡。到 Cloud Console 的 OAuth consent screen → Test users 加進去。

**Q：重新登入頻率？**
A：access token 1 小時過期，App 會用 refresh token 自動換新。refresh token 通常 6 個月內不會過期（除非使用者撤銷授權或長時間沒用）。

**Q：可以同時跑 localhost 和正式版嗎？**
A：可以，只要 OAuth client 的 Authorized redirect URIs 同時有 localhost 與正式網域兩條。

**Q：如果只想啟用 Calendar 不想要 Tasks，可以嗎？**
A：可以。`src/auth.ts` 的 `SCOPES` 裡把 `tasks` 那行拿掉重新部署即可。
