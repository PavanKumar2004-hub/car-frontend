import { useDashboardStore } from "../../store/dashboard.store";

export type GPSPosition = {
  lat: number;
  lng: number;
  speed: number;
  heading: number;
};

export function useLiveGPS(): GPSPosition {
  const sensors = useDashboardStore((s) => s.uiOverrideSensors ?? s.sensors);

  return {
    lat: sensors?.location?.lat ?? 0,
    lng: sensors?.location?.lng ?? 0,
    speed: sensors?.speed ?? 0,
    heading: sensors?.heading ?? 0, // safe default
  };
}
