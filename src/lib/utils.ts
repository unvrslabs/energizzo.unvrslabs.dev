import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function contrastText(hex: string): "light" | "dark" {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.62 ? "dark" : "light";
}

export function firstPhone(telefoni: string | null): string | null {
  if (!telefoni) return null;
  const parts = telefoni.split(",").map((s) => s.trim()).filter(Boolean);
  return parts[0] ?? null;
}
