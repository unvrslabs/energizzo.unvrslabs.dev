const DEFAULT_URL = "https://www.wasenderapi.com/api/send-message";

export async function sendWhatsAppText(phone: string, text: string): Promise<void> {
  const apiKey = process.env.WASENDER_API_KEY;
  const apiUrl = process.env.WASENDER_API_URL || DEFAULT_URL;
  if (!apiKey) {
    throw new Error("WASENDER_API_KEY mancante");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ to: phone, text }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`WaSender HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}
