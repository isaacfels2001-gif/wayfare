export const AIRPORTS = [
  { code: "JFK", city: "New York" },
  { code: "LAX", city: "Los Angeles" },
  { code: "LHR", city: "London" },
  { code: "SFO", city: "San Francisco" },
  { code: "NRT", city: "Tokyo" },
  { code: "MIA", city: "Miami" },
] as const;

export function airportLabel(code: string) {
  const airport = AIRPORTS.find((a) => a.code === code);
  return airport ? `${airport.city} (${airport.code})` : code;
}
