import { Polyline } from "react-leaflet";

export function RouteLine({ points }: { points: [number, number][] }) {
  if (!points.length) return null;

  return (
    <Polyline
      positions={points}
      pathOptions={{
        color: "#00e5ff",
        weight: 8,
        opacity: 1,
      }}
    />
  );
}
