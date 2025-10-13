// Demo-only Xero integration helpers. Simulates OAuth connect and invoice send.

export type XeroInvoicePayload = {
  InvoiceNumber: string;
  Contact: { Name: string };
  Date: string; // ISO YYYY-MM-DD
  Amount: string; // formatted amount for demo
  Status?: "DRAFT" | "SUBMITTED" | "AUTHORISED" | "PAID";
};

const STORAGE_KEY = "xero_demo_connected";

export function isXeroConnected(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export async function connectXero(): Promise<void> {
  // Simulate OAuth popup + token exchange
  await delay(800);
  localStorage.setItem(STORAGE_KEY, "true");
}

export async function disconnectXero(): Promise<void> {
  await delay(200);
  localStorage.removeItem(STORAGE_KEY);
}

export async function sendInvoiceToXero(payload: XeroInvoicePayload): Promise<{ xeroId: string }>
{
  // Simulate network latency and occasional error
  await delay(600 + Math.random() * 600);
  const fail = Math.random() < 0.08; // 8% demo failure rate
  if (fail) {
    throw new Error(`Xero rejected invoice ${payload.InvoiceNumber}`);
  }
  const xeroId = `XI-${Math.floor(Math.random() * 1_000_000)}`;
  return { xeroId };
}

export async function sendBatchToXero(
  invoices: XeroInvoicePayload[],
  onProgress?: (index: number, total: number, result: { ok: boolean; message: string }) => void,
): Promise<{ ok: boolean; sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < invoices.length; i++) {
    const inv = invoices[i];
    try {
      const res = await sendInvoiceToXero(inv);
      sent++;
      onProgress?.(i + 1, invoices.length, { ok: true, message: `${inv.InvoiceNumber} → ${res.xeroId}` });
    } catch (e: any) {
      failed++;
      onProgress?.(i + 1, invoices.length, { ok: false, message: e?.message ?? "Failed" });
    }
  }
  return { ok: failed === 0, sent, failed };
}

export function mapToXeroPayload(input: {
  invoiceNo: string;
  customer: string;
  date: string; // YYYY-MM-DD
  amount: string; // "$1,240.00"
}): XeroInvoicePayload {
  return {
    InvoiceNumber: input.invoiceNo,
    Contact: { Name: input.customer },
    Date: input.date,
    Amount: input.amount,
    Status: "SUBMITTED",
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}








