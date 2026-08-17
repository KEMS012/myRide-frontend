/**
 * Ogbomoso bike fare estimates based on actual distance research.
 *
 * Verified distances / sources:
 * - Under G–Stadium–LAUTECH 2nd Gate road ≈ 3 km (Oyo State Feedback Service)
 * - Apake → Stadium ≈ 5.9 km (HeyPlaces)
 * - Apake → LAUTECH ≈ 5.4 km (HeyPlaces)
 * - Agric–Caretaker–Takie–Sabo–Aroje stretch ≈ 7–8 km (Daily Post Nigeria)
 * - Iresapa → Ogbomoso core ≈ 5 km (Faster.NG)
 * - User actual fare: LAUTECH Teaching Hospital ride ≈ ₦600
 *
 * Fare table (passenger-facing):
 * 0–2 km   → ₦600–₦700
 * 2–4 km   → ₦700–₦850
 * 4–6 km   → ₦850–₦1,000
 * 6–8 km   → ₦1,000–₦1,150
 * 8–10 km  → ₦1,150–₦1,300
 * 10 km+   → ₦1,300+
 */

const KNOWN_DISTANCES_KM = [
  ["under-g", "stadium", 3],
  ["under-g", "lautech", 3],
  ["under-g", "lautech teaching hospital", 3],
  ["stadium", "lautech", 3],
  ["apake", "stadium", 5.9],
  ["apake", "lautech", 5.4],
  ["apake", "sabo", 1.5],
  ["apake", "caretaker", 5],
  ["sabo", "caretaker", 4.5],
  ["sabo", "arowomole", 5],
  ["sabo", "igboyi", 6],
  ["lautech", "caretaker", 6],
  ["lautech", "arowomole", 6.5],
  ["g ra", "lautech", 5],
  ["g ra", "under-g", 5.5],
  ["saja", "under-g", 6],
  ["ijeru", "caretaker", 3],
  ["masifa", "soun palace", 2.5],
  ["arowomole", "kajola", 1],
  ["osupa", "okelerin", 1],
  ["igboyi", "caretaker", 5.5],
  ["agric", "caretaker", 3],
  ["takie", "caretaker", 2.5],
  ["apake", "igboyi", 6],
  ["sabo", "igboyi", 5.5],
  ["isale afon", "arowomole", 4],
  ["stadium", "caretaker", 5],
  ["iresa-aadu", "ogbomoso", 10],
  ["ajawa", "ogbomoso", 12],
];

function lookupDistance(a, b) {
  const aLower = String(a || "").toLowerCase();
  const bLower = String(b || "").toLowerCase();
  const entry = KNOWN_DISTANCES_KM.find(([x, y, d]) =>
    (aLower.includes(x) && bLower.includes(y)) ||
    (aLower.includes(y) && bLower.includes(x))
  );
  return entry ? entry[2] : null;
}

export const AREAS = {
  north: [
    "Apake", "Idi-Isin", "Roundabout", "Star Light", "Bovas Area", "Bowen Road",
    "Sabo", "Oke-Ado", "Tara", "Isale-Taba", "Hausa Quarters", "Sabo Market",
    "Osupa", "Soun Palace", "Popo", "Isale General", "Idi-Abeere", "Okelerin",
    "Masifa", "Aguodo", "Gaa Masifa", "Oke-Masifa", "Isale-Masifa",
    "Saja", "Isale Ora", "Saja Market", "Abogunde", "Ogunbado", "Aaje",
    "Oke-Anu", "Stadium Area", "Federal Low Cost", "Akintola Layout",
    "LAUTECH", "LAUTECH Teaching Hospital", "Under-G", "Adenike", "Israel", "Yoaco", "Behind Stadium", "Randa",
    "GRA", "Oyo State GRA", "General", "State Hospital", "Blind Center",
    "NITEL Office", "Oluode Layout", "Aroje", "Agric",
  ],
  south: [
    "Caretaker", "Oke Alapata", "Idi-Agbon", "Owode",
    "Arowomole", "LGA Secretariat", "Kajola", "Idi-Igba", "Molete South",
    "Ijeru", "Onidewure", "Adeoye", "Sanuaje", "Obandi",
    "Igboyi", "Baptist Seminary", "Baptist Hospital", "Kowe", "Idioro",
    "Gaa-Lagbedu", "Oke-Ogun", "High School Area", "California", "Takie",
  ],
  peripheral: [
    "Ajawa", "Ajaawa", "Ife-Odan Road", "Iluju", "Iresa-Aadu", "Iresa-Pupa",
  ],
};

export function getZone(area) {
  const name = String(area || "").toLowerCase();
  if (AREAS.peripheral.some((a) => name.includes(a.toLowerCase()))) return "peripheral";
  if (AREAS.south.some((a) => name.includes(a.toLowerCase()))) return "south";
  return "north";
}

function estimateDistanceKm(from, to) {
  const known = lookupDistance(from, to);
  if (known !== null) return known;

  const fromZone = getZone(from);
  const toZone = getZone(to);

  if (fromZone === "peripheral" || toZone === "peripheral") return 12;
  if (fromZone === "north" && toZone === "south") return 6;
  if (fromZone === "south" && toZone === "north") return 6;
  return 2.5;
}

export function estimateBikeFare(from, to) {
  const distKm = estimateDistanceKm(from, to);

  if (distKm <= 2) return { min: 600, max: 700, tier: "0-2km" };
  if (distKm <= 4) return { min: 700, max: 850, tier: "2-4km" };
  if (distKm <= 6) return { min: 850, max: 1000, tier: "4-6km" };
  if (distKm <= 8) return { min: 1000, max: 1150, tier: "6-8km" };
  if (distKm <= 10) return { min: 1150, max: 1300, tier: "8-10km" };
  return { min: 1300, max: 1800, tier: "10km+" };
}

export const BIKE_FARE_RANGES = {
  "0-2km": { min: 600, max: 700 },
  "2-4km": { min: 700, max: 850 },
  "4-6km": { min: 850, max: 1000 },
  "6-8km": { min: 1000, max: 1150 },
  "8-10km": { min: 1150, max: 1300 },
  "10km+": { min: 1300, max: 1800 },
};

export const RIDE_TYPE_FARE_MAP = {
  "Standard Ride": 1200,
  "Executive Ride": 2500,
  "Fixed Passenger": 800,
  "Bike (Okada)": 700,
};

export function getDynamicFare(from, to, rideType = "Standard Ride") {
  if (rideType === "Bike (Okada)") {
    const estimate = estimateBikeFare(from, to);
    return Math.round((estimate.min + estimate.max) / 2);
  }
  return RIDE_TYPE_FARE_MAP[rideType] || 1200;
}
