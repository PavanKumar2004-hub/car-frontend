export async function getRoute(
  from: [number, number],
  to: [number, number]
): Promise<[number, number][]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  // convert [lng, lat] → [lat, lng]
  return data.routes[0].geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng]
  );
}
