#!/usr/bin/env bash
# Cron job per sync dati mercato Il Dispaccio.
# Esegue i 4 script tsx in sequenza con logging + notifica Telegram on failure.
# Non genera AI summary — solo sync dati. L'AI scatta on-demand dal click utente.

# NOTA: NON usiamo `set -e` perché vogliamo proseguire con gli altri script
# anche se uno fallisce, e vogliamo loggare/notificare ogni failure.

cd /root/energizzo.unvrslabs.dev || exit 1

LOG_DIR="/var/log/ildispaccio"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/sync-$(date +%Y%m%d).log"

log() {
  echo "[$(date -u +%FT%TZ)] $1" | tee -a "$LOG"
}

# Carica .env.local per TELEGRAM_*_TOKEN notifica alert
if [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

notify_fail() {
  local script="$1"
  local rc="$2"
  # Usa TELEGRAM_PODCAST_* come canale ops (stesso che lead notifications)
  local token="${TELEGRAM_OPS_BOT_TOKEN:-$TELEGRAM_PODCAST_BOT_TOKEN}"
  local chat="${TELEGRAM_OPS_CHAT_ID:-$TELEGRAM_PODCAST_CHAT_ID}"
  if [ -z "$token" ] || [ -z "$chat" ]; then
    log "  (no telegram token/chat, skip notify)"
    return
  fi
  local host
  host=$(hostname)
  curl -s --max-time 10 -X POST \
    "https://api.telegram.org/bot${token}/sendMessage" \
    -d "chat_id=${chat}" \
    -d "text=❌ Il Dispaccio sync ${script} FAIL (exit ${rc}) — ${host} $(date -u +%FT%TZ)" \
    > /dev/null || log "  (telegram notify failed)"
}

log "=== Cron sync start ==="

FAILURES=0
for script in sync-delibere sync-testi-integrati sync-oneri sync-gas-storage; do
  log "→ ${script}"
  if /usr/bin/env npx tsx "scripts/${script}.ts" >> "$LOG" 2>&1; then
    log "  ok"
  else
    rc=$?
    log "  FAIL (exit ${rc})"
    notify_fail "$script" "$rc"
    FAILURES=$((FAILURES + 1))
  fi
done

log "=== Cron sync done (failures=${FAILURES}) ==="
exit $FAILURES
