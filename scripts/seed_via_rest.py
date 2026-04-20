#!/usr/bin/env python3
"""Bulk seed leads via Supabase REST (PostgREST). RLS must be disabled."""
import csv
import json
import urllib.request
import sys
from pathlib import Path

SUPABASE_URL = "https://motvueogtdbzmtdydqsp.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdHZ1ZW9ndGRiem10ZHlkcXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTg0MzAsImV4cCI6MjA5MjE5NDQzMH0.L8-QUOovfpJhnM_tuiDIWAW6WRc2AIEDCqln4bQQQSE"

ROOT = Path(__file__).resolve().parent.parent

# Load leads with geocoding inline (re-run the geocoding to get coords)
import subprocess
# Ensure SQL batches exist / force regen
subprocess.run(["python3", str(ROOT / "scripts" / "geocode_and_seed.py")], check=True)

# Re-read CSV + merge coords: read any SQL file? No, simpler to re-geocode inline.
# Actually we can parse the first SQL batch's VALUES, but that's brittle.
# Instead, re-do geocoding here.

import re, unicodedata

def norm(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-zA-Z0-9]+", "", s).lower()

FEATURE_PRIORITY = {"PPLC": 0, "PPLA": 1, "PPLA2": 2, "PPLA3": 3, "PPLA4": 4, "PPL": 5, "PPLS": 6, "PPLX": 7}
place_map = {}
with open("/tmp/geonames_it/IT.txt", "r", encoding="utf-8") as f:
    for line in f:
        parts = line.split("\t")
        if len(parts) < 15:
            continue
        name, ascii_name, alts = parts[1], parts[2], parts[3]
        lat, lng = float(parts[4]), float(parts[5])
        fc, fcode = parts[6], parts[7]
        if fc != "P":
            continue
        pri = FEATURE_PRIORITY.get(fcode, 9)
        candidates = {name, ascii_name}
        for a in alts.split(","):
            a = a.strip()
            if a:
                candidates.add(a)
        for c in candidates:
            n = norm(c)
            if not n:
                continue
            existing = place_map.get(n)
            if existing is None or pri < existing[2]:
                place_map[n] = (lat, lng, pri)

leads = []
with open(ROOT / "data" / "reseller_energia_italia.csv", "r", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        comune = r.get("comune", "") or ""
        keys_to_try = [comune, comune.split("/")[0], comune.split("/")[-1]]
        coord = None
        for k in keys_to_try:
            n = norm(k)
            if n and n in place_map:
                coord = place_map[n]
                break
        if coord is None:
            n = norm(comune)
            if n:
                for k, v in place_map.items():
                    if k.startswith(n) or n.startswith(k):
                        coord = v
                        break
        rec = {
            "ragione_sociale": r["ragione_sociale"],
            "piva": r["piva"],
            "id_arera": r.get("id_arera") or None,
            "tipo_servizio": r["tipo_servizio"],
            "comune": r.get("comune") or None,
            "provincia": r.get("provincia") or None,
            "indirizzo": r.get("indirizzo") or None,
            "dominio": r.get("dominio") or None,
            "sito_web": r.get("sito_web") or None,
            "email_info": r.get("email_info") or None,
            "email_commerciale": r.get("email_commerciale") or None,
            "telefoni": r.get("telefoni") or None,
            "gruppo": r.get("gruppo") or None,
            "natura_giuridica": r.get("natura_giuridica") or None,
            "settori": r.get("settori") or None,
            "latitude": coord[0] if coord else None,
            "longitude": coord[1] if coord else None,
        }
        leads.append(rec)

print(f"Uploading {len(leads)} leads to Supabase...")

BATCH = 100
ok, fail = 0, 0
for i in range(0, len(leads), BATCH):
    chunk = leads[i : i + BATCH]
    data = json.dumps(chunk).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/leads?on_conflict=piva",
        data=data,
        method="POST",
        headers={
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {ANON_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        ok += len(chunk)
        print(f"  batch {i//BATCH+1}: OK ({len(chunk)} rows, total {ok})")
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:400]
        print(f"  batch {i//BATCH+1}: FAILED {e.code}: {body}")
        fail += len(chunk)
    except Exception as e:
        print(f"  batch {i//BATCH+1}: ERROR {e}")
        fail += len(chunk)

print(f"\nDONE: inserted {ok}, failed {fail}")
