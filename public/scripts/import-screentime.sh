#!/usr/bin/env bash
# 大腦不疲勞 — Mac Screen Time importer
# 讀 ~/Library/Application Support/Knowledge/knowledgeC.db，
# 計算今天的螢幕使用時間，然後打開 Safari 把資料存進 App。
#
# 需要：系統設定 → 隱私權與安全性 → 完整磁碟存取權 → 把「終端機」勾起來
#
# 用法：
#   bash <(curl -sSL https://brain-recovery.zeabur.app/scripts/import-screentime.sh)
#
# 排程（每天晚上 11 點自動執行）：
#   crontab -e
#   0 23 * * * bash <(curl -sSL https://brain-recovery.zeabur.app/scripts/import-screentime.sh) >/dev/null 2>&1

set -e

APP_URL="${BRAIN_APP_URL:-https://brain-recovery.zeabur.app}"
DB="$HOME/Library/Application Support/Knowledge/knowledgeC.db"

if [ ! -r "$DB" ]; then
  echo "[error] 找不到 $DB" >&2
  echo "[hint] 確認系統設定 → 隱私權與安全性 → 完整磁碟存取權，已加入終端機。" >&2
  exit 1
fi

# 把 macOS 的 Apple 時間戳（從 2001-01-01 開始的秒數）轉成 unix 時間戳
# knowledgeC.db 裡的 ZSTARTDATE / ZENDDATE 是 Apple 時間戳
# 直接 SQL 算今天（local time）的 app usage 總秒數

TODAY=$(date +%Y-%m-%d)
SECONDS_TODAY=$(sqlite3 "$DB" <<SQL 2>/dev/null
SELECT COALESCE(CAST(SUM(ZENDDATE - ZSTARTDATE) AS INTEGER), 0)
FROM ZOBJECT
WHERE ZSTREAMNAME = '/app/usage'
  AND DATETIME(ZSTARTDATE + 978307200, 'unixepoch', 'localtime')
      >= DATETIME('now', 'start of day', 'localtime')
  AND DATETIME(ZSTARTDATE + 978307200, 'unixepoch', 'localtime')
      <  DATETIME('now', 'start of day', 'localtime', '+1 day');
SQL
)

if [ -z "$SECONDS_TODAY" ]; then
  echo "[error] 無法從 knowledgeC.db 讀取資料" >&2
  exit 1
fi

MINUTES=$(( SECONDS_TODAY / 60 ))

# 同時取拿起次數（lock screen 解鎖事件作為近似）
PICKUPS=$(sqlite3 "$DB" <<SQL 2>/dev/null
SELECT COUNT(*)
FROM ZOBJECT
WHERE ZSTREAMNAME = '/lock/screen'
  AND ZVALUEINTEGER = 0
  AND DATETIME(ZSTARTDATE + 978307200, 'unixepoch', 'localtime')
      >= DATETIME('now', 'start of day', 'localtime');
SQL
)

URL="$APP_URL/screentime/add?minutes=$MINUTES&date=$TODAY&source=mac-script"
if [ -n "$PICKUPS" ] && [ "$PICKUPS" -gt 0 ]; then
  URL="${URL}&pickups=$PICKUPS"
fi

echo "[ok] 今天 $TODAY 螢幕使用：$(printf "%d h %d m" $((MINUTES/60)) $((MINUTES%60)))"
if [ -n "$PICKUPS" ]; then
  echo "[ok] 拿起次數：$PICKUPS"
fi
echo "[open] $URL"
open "$URL"
