import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { locate } from '../lib/location';
import type { LocationAccess, LocationResult } from '../lib/location';

type State = LocationResult | { status: 'demo' | 'loading' };
const access: LocationAccess = {
  permission: (request) => request ? Location.requestForegroundPermissionsAsync() : Location.getForegroundPermissionsAsync(),
  servicesEnabled: Location.hasServicesEnabledAsync,
  currentPosition: () => Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
};

export function useUserLocation() {
  const [state, setState] = useState<State>({ status: 'demo' });
  const requestId = useRef(0);
  const wantsLocation = useRef(false);
  const invalidate = useCallback(() => { requestId.current += 1; }, []);
  const refresh = useCallback(async (request = true) => {
    wantsLocation.current = true;
    const id = ++requestId.current;
    setState({ status: 'loading' });
    const result = await locate(access, request);
    // A late GPS result must not override a later demo choice or a background transition.
    if (id === requestId.current) setState(result);
  }, []);
  const useDemo = useCallback(() => {
    wantsLocation.current = false;
    ++requestId.current;
    setState({ status: 'demo' });
  }, []);
  useEffect(() => {
    let backgrounded = false;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') {
        backgrounded = true;
        ++requestId.current;
        setState({ status: 'demo' }); // Do not retain/display a stale position on return.
      } else if (next === 'active' && backgrounded) {
        backgrounded = false;
        if (wantsLocation.current) void refresh(false); // Never show a system permission prompt automatically.
      }
    });
    return () => { invalidate(); subscription.remove(); };
  }, [refresh, invalidate]);
  return { state, refresh, useDemo };
}
