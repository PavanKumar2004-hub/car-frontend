import L, { Icon } from "leaflet";
import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import car from "../../assets/start.png";
import { reverseGeocode } from "../../utils/reverseGeocode";

const carIcon: Icon = new L.Icon({
  iconUrl: car,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

type Props = {
  lat: number;
  lng: number;
};

export function CarMarker({ lat, lng }: Props) {
  const [place, setPlace] = useState("Loading...");

  useEffect(() => {
    reverseGeocode(lat, lng).then(setPlace);
  }, [lat, lng]);

  return (
    <Marker position={[lat, lng]} icon={carIcon}>
      <Popup className='md:w-[16rem] sm:w-[8rem]'>
        <strong>Location</strong>
        <br />
        {place}
        <br />
        <br />
        Lat: {lat.toFixed(6)}
        <br />
        Lng: {lng.toFixed(6)}
      </Popup>
    </Marker>
  );
}
