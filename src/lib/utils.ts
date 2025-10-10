import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uuid(): string {
  try {
    // Prefer Web Crypto API when available
    // @ts-ignore
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch {}
  // Fallback RFC4122-ish UUID v4
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  const hex = Array.from(bytes, toHex).join("");
  return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20)}`;
}

export function formatDateAU(input?: string | Date | null): string {
  if (!input) return "-";
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) {
    // Try YYYY-MM-DD manually
    const m = typeof input === "string" ? input.match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return String(input);
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function formatDateTimeAU(input?: string | Date | null): string {
  if (!input) return "-";
  const d = typeof input === "string" ? new Date(input.replace(" ", "T")) : input;
  if (isNaN(d.getTime())) return String(input);
  const date = formatDateAU(d);
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${date} ${hh}:${min}`;
}

export function formatCurrency(amount?: number | null, currency: string = "AUD"): string {
  const n = typeof amount === "number" ? amount : 0;
  return new Intl.NumberFormat("en-AU", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}