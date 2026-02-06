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
  return [
    // Perfect matches (4 PODs)
    {
      bookingId: "BK-2024-0150",
      customer: "ABC Logistics",
      pickup: "Melbourne Warehouse",
      dropoff: "Sydney CBD",
      shouldMatch: true,
      matchPercent: 98,
      ocrExtracted: {
        bookingId: "BK-2024-0150",
        customer: "ABC Logistics",
        pickup: "Melbourne Warehouse",
        dropoff: "Sydney CBD",
      },
      bookingData: {
        bookingId: "BK-2024-0150",
        customer: "ABC Logistics",
        pickup: "Melbourne Warehouse",
        dropoff: "Sydney CBD",
        date: "2024-10-02",
      },
    },
    {
      bookingId: "BK-2024-0149",
      customer: "XYZ Freight",
      pickup: "Brisbane Port",
      dropoff: "Gold Coast",
      shouldMatch: true,
      matchPercent: 96,
      ocrExtracted: {
        bookingId: "BK-2024-0149",
        customer: "XYZ Freight",
        pickup: "Brisbane Port",
        dropoff: "Gold Coast",
      },
      bookingData: {
        bookingId: "BK-2024-0149",
        customer: "XYZ Freight",
        pickup: "Brisbane Port",
        dropoff: "Gold Coast",
        date: "2024-10-02",
      },
    },
    {
      bookingId: "BK-2024-0147",
      customer: "Fast Track Transport",
      pickup: "Perth Hub",
      dropoff: "Fremantle",
      shouldMatch: true,
      matchPercent: 97,
      ocrExtracted: {
        bookingId: "BK-2024-0147",
        customer: "Fast Track Transport",
        pickup: "Perth Hub",
        dropoff: "Fremantle",
      },
      bookingData: {
        bookingId: "BK-2024-0147",
        customer: "Fast Track Transport",
        pickup: "Perth Hub",
        dropoff: "Fremantle",
        date: "2024-10-03",
      },
    },
    {
      bookingId: "BK-2024-0146",
      customer: "Prime Logistics",
      pickup: "Adelaide Depot",
      dropoff: "Melbourne South",
      shouldMatch: true,
      matchPercent: 95,
      ocrExtracted: {
        bookingId: "BK-2024-0146",
        customer: "Prime Logistics",
        pickup: "Adelaide Depot",
        dropoff: "Melbourne South",
      },
      bookingData: {
        bookingId: "BK-2024-0146",
        customer: "Prime Logistics",
        pickup: "Adelaide Depot",
        dropoff: "Melbourne South",
        date: "2024-10-02",
      },
    },
    
    // Discrepancies (3 PODs)
    {
      bookingId: "BK-2024-0148",
      customer: "Global Shipping Co",
      pickup: "Adelaide Central Depot", // Different from OCR
      dropoff: "Melbourne CBD", // Different from OCR
      shouldMatch: false,
      matchPercent: 72,
      ocrExtracted: {
        bookingId: "BK-2024-0148",
        customer: "Global Shipping Co",
        pickup: "Adelaide Depot South", // OCR misread
        dropoff: "Melbourne South CBD", // OCR misread
      },
      bookingData: {
        bookingId: "BK-2024-0148",
        customer: "Global Shipping Co",
        pickup: "Adelaide Central Depot",
        dropoff: "Melbourne CBD",
        date: "2024-10-02",
      },
      discrepancyReasons: [
        "Pickup location text variation detected",
        "Dropoff location differs slightly",
      ],
    },
    {
      bookingId: "BK-2024-0145",
      customer: "Coast Express",
      pickup: "Sydney Port",
      dropoff: "Newcastle Warehouse",
      shouldMatch: false,
      matchPercent: 68,
      ocrExtracted: {
        bookingId: "BK-2024-0145",
        customer: "Coastal Express", // OCR misread
        pickup: "Sydney Port Terminal 3", // More specific than booking
        dropoff: "Newcastle Warehouse",
      },
      bookingData: {
        bookingId: "BK-2024-0145",
        customer: "Coast Express",
        pickup: "Sydney Port",
        dropoff: "Newcastle Warehouse",
        date: "2024-10-02",
      },
      discrepancyReasons: [
        "Customer name variation (Coastal vs Coast)",
        "Pickup location more specific than booking",
      ],
    },
    {
      bookingId: "BK-2024-0144",
      customer: "Metro Freight Solutions",
      pickup: "Brisbane Depot",
      dropoff: "Sunshine Coast",
      shouldMatch: false,
      matchPercent: 65,
      ocrExtracted: {
        bookingId: "BK-2024-0144",
        customer: "Metro Freight Solutions",
        pickup: "Brisbane North Depot", // More specific
        dropoff: "Sunshine Coast Distribution", // More specific
      },
      bookingData: {
        bookingId: "BK-2024-0144",
        customer: "Metro Freight Solutions",
        pickup: "Brisbane Depot",
        dropoff: "Sunshine Coast",
        date: "2024-10-03",
      },
      discrepancyReasons: [
        "Pickup location has additional detail",
        "Dropoff location has additional detail",
      ],
    },
  ];
}
