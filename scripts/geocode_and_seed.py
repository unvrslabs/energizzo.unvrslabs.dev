#!/usr/bin/env python3
"""Geocode leads via GeoNames IT dataset, produce SQL insert batches."""
import json
import csv
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_IN = ROOT / "data" / "reseller_energia_italia.csv"
GEONAMES = Path("/tmp/geonames_it/IT.txt")
OUT_DIR = ROOT / "data" / "sql"
OUT_DIR.mkdir(exist_ok=True)


def norm(s: str) -> str:
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-zA-Z0-9]+", "", s).lower()
    return s


def sql_quote(v):
    if v is None or v == "":
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


FEATURE_PRIORITY = {
    "PPLC": 0,  # capital of country
    "PPLA": 1,  # admin capital
    "PPLA2": 2,
    "PPLA3": 3,
    "PPLA4": 4,
    "PPL": 5,  # populated place
    "PPLS": 6,  # small settlement
    "PPLX": 7,  # section of populated place
}

place_map: dict[str, tuple[float, float, int]] = {}

with open(GEONAMES, "r", encoding="utf-8") as f:
    for line in f:
        parts = line.split("\t")
        if len(parts) < 15:
            continue
        name = parts[1]
        ascii_name = parts[2]
        alts = parts[3]
        lat = float(parts[4])
        lng = float(parts[5])
        fc = parts[6]
        fcode = parts[7]
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

print(f"Built place map: {len(place_map)} keys")

# Load leads
rows = []
with open(CSV_IN, "r", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
print(f"Loaded {len(rows)} leads")

geocoded = 0
missing = []
for r in rows:
    comune = r.get("comune", "") or ""
    # strip slash suffixes like "Curon Venosta/Graun im Vinschgau" -> try both
    keys_to_try = [comune, comune.split("/")[0], comune.split("/")[-1]]
    coord = None
    for k in keys_to_try:
        n = norm(k)
        if n and n in place_map:
            coord = place_map[n]
            break
    if coord is None:
        # partial startswith match
        n = norm(comune)
        if n:
            for k, v in place_map.items():
                if k.startswith(n) or n.startswith(k):
                    coord = v
                    break
    if coord:
        r["latitude"] = coord[0]
        r["longitude"] = coord[1]
        geocoded += 1
    else:
        r["latitude"] = None
        r["longitude"] = None
        missing.append(comune)

print(f"Geocoded: {geocoded}/{len(rows)} ({geocoded*100//len(rows)}%)")
if missing:
    print(f"Missing examples: {missing[:8]}")

BATCH = 50
cols = [
    "ragione_sociale", "piva", "id_arera", "tipo_servizio", "comune", "provincia",
    "indirizzo", "dominio", "sito_web", "email_info", "email_commerciale", "telefoni",
    "gruppo", "natura_giuridica", "settori", "latitude", "longitude",
]

num_batches = 0
for i in range(0, len(rows), BATCH):
    chunk = rows[i : i + BATCH]
    lines = []
    for r in chunk:
        vals = []
        for c in cols:
            v = r.get(c)
            if c in ("latitude", "longitude"):
                vals.append(sql_quote(v))
            else:
                vals.append(sql_quote(v if v not in ("", None) else None))
        lines.append("(" + ",".join(vals) + ")")
    sql = (
        "insert into public.leads ("
        + ",".join(cols)
        + ") values\n"
        + ",\n".join(lines)
        + "\non conflict (piva) do update set "
        + "ragione_sociale=excluded.ragione_sociale,"
        + "tipo_servizio=excluded.tipo_servizio,"
        + "comune=excluded.comune,"
        + "provincia=excluded.provincia,"
        + "indirizzo=excluded.indirizzo,"
        + "dominio=excluded.dominio,"
        + "sito_web=excluded.sito_web,"
        + "email_info=excluded.email_info,"
        + "email_commerciale=excluded.email_commerciale,"
        + "telefoni=excluded.telefoni,"
        + "gruppo=excluded.gruppo,"
        + "natura_giuridica=excluded.natura_giuridica,"
        + "settori=excluded.settori,"
        + "latitude=excluded.latitude,"
        + "longitude=excluded.longitude;"
    )
    outpath = OUT_DIR / f"seed_{i:05d}.sql"
    outpath.write_text(sql, encoding="utf-8")
    num_batches += 1

print(f"Wrote {num_batches} SQL batches to {OUT_DIR}/")
