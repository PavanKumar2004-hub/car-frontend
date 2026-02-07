import fixCar from "../assets/car3.png";
import Car from "../assets/road.png";
import { useDashboardStore } from "../store/dashboard.store";
type Level = "SAFE" | "WARNING" | "DANGER" | "IDLE";

const levelFromValue = (v: number | null | undefined): Level => {
  if (v == null) return "IDLE"; // 👈 NEW
  if (v > 20) return "SAFE";
  if (v > 10) return "WARNING";
  return "DANGER";
};
const colorFromLevel = (l: Level) => {
  switch (l) {
    case "SAFE":
      return "lime";
    case "WARNING":
      return "yellow";
    case "DANGER":
      return "red";
    case "IDLE":
      return "orange"; // 👈 neutral
  }
};

const CarImage = () => {
  const sensors = useDashboardStore((s) => s.uiOverrideSensors ?? s.sensors);
  const alcoholPercent = Math.round(sensors?.alcohol * 100);
  const speed = sensors?.speed;
  const front = sensors?.ultrasonic?.front;
  const back = sensors?.ultrasonic?.back;
  const leftSurface = sensors?.surface?.left;
  const rightSurface = sensors?.surface?.right;
  const x = sensors?.accel?.x;
  const y = sensors?.accel?.y;
  const z = sensors?.accel?.z;

  const mag = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  const running =
    alcoholPercent <= 70 &&
    speed > 3 &&
    front > 10 &&
    back > 10 &&
    leftSurface > 10 &&
    rightSurface > 10 &&
    mag < 14;

  const CENTER_SURFACE = 30; // ideal center distance (cm)
  const DEAD_ZONE = 3; // ±3cm = no movement
  const MAX_SHIFT = 40; // px

  const carOffsetX = (left?: number, right?: number) => {
    if (left == null || right == null) return 0;

    // deviation from center
    const leftError = CENTER_SURFACE - left;
    const rightError = CENTER_SURFACE - right;

    // net steering force
    const error = rightError - leftError;

    // 🟢 DEAD ZONE → keep car centered
    if (Math.abs(error) <= DEAD_ZONE) return 0;

    // scale error to pixels
    const movement = error * 1.2;

    // clamp movement
    return Math.max(-MAX_SHIFT, Math.min(movement, MAX_SHIFT));
  };

  const MAX_SHIFT1 = 20; // svg units

  const apexShift = (
    left: number | null | undefined,
    right: number | null | undefined
  ) => {
    // 👈 if any missing, keep centered
    if (left == null || right == null) return 0;

    const diff = left - right;

    if (Math.abs(diff) <= DEAD_ZONE) return 0;

    return Math.max(-MAX_SHIFT1, Math.min(diff * 0.5, MAX_SHIFT1));
  };

  const leftLevel = levelFromValue(leftSurface);
  const rightLevel = levelFromValue(rightSurface);

  const leftColor = colorFromLevel(leftLevel);
  const rightColor = colorFromLevel(rightLevel);
  const shift = apexShift(leftSurface, rightSurface);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
      onKeyDown={(e) => e.preventDefault()}
      tabIndex={-1}
      className='relative md:h-80 sm:h-45 overflow-hidden pointer-events-none  md:border-2 sm:border border-teal-400 rounded-md shadow-[inset_0_0_30px_rgba(0,229,255,0.22)]
shadow-[0_0_22px_rgba(0,229,255,0.35)] md:px-2! md:pt-2! sm:px-1! sm:pt-1! md:w-[20rem] sm:w-[11rem]'
    >
      <div className='absolute top-2 left-1/2 -translate-x-1/2 md:w-[11rem] sm:w-[5.2rem]'>
        <h3 className='border border-teal-300 md:px-3! md:py-2! sm:px-1.5! sm:py-1! md:text-xs sm:text-[0.5rem]  rounded-lg'>
          Car Status:{" "}
          <span
            className={`md:px-2! md:py-0.5! md:text-sm sm:px-1! sm:py-0.5! sm:text-[]0.4rem ${running ? "bg-green-700" : "bg-red-700"} font-medium rounded-sm`}
          >
            {running ? "Running" : "stop"}
          </span>
        </h3>
      </div>
      <div
        className={`absolute top-1/2 left-1/2 md:px-4! md:py-1! sm:px-2! sm:py-0.5! md:-translate-x-1/2 md:-translate-y-6/2 sm:-translate-x-1/2 sm:-translate-y-5/2 border backdrop-blur-md md:text-sm  sm:text-[0.5rem] font-medium rounded-lg z-20 ${front > 20 ? "border-green-500 bg-black text-green-500" : front <= 20 && front > 10 ? "border-yellow-500 bg-black text-yellow-500" : "border-red-500 bg-black text-red-500"} `}
      >
        F: {front}cm
      </div>

      <div
        className={`absolute bottom-1/2 left-1/2 md:px-4! md:py-1! sm:px-2! sm:py-0.5! md:-translate-x-1/2 md:translate-y-10/2 sm:-translate-x-1/2 sm:translate-y-8/2 border backdrop-blur-md md:text-sm  sm:text-[0.5rem] font-medium rounded-lg z-20 ${back > 20 ? "border-green-500 bg-black text-green-500" : back <= 20 && back > 10 ? "border-yellow-500 bg-black text-yellow-500" : "border-red-500 bg-black text-red-500"} `}
      >
        B: {back}cm
      </div>

      <div
        className='
         origin-top scale-x-50
         bg-linear-to-t
         from-cyan-400 via-cyan-400/70 to-transparent
         shadow-[0_0_16px_rgba(34,211,238,0.9)]
         absolute left-1/2 top-1/2 md:h-10 md:w-3 md:-translate-x-1/2 md:-translate-y-6/4 sm:h-5 sm:w-1.5 sm:-translate-x-1/2 sm:-translate-y-5/4
           animate-pulse z-20'
      />
      <div
        className='
              animate-pulse
         origin-top scale-x-50
         bg-linear-to-b
         from-cyan-400 via-cyan-400/70 to-transparent
         shadow-[0_0_16px_rgba(34,211,238,0.9)]
         absolute left-1/2 bottom-1/2 md:h-10 md:w-3 md:-translate-x-1/2 md:translate-y-12/4 sm:h-5 sm:w-1.5 sm:-translate-x-1/2 sm:translate-y-12/4
           z-20'
      />

      <div className='absolute md:left-16 sm:left-12 top-1/2 translate-y-1/2 z-20'>
        <div
          className='w-0 h-0
                md:border-t-16 md:border-b-16 md:border-r-12 sm:border-t-8 sm:border-b-8 sm:border-r-6
                border-t-transparent border-b-transparent
                
                border-r-cyan-400 animate-pulse'
        ></div>
      </div>

      <div className='absolute md:right-16 sm:right-12 top-1/2 translate-y-1/2 z-20'>
        <div
          className='w-0 h-0
                md:border-t-16 md:border-b-16 md:border-l-12 sm:border-t-8 sm:border-b-8 sm:border-l-6
                border-t-transparent border-b-transparent
                border-l-cyan-400 animate-pulse'
        ></div>
      </div>

      <svg
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
        className='absolute inset-0 sm:top-4 md:top-0 z-10 pointer-events-none'
      >
        {/* LEFT EDGE */}
        <line
          x1='20'
          y1='100'
          x2={40 + shift}
          y2='32'
          stroke={leftColor}
          strokeWidth='1.2'
          style={{ filter: `drop-shadow(0 0 6px ${leftColor})` }}
        />

        {/* RIGHT EDGE */}
        <line
          x1='80'
          y1='100'
          x2={60 + shift}
          y2='32'
          stroke={rightColor}
          strokeWidth='1.2'
          style={{ filter: `drop-shadow(0 0 6px ${rightColor})` }}
        />
      </svg>

      {/* <div
        className={`absolute  top-1/2 h-[15rem] flex items-center  z-20 -translate-x-1/2 -translate-y-2/7 ${leftSurfacePosition(leftSurface)}`}
      >
        <div
          className={`h-full w-[3px] ${leftSurface > 20 ? "bg-green-500 shadow-[0_0_16px_rgba(134,220,18,0.9)]" : leftSurface <= 20 && leftSurface > 10 ? "bg-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.9)]" : "bg-red-500 shadow-[0_0_18px_rgba(239,68,68,1)] animate-pulse"} `}
        ></div>
      </div>

      <div
        className={`absolute  top-1/2 h-[15rem] flex items-center  z-20 translate-x-1/2 -translate-y-2/7 ${rightSurfacePosition(rightSurface)}`}
      >
        <div
          className={`h-full w-[3px] ${rightSurface > 20 ? "bg-green-500 shadow-[0_0_16px_rgba(134,220,18,0.9)]" : rightSurface <= 20 && rightSurface > 10 ? "bg-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.9)]" : "bg-red-500 shadow-[0_0_18px_rgba(239,68,68,1)] animate-pulse"} `}
        ></div>
      </div> */}

      <div
        className={`absolute top-1/2 left-1/2 md:px-3! md:py-1! sm:px-1.5! sm:py-0.5! md:-translate-x-4/2 md:translate-y-3/2 sm:-translate-x-5/3 sm:translate-y-3/2 border backdrop-blur-md md:text-sm sm:text-[0.5rem] font-medium rounded-lg z-20 ${leftSurface > 20 ? "border-blue-500 bg-black text-blue-500" : leftSurface <= 20 && leftSurface > 10 ? "border-yellow-500 bg-black text-yellow-500" : "border-red-500 bg-black text-red-500"} `}
      >
        L: {leftSurface}cm
      </div>

      <div
        className={`absolute top-1/2 left-1/2 md:px-3! md:py-1! sm:px-1.5! sm:py-0.5! md:translate-x-2/2 md:translate-y-3/2 sm:translate-x-2/3 sm:translate-y-3/2  border backdrop-blur-md md:text-sm sm:text-[0.5rem] font-medium rounded-lg z-20 ${rightSurface > 20 ? "border-blue-500 bg-black text-blue-500" : rightSurface <= 20 && rightSurface > 10 ? "border-yellow-500 bg-black text-yellow-500" : "border-red-500 bg-black text-red-500"} `}
      >
        R: {rightSurface}cm
      </div>

      <img
        src={Car}
        alt=''
        className={`md:w-[20rem] sm:w-[10rem] sm:h-44 md:h-85 ${running ? "animate-road-move" : ""} `}
      />
      <img
        src={fixCar}
        alt=''
        className='
    md:w-[12rem] sm:w-[6rem] h-fit translate-y-2/6
    absolute top-1/2 left-1/2
    transition-transform duration-300 ease-out
  '
        style={{
          transform: `
      translate(-50%, -50%)
      translateX(${carOffsetX(leftSurface, rightSurface)}px)
    `,
        }}
      />
    </div>
  );
};

export default CarImage;
