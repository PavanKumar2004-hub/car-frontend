import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

import { MAP_CONFIG } from "../../config/map.config";
import {
  useDashboardStore,
  type ContextRole,
} from "../../store/dashboard.store";
import { useLiveGPS } from "../telemetry/useLiveGPS";
import { CarMarker } from "./CarMarker";

export function MapView() {
  const { lat, lng } = useLiveGPS();
  const { contextRole }: { contextRole: ContextRole | null } =
    useDashboardStore();

  return (
    <div
      className={`overflow-hidden  ${contextRole !== "FRIEND" ? "border-green-500 md:border-2 sm:border md:rounded-xl sm:rounded-lg" : "md:border-l-2 sm:border-l md:border-b-2 sm:border-b border-red-700 h-[24rem]"}  `}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={MAP_CONFIG.zoom}
        style={{
          height: `${contextRole !== "FRIEND" ? 20 : 24}rem`,
          width: "20rem",
          zIndex: 10,
        }}
        zoomControl={true}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer url={MAP_CONFIG.tileUrl} />
        <CarMarker lat={lat} lng={lng} />
        <FollowCar lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}

function FollowCar({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), {
      animate: true,
    });
  }, [lat, lng, map]);

  return null;
}
