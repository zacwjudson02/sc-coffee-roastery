// Demo POD file generator for interactive workflow

export type DemoPodFileConfig = {
  bookingId: string;
  customer: string;
  pickup: string;
  dropoff: string;
  shouldMatch: boolean; // true for auto-match, false for discrepancy
  matchPercent: number;
  // OCR extracted data (what the system reads)
  ocrExtracted: {
    bookingId: string;
    customer: string;
    pickup: string;
    dropoff: string;
  };
  // Actual booking data (what's in the system)
  bookingData: {
    bookingId: string;
    customer: string;
    pickup: string;
    dropoff: string;
    date: string;
  };
  discrepancyReasons?: string[];
};

export function generateDemoPodFile(config: DemoPodFileConfig): File {
  const fileName = config.shouldMatch 
    ? `POD-${config.bookingId}.pdf`
    : `POD-${config.bookingId}-${Date.now().toString().slice(-4)}.pdf`;
  
  // Create a mock PDF content
  const content = `
PROOF OF DELIVERY
==================

Booking ID: ${config.ocrExtracted.bookingId}
Customer: ${config.ocrExtracted.customer}
Pickup: ${config.ocrExtracted.pickup}
Dropoff: ${config.ocrExtracted.dropoff}

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Signature: _______________
Driver: Demo Driver
`;

  const blob = new Blob([content], { type: "application/pdf" });
  return new File([blob], fileName, { type: "application/pdf", lastModified: Date.now() });
}

export function getDemoWorkflowPods(): DemoPodFileConfig[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    // Perfect matches (4 PODs)
    {
      bookingId: "ORD-2026-0201",
      customer: "Noosa Heads Cafe",
      pickup: "SC Roastery HQ",
      dropoff: "Noosa Cafe Strip",
      shouldMatch: true,
      matchPercent: 98,
      ocrExtracted: {
        bookingId: "ORD-2026-0201",
        customer: "Noosa Heads Cafe",
        pickup: "SC Roastery HQ",
        dropoff: "Noosa Cafe Strip",
      },
      bookingData: {
        bookingId: "ORD-2026-0201",
        customer: "Noosa Heads Cafe",
        pickup: "SC Roastery HQ",
        dropoff: "Noosa Cafe Strip",
        date: today,
      },
    },
    {
      bookingId: "ORD-2026-0202",
      customer: "Mooloolaba Espresso Bar",
      pickup: "SC Roastery HQ",
      dropoff: "Mooloolaba Esplanade",
      shouldMatch: true,
      matchPercent: 96,
      ocrExtracted: {
        bookingId: "ORD-2026-0202",
        customer: "Mooloolaba Espresso Bar",
        pickup: "SC Roastery HQ",
        dropoff: "Mooloolaba Esplanade",
      },
      bookingData: {
        bookingId: "ORD-2026-0202",
        customer: "Mooloolaba Espresso Bar",
        pickup: "SC Roastery HQ",
        dropoff: "Mooloolaba Esplanade",
        date: today,
      },
    },
    {
      bookingId: "ORD-2026-0204",
      customer: "Coolum Beach Cafe",
      pickup: "SC Roastery HQ",
      dropoff: "Coolum Beach",
      shouldMatch: true,
      matchPercent: 97,
      ocrExtracted: {
        bookingId: "ORD-2026-0204",
        customer: "Coolum Beach Cafe",
        pickup: "SC Roastery HQ",
        dropoff: "Coolum Beach",
      },
      bookingData: {
        bookingId: "ORD-2026-0204",
        customer: "Coolum Beach Cafe",
        pickup: "SC Roastery HQ",
        dropoff: "Coolum Beach",
        date: today,
      },
    },
    {
      bookingId: "ORD-2026-0208",
      customer: "Buderim Village Roast",
      pickup: "SC Roastery HQ",
      dropoff: "Buderim Village",
      shouldMatch: true,
      matchPercent: 95,
      ocrExtracted: {
        bookingId: "ORD-2026-0208",
        customer: "Buderim Village Roast",
        pickup: "SC Roastery HQ",
        dropoff: "Buderim Village",
      },
      bookingData: {
        bookingId: "ORD-2026-0208",
        customer: "Buderim Village Roast",
        pickup: "SC Roastery HQ",
        dropoff: "Buderim Village",
        date: today,
      },
    },
    
    // Discrepancies (3 PODs)
    {
      bookingId: "ORD-2026-0203",
      customer: "Caloundra Bakehouse",
      pickup: "SC Roastery HQ",
      dropoff: "Caloundra Main St",
      shouldMatch: false,
      matchPercent: 72,
      ocrExtracted: {
        bookingId: "ORD-2026-0203",
        customer: "Caloundra Bakehouse",
        pickup: "SC Roastery Warehouse",
        dropoff: "Caloundra CBD",
      },
      bookingData: {
        bookingId: "ORD-2026-0203",
        customer: "Caloundra Bakehouse",
        pickup: "SC Roastery HQ",
        dropoff: "Caloundra Main St",
        date: today,
      },
      discrepancyReasons: [
        "Pickup location text variation detected",
        "Dropoff location differs slightly",
      ],
    },
    {
      bookingId: "ORD-2026-0205",
      customer: "Peregian Beach Kiosk",
      pickup: "SC Roastery HQ",
      dropoff: "Peregian Beach Kiosk",
      shouldMatch: false,
      matchPercent: 68,
      ocrExtracted: {
        bookingId: "ORD-2026-0205",
        customer: "Peregian Beach Cafe",
        pickup: "SC Roastery HQ Warana",
        dropoff: "Peregian Beach",
      },
      bookingData: {
        bookingId: "ORD-2026-0205",
        customer: "Peregian Beach Kiosk",
        pickup: "SC Roastery HQ",
        dropoff: "Peregian Beach Kiosk",
        date: today,
      },
      discrepancyReasons: [
        "Customer name variation (Cafe vs Kiosk)",
        "Pickup location more specific than order",
      ],
    },
    {
      bookingId: "ORD-2026-0206",
      customer: "Alexandra Headland Brew",
      pickup: "SC Roastery HQ",
      dropoff: "Alexandra Headland",
      shouldMatch: false,
      matchPercent: 65,
      ocrExtracted: {
        bookingId: "ORD-2026-0206",
        customer: "Alexandra Headland Brew",
        pickup: "SC Roastery HQ Unit 4",
        dropoff: "Alex Headland Strip",
      },
      bookingData: {
        bookingId: "ORD-2026-0206",
        customer: "Alexandra Headland Brew",
        pickup: "SC Roastery HQ",
        dropoff: "Alexandra Headland",
        date: today,
      },
      discrepancyReasons: [
        "Pickup location has additional detail",
        "Dropoff location abbreviation differs",
      ],
    },
  ];
}
