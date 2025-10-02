// Demo OCR utilities for extracting key fields from a POD file name/content

export type DemoOcrResult = {
  extractedBookingId?: string;
  matchPercent: number;
  fields: Record<string, string>;
};

export function inferBookingIdFromName(name: string): string | undefined {
  const m = name.match(/BK[-_]?(\d{4})[-_]?(\d{3,})/i);
  if (!m) return undefined;
  const year = m[1];
  const seq = m[2];
  return `BK-${year}-${seq}`.toUpperCase();
}

export async function demoOcr(file: File): Promise<DemoOcrResult> {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 250));
  const inferred = inferBookingIdFromName(file.name);
  const samples = {
    customers: ["ABC Logistics", "XYZ Freight", "Global Shipping Co", "Fast Track Transport", "Prime Logistics"],
    pickups: ["Melbourne Warehouse", "Brisbane Port", "Adelaide Depot", "Perth Hub", "Sydney DC"],
    dropoffs: ["Sydney CBD", "Gold Coast", "Melbourne", "Fremantle", "Newcastle"],
  };
  const seed = Array.from(file.name).reduce((a, c) => (a + c.charCodeAt(0)) % 97, 0);
  const pick = (arr: string[]) => arr[seed % arr.length];
  const matchPercent = inferred ? 92 + Math.floor((seed % 8)) : 45 + Math.floor((seed % 35));
  const fields: Record<string, string> = {
    bookingId: inferred ?? "",
    customer: pick(samples.customers),
    pickup: pick(samples.pickups),
    dropoff: pick(samples.dropoffs),
  };
  return { extractedBookingId: inferred, matchPercent, fields };
}


