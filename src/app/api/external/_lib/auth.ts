import { NextResponse } from "next/server";

export function checkBearerAuth(req: Request): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET non configurato" },
      { status: 500 },
    );
  }
  const got = req.headers.get("authorization") || "";
  if (got !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export const IMPORTANCE_ORDER = ["bassa", "normale", "alta", "critica"] as const;
export type Importance = (typeof IMPORTANCE_ORDER)[number];

export function importanceGte(value: string | null, threshold: Importance): boolean {
  // Quando la soglia è "bassa", includiamo anche le delibere non ancora
  // classificate da AI (ai_importanza = null). Questo permette agli
  // integratori di vedere il backlog completo nelle code di candidati.
  if (!value) return threshold === "bassa";
  const vi = IMPORTANCE_ORDER.indexOf(value as Importance);
  const ti = IMPORTANCE_ORDER.indexOf(threshold);
  if (vi < 0 || ti < 0) return false;
  return vi >= ti;
}
