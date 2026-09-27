export type FuelType = 'petrol95' | 'petrol98' | 'diesel';
export type DataMode = 'live' | 'demo';
export type SourceId = 'drivstoffpriser' | 'demo';
export type Coordinates = Readonly<{ latitude: number; longitude: number }>;
export type PriceQuote = Readonly<{
  amountOrePerLiter: number;
  sourceId: SourceId;
  sourceUpdatedAtRaw: string | null;
  reportedAt: string | null; // Normalized only when the source supplies an explicit timezone.
  observedAt: string | null; // Not supplied by the current export; never infer observation time.
  reportCount: number | null;
}>;
export type Station = Readonly<{
  id: string;
  sourceId: SourceId;
  sourceStationId: string;
  name: string;
  brand: string | null;
  address: string | null;
  city: string | null;
  coordinates: Coordinates;
  prices: Readonly<Partial<Record<FuelType, PriceQuote>>>;
}>;
export type NearbyStation = Readonly<{ station: Station; distanceKm: number }>;
