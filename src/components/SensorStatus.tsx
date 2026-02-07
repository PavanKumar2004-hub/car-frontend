import type { ReactNode } from "react";
import { FaCarCrash, FaCarSide, FaWalking, FaWineBottle } from "react-icons/fa";
import { useDashboardStore, type ContextRole } from "../store/dashboard.store";

type SensorState = "SAFE" | "WARNING" | "DANGER" | "NOT_CONNECTED" | "HIDDEN";
type SensorItem = {
  label: string;
  status: SensorState;
  icon: ReactNode;
};

const statusStyles: Record<SensorState, string> = {
  SAFE: "bg-green-500/20 text-green-400 border-green-400",
  WARNING: "bg-yellow-500/20 text-yellow-400 border-yellow-400",
  DANGER: "bg-red-500/20 text-red-400 border-red-500",
  NOT_CONNECTED: "bg-red-500/20 text-red-400 border-red-500 animate-pulse",
  HIDDEN: "bg-red-500/20 text-red-400 border-red-500",
};

const liveDot: Record<SensorState, string> = {
  SAFE: "bg-green-400",
  WARNING: "bg-yellow-400",
  DANGER: "bg-red-500 animate-pulse",
  NOT_CONNECTED: "bg-red-500 animate-pulse",
  HIDDEN: "bg-red-500",
};

const SensorStatus = () => {
  // 🔴 ALWAYS read EFFECTIVE sensors
  const sensors = useDashboardStore((s) => s.uiOverrideSensors ?? s.sensors);
  const { contextRole }: { contextRole: ContextRole | null } =
    useDashboardStore();

  const alcohol = sensors?.alcohol ?? 0;
  const front = sensors?.ultrasonic?.front ?? 0;
  const back = sensors?.ultrasonic?.back ?? 0;
  const left = sensors?.surface?.left ?? 0;
  const right = sensors?.surface?.right ?? 0;
  const x = sensors?.accel?.x;
  const y = sensors?.accel?.y;
  const z = sensors?.accel?.z;

  const alcoholStatus = (val: number): SensorState => {
    if (val && contextRole !== "FRIEND") {
      if (val <= 0.3) return "SAFE";
      if (val <= 0.7) return "WARNING";
      return "DANGER";
    } else if (contextRole === "FRIEND") {
      return "HIDDEN";
    } else {
      return "NOT_CONNECTED";
    }
  };

  const obstacleStatus = (distance: number): SensorState => {
    if (distance) {
      if (distance > 20) return "SAFE";
      if (distance <= 20 && distance > 10) return "WARNING";
      return "DANGER";
    } else {
      return "NOT_CONNECTED";
    }
  };

  const surfaceStatus = (l: number, r: number): SensorState => {
    if (l && r) {
      if (l > 20 && r > 20) return "SAFE";
      if ((l <= 20 && l > 10) || (r <= 20 && r > 10)) return "WARNING";
      return "DANGER";
    } else {
      return "NOT_CONNECTED";
    }
  };

  const accelStatus = (x: number, y: number, z: number): SensorState => {
    // 🔴 Not connected / no data
    if (x == null || y == null || z == null) {
      return "NOT_CONNECTED";
    }

    // total acceleration magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // 🟢 SAFE: near gravity, stable
    if (magnitude < 11) return "SAFE";

    // 🟡 WARNING: sudden movement / tilt
    if (magnitude < 15) return "WARNING";

    // 🔴 DANGER: impact / accident
    return "DANGER";
  };

  const sensorList: SensorItem[] = [
    {
      label: "Alcohol",
      status: alcoholStatus(alcohol),
      icon: <FaWineBottle />,
    },
    {
      label: "Object",
      status: obstacleStatus(Math.min(front, back)),
      icon: <FaCarSide />,
    },
    {
      label: "Footpath",
      status: surfaceStatus(left, right),
      icon: <FaWalking />,
    },
    {
      label: "Accident",
      status: accelStatus(x, y, z), // can be derived later from accel
      icon: <FaCarCrash />,
    },
  ];

  return (
    <section className='md:w-[20rem] sm:w-[12rem] md:rounded-xl sm:rounded-lg md:p-3! sm:pb-1! border border-blue-400 shadow-[inset_0_0_30px_rgba(59,130,246,0.25)] shadow-[0_0_22px_rgba(59,130,246,0.4)]'>
      <h3 className='text-center text-white md:text-lg sm:text-xs font-semibold md:tracking-wide md:mb-2! sm:mb-1!'>
        Sensor Status
      </h3>

      <div className='md:space-y-2.5! sm:space-y-0.5!'>
        {sensorList.map((sensor) => (
          <div
            key={sensor.label}
            className='flex items-center justify-between md:px-2! md:py-1! sm:px-1! sm:py-0.5! rounded-lg bg-black/60 border border-white/10'
          >
            <div className='flex items-center md:gap-2 sm:gap-1 text-gray-300'>
              <span className='text-indigo-400 md:text-lg sm:text-[0.6rem]'>
                {sensor.icon}
              </span>
              <span className='md:text-sm sm:text-[0.6rem] font-medium'>
                {sensor.label}
              </span>
            </div>

            <div className='flex items-center md:gap-1.5 sm:gap-1'>
              <span
                className={`md:w-1 md:h-1  sm:w-0.5 sm:h-0.5 rounded-full ${liveDot[sensor.status || "DANGER"]}`}
              />
              <span
                className={`md:text-xs sm:text-[0.5rem] font-medium md:px-1.5! sm:px-0.5! py-0.5! rounded-md border $${statusStyles[sensor.status || "DANGER"]}`}
              >
                {sensor.status || "not connected"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SensorStatus;
