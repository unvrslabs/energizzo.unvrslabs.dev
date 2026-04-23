#!/usr/bin/env bash
# Cron job per sync dati mercato Il Dispaccio.
# Esegue i 4 script tsx in sequenza con logging.
# Non genera AI summary — solo sync dati. L'AI scatta on-demand dal click utente.

set -e
cd /root/energizzo.unvrslabs.dev

LOG_DIR="/var/log/ildispaccio"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/sync-$(date +%Y%m%d).log"

log() {
  echo "[$(date -u +%FT%TZ)] $1" | tee -a "$LOG"
}

log "=== Cron sync start ==="

for script in sync-delibere sync-testi-integrati sync-oneri sync-gas-storage; do
  log "→ ${script}"
  if /usr/bin/env npx tsx "scripts/${script}.ts" >> "$LOG" 2>&1; then
    log "  ok"
  else
    log "  FAIL (exit $?)"
  fi
done

log "=== Cron sync done ==="
