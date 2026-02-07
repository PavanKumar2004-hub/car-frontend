import { useDashboardStore } from "../../store/dashboard.store";

/**
 * Custom hook — SAFE to use hooks here
 */
export function useMockGPS() {
  const sensors = useDashboardStore((s) => s.uiOverrideSensors ?? s.sensors);

  return {
    lat: sensors?.location?.lat ?? 0,
    lng: sensors?.location?.lng ?? 0,
    speed: 40,
    heading: 90,
  };
}
