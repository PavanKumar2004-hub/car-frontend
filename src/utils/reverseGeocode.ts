export async function reverseGeocode(lat: number, lng: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );

  const data = await res.json();
  return data.display_name;
}
