import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import destCar from "../../assets/dest.png";

const destinationIcon = new L.Icon({
  iconUrl: destCar, // add icon in public/
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

export function DestinationMarker({ lat, lng }: { lat: number; lng: number }) {
  return (
    <Marker position={[lat, lng]} icon={destinationIcon}>
      <Popup>
        <strong>Destination</strong>
        <br />
        Lat: {lat.toFixed(6)}
        <br />
        Lng: {lng.toFixed(6)}
      </Popup>
    </Marker>
  );
}
