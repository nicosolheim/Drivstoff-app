import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { fetch } from 'expo/fetch';
import { downloadStations } from '../lib/download-stations';
import { refreshDue } from '../lib/station-cache';
import type { CachedData } from '../lib/station-cache';
import { stationCache } from '../services/station-storage';

type State = { cached: CachedData | null; loading: boolean; error: string | null };
const Context = createContext<(State & { retry(): void }) | null>(null);

export function StationDataProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<State>({ cached: null, loading: true, error: null });
  const activeRequest = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const initialized = useRef(false);
  const lastAttempt = useRef<number | null>(null);
  const latestData = useRef<CachedData | null>(null);
  const refresh = useCallback(async (manual = false) => {
    if (!initialized.current || !mounted.current || activeRequest.current || AppState.currentState !== 'active') return;
    const now = Date.now();
    if (!manual && !refreshDue(lastAttempt.current, now)) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    lastAttempt.current = now;
    setState((old) => ({ ...old, loading: true, error: null }));
    let storageFailed = false;
    try {
      try { await stationCache.recordAttempt(now); } catch { storageFailed = true; }
      const cached = await downloadStations(fetch, Date.now, controller.signal);
      if (controller.signal.aborted) return;
      if (latestData.current && Date.parse(cached.data.sourceExportedAt) < Date.parse(latestData.current.data.sourceExportedAt)) {
        throw new Error('Datakilden returnerte en eldre eksport');
      }
      try { await stationCache.save(cached.snapshot, Date.now()); } catch { storageFailed = true; }
      if (mounted.current && !controller.signal.aborted) {
        latestData.current = cached;
        setState({ cached, loading: false,
          error: storageFailed ? 'Data er hentet, men kunne ikke lagres lokalt. De er kanskje ikke tilgjengelige neste gang uten nett.' : null });
      }
    } catch {
      if (mounted.current && !controller.signal.aborted) setState((old) => ({ ...old, loading: false,
        error: 'Kunne ikke hente et gyldig datasett. Siste lagrede data beholdes. Kontroller nettet og prøv igjen.' }));
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
      if (mounted.current && controller.signal.aborted) setState((old) => ({ ...old, loading: false,
        error: 'Datainnhentingen ble avbrutt da appen ble lukket. Siste lagrede data beholdes. Du kan prøve igjen.' }));
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    void (async () => {
      const [cached, attempt] = await Promise.all([stationCache.load(Date.now()), stationCache.lastAttempt()]);
      if (cancelled) return;
      lastAttempt.current = attempt;
      initialized.current = true;
      latestData.current = cached;
      setState({ cached, loading: false, error: cached ? null : 'Ingen lagrede data ennå. Bruk nett for ekte stasjoner, eller velg Oslo-demo.' });
      void refresh();
    })();
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refresh();
      else if (next === 'background') activeRequest.current?.abort();
    });
    // Check while the app stays open too; actual downloads remain limited to once per 12 hours.
    const timer = setInterval(() => { void refresh(); }, 60_000);
    return () => { cancelled = true; mounted.current = false; initialized.current = false;
      activeRequest.current?.abort(); subscription.remove(); clearInterval(timer); };
  }, [refresh]);
  return <Context.Provider value={{ ...state, retry: () => { void refresh(true); } }}>{children}</Context.Provider>;
}
export function useStationData() {
  const context = useContext(Context);
  if (!context) throw new Error('StationDataProvider mangler');
  return context;
}
