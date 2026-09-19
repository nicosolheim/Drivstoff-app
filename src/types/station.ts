export type FuelType = 'petrol' | 'diesel';
export type Coordinates = Readonly<{ latitude: number; longitude: number }>;
export type Station = Readonly<{
  id: string;
  name: string;
  coordinates: Coordinates;
  prices: Readonly<Record<FuelType, number>>; // NOK per liter
  updatedAt: string; // ISO 8601 with timezone; shared by both prices
}>;
export type NearbyStation = Readonly<{ station: Station; distanceKm: number }>;
