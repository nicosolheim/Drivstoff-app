import type { Coordinates } from '../types/station';

export type LocationResult =
  | { status: 'ready'; position: Coordinates; accuracy: number | null; timestamp: number }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'disabled' | 'error' | 'timeout' };

// Small adapter lets permission and failure paths be tested without a native phone.
export type LocationAccess = {
  permission: (request: boolean) => Promise<{ granted: boolean; canAskAgain: boolean }>;
  servicesEnabled: () => Promise<boolean>;
  currentPosition: () => Promise<{ coords: Coordinates & { accuracy: number | null }; timestamp: number }>;
};

export async function locate(access: LocationAccess, request: boolean, timeoutMs = 20_000): Promise<LocationResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const permission = await access.permission(request);
    if (!permission.granted) return { status: 'denied', canAskAgain: permission.canAskAgain };
    if (!await access.servicesEnabled()) return { status: 'disabled' };
    const fix = await Promise.race([
      access.currentPosition(),
      new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs); }),
    ]);
    if (!fix) return { status: 'timeout' };
    const { latitude, longitude, accuracy } = fix.coords;
    if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude)
      || Math.abs(longitude) > 180 || !Number.isFinite(fix.timestamp)
      || Math.abs(Date.now() - fix.timestamp) > 60_000) return { status: 'error' };
    return { status: 'ready', position: { latitude, longitude },
      accuracy: accuracy !== null && Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
      timestamp: fix.timestamp };
  } catch {
    return { status: 'error' };
  } finally {
    clearTimeout(timer);
  }
}
