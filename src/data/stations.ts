import type { Coordinates, Station } from '../types/station';

// Oslo S is a fixed demo location, never the user's position.
export const DEMO_POSITION: Coordinates = { latitude: 59.911, longitude: 10.752 };
// Fictional names and prices. Never refresh timestamps on startup.
export const STATIONS: readonly Station[] = [
  { id: 'demo-01', name: 'Demo Sentrum', coordinates: { latitude: 59.913, longitude: 10.758 }, prices: { petrol: 21.49, diesel: 20.19 }, updatedAt: '2026-09-18T17:00:00Z' },
  { id: 'demo-02', name: 'Demo Grünerløkka', coordinates: { latitude: 59.925, longitude: 10.76 }, prices: { petrol: 20.89, diesel: 20.49 }, updatedAt: '2026-09-18T14:00:00Z' },
  { id: 'demo-03', name: 'Demo Sagene', coordinates: { latitude: 59.937, longitude: 10.755 }, prices: { petrol: 20.89, diesel: 19.99 }, updatedAt: '2026-09-17T16:00:00Z' },
  { id: 'demo-04', name: 'Demo Skøyen', coordinates: { latitude: 59.922, longitude: 10.678 }, prices: { petrol: 22.09, diesel: 19.79 }, updatedAt: '2026-09-16T10:00:00Z' },
  { id: 'demo-05', name: 'Demo Bryn', coordinates: { latitude: 59.909, longitude: 10.825 }, prices: { petrol: 20.59, diesel: 20.29 }, updatedAt: '2026-09-18T16:30:00Z' },
  { id: 'demo-06', name: 'Demo Sandvika', coordinates: { latitude: 59.89, longitude: 10.525 }, prices: { petrol: 21.19, diesel: 20.09 }, updatedAt: '2026-09-17T09:00:00Z' },
  // Outside 25 km, to exercise the radius filter.
  { id: 'demo-07', name: 'Demo Drøbak', coordinates: { latitude: 59.663, longitude: 10.629 }, prices: { petrol: 18.99, diesel: 18.49 }, updatedAt: '2026-09-18T12:00:00Z' },
];
