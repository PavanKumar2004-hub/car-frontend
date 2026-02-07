import { useDashboardStore } from "../store/dashboard.store";

type AlcoholStatusColor = "green" | "yellow" | "red";

export default function AlcoholMeter() {
  const sensors = useDashboardStore((s) => s.uiOverrideSensors ?? s.sensors);
  // const alcStatus = useDashboardStore((s) => s.sensorStatus);
  const alcoholPercent = Math.round(sensors?.alcohol * 100);
  // console.log(sensors);

  // const percentage = Math.min((value / max) * 100, 100);

  const getStatus = (): { label: string; color: AlcoholStatusColor } => {
    if (alcoholPercent <= 30) return { label: "SAFE", color: "green" };
    if (alcoholPercent <= 70) return { label: "WARNING", color: "yellow" };
    if (alcoholPercent > 70) return { label: "DANGER", color: "red" };
    return { label: "not connected", color: "red" };
  };

  const status = getStatus();

  const colorMap = {
    green: "from-green-400 to-green-500 shadow-[0_0_16px_rgba(34,197,94,0.9)]",
    yellow:
      "from-yellow-400 to-yellow-500 shadow-[0_0_16px_rgba(234,179,8,0.9)]",
    red: "from-red-500 to-red-600 shadow-[0_0_18px_rgba(239,68,68,1)]",
  };

  return (
    <div
      className={`md:w-[18rem] sm:w-[10rem] md:p-5! sm:p-2.5! md:rounded-xl sm:rounded-lg md:border-2 sm:border border-emerald-400 rounded-md shadow-[inset_0_0_20px_rgba(0,255,156,0.25)] shadow-[0_0_30px_rgba(0,255,156,0.35)] md:h-[9rem] sm:h-[4.5rem]`}
    >
      {/* Title */}
      <div className='flex justify-between items-center md:mb-3! sm:mb-1.5!'>
        <h3 className='text-white md:text-sm sm:text-[0.6rem] md:tracking-wide'>
          Alcohol Level
        </h3>
        <span
          className={`md:text-xs sm:text-[0.4rem] font-semibold border md:px-2! md:py-0.5! sm:px-1! sm:py-0! rounded-lg ${
            status.color === "green"
              ? " text-green-500 border-green-500"
              : status.color === "yellow"
                ? " text-yellow-400 border-yellow-500"
                : " text-red-600 border-red-600"
          }`}
        >
          {status.label}
        </span>
      </div>

      {/* Meter Track */}
      <div className='relative md:h-4 sm:h-2 rounded-full bg-[#1c1c1c] overflow-hidden'>
        {/* Zone background */}
        <div className='absolute inset-0 flex'>
          <div className='w-[40%] bg-green-500/20' />
          <div className='w-[30%] bg-yellow-400/20' />
          <div className='w-[30%] bg-red-500/20' />
        </div>

        {/* Fill */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full
                      bg-gradient-to-r ${colorMap[status.color]}
                      transition-all duration-500 ease-out`}
          style={{ width: `${alcoholPercent || 0}%` }}
        />
      </div>

      {/* Reading */}
      <div className='md:mt-3! sm:mt-1.5! flex justify-between items-center'>
        <p className='text-gray-400 md:text-xs sm:text-[0.5rem]'>Reading</p>
        <p
          className={`md:text-lg sm:text-xs font-mono font-bold ${
            status.color === "green"
              ? "text-green-400"
              : status.color === "yellow"
                ? "text-yellow-400"
                : "text-red-500"
          }`}
        >
          {alcoholPercent || "-- "}%
        </p>
      </div>
    </div>
  );
}
