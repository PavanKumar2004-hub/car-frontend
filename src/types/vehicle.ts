export type VehicleStatus = "RUNNING" | "STOPPED" | "EMERGENCY";

export interface UltrasonicData {
  front: number; // cm
  rear: number; // cm
}

export interface VehicleData {
  speed: number; // km/h
  alcohol: number; // MQ-3 raw value
  distanceTravelled: number; // km
  status: VehicleStatus;
  ultrasonic: UltrasonicData;
  footpathDetected: boolean;
  latitude: number;
  longitude: number;
}

export type FamilyMember = {
  id: string;
  name: string;
  phone: string;
};

export type CarStartRequest = {
  id: string;
  requestedAt: number;
  expiresAt: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  carData: {
    speed: number;
    alcoholLevel: number;
    location: string;
  };
};

// vehicleController.ts
export type CarState =
  | "STOPPED"
  | "REQUEST_PENDING"
  | "LIMITED_MODE"
  | "RUNNING";

export function handleApproval(
  status: "APPROVED" | "REJECTED" | "EXPIRED",
  setCarState: (state: CarState) => void
) {
  if (status === "APPROVED") {
    setCarState("LIMITED_MODE"); // capped speed
  } else {
    setCarState("STOPPED");
  }
}

export type AccelSample = {
  x: number;
  y: number;
  z: number;
  time: number;
};

export type AccelStatus = "NORMAL" | "WARNING" | "IMPACT" | "__";

export type SensorLevel = "SAFE" | "WARNING" | "DANGER" | "OFFLINE";

export type SensorItem = {
  id: string;
  label: string;
  level: SensorLevel;
  value?: string;
};
