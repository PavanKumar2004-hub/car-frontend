export function snapToRoute(
  gps: [number, number],
  route: [number, number][]
): [number, number] {
  if (!route.length) return gps;

  let minDist = Infinity;
  let snapped: [number, number] = gps;

  for (const point of route) {
    const d = Math.pow(point[0] - gps[0], 2) + Math.pow(point[1] - gps[1], 2);

    if (d < minDist) {
      minDist = d;
      snapped = point;
    }
  }

  return snapped;
}
