import { useEffect, useRef } from "react";
import { useDisplayStore } from "../stores/useDisplayStore";
import { useMosqueStore } from "../stores/useMosqueStore";
import { usePrayerStore } from "../stores/usePrayerStore";
import { PrayerEngine } from "../engines/PrayerEngine";
import { dateToKey } from "../lib/utils/time";

/**
 * Loads today's prayer schedule into the display store on mount,
 * and re-fetches automatically when the calendar date changes (midnight rollover).
 */
export function usePrayerTimes(): void {
  const setTodayPrayers = useDisplayStore((s) => s.setTodayPrayers);
  const setNextPrayer = useDisplayStore((s) => s.setNextPrayer);
  const now = useDisplayStore((s) => s.now);

  const lastLoadedDate = useRef<string>("");
  const engineRef = useRef<PrayerEngine | null>(null);

  // Build engine once (or rebuild if config changes — handled by dep array)
  const config = useMosqueStore((s) => s.config);
  const calculationConfig = usePrayerStore((s) => s.calculationConfig);
  const iqomahConfig = usePrayerStore((s) => s.iqomahConfig);

  useEffect(() => {
    engineRef.current = new PrayerEngine(calculationConfig, iqomahConfig, {
      latitude: config.latitude,
      longitude: config.longitude,
    });
  }, [config.latitude, config.longitude, calculationConfig, iqomahConfig]);

  // Load schedule whenever the date changes
  useEffect(() => {
    const todayKey = dateToKey(now);
    if (todayKey === lastLoadedDate.current) return;
    if (!engineRef.current) return;

    lastLoadedDate.current = todayKey;

    const load = async () => {
      try {
        const schedule = await engineRef.current!.getTodaySchedule();
        setTodayPrayers(schedule.prayers);

        // Also update next prayer immediately after loading
        const next = engineRef.current!.getNextPrayer(now, schedule.prayers);
        setNextPrayer(next);
      } catch (error) {
        console.error("[usePrayerTimes] Failed to load schedule:", error);
      }
    };

    void load();
  }, [now, setTodayPrayers, setNextPrayer]);
}
