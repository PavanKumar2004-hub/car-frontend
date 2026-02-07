import { useEffect, useState } from "react";
import { BsExclamationTriangleFill } from "react-icons/bs";
import { useDashboardStore } from "../store/dashboard.store";
import type { AccelSample, AccelStatus } from "../types/vehicle";

const MAX_POINTS = 30;

export default function AccelerometerMonitor() {
  const sensors = useDashboardStore((s) => s.sensors);

  const [data, setData] = useState<AccelSample[]>([]);
  const [status, setStatus] = useState<AccelStatus>("__");

  useEffect(() => {
    if (!sensors?.accel) return;

    const interval = setInterval(() => {
      const { x, y, z } = sensors.accel;

      // ✅ Ensure valid numbers
      if (
        typeof x !== "number" ||
        typeof y !== "number" ||
        typeof z !== "number"
      ) {
        return;
      }

      const sample: AccelSample = {
        x,
        y,
        z,
        time: Date.now(),
      };

      setData((prev) => [...prev.slice(-MAX_POINTS), sample]);

      const mag = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      if (mag) {
        if (mag > 14) setStatus("IMPACT");
        else if (mag > 11) setStatus("WARNING");
        else if (mag < 11) setStatus("NORMAL");
      } else setStatus("__");
    }, 500);

    return () => clearInterval(interval);
  }, [sensors]);
  const latest = data[data.length - 1];

  return (
    <div
      className='md:w-[20rem] sm:w-[11rem] md:h-[14rem] sm:h-[8rem] md:p-3! sm:p-1! md:rounded-xl sm:rounded-lg md:border-2 sm:border border-purple-400 shadow-[inset_0_0_30px_rgba(168,85,247,0.25)]
shadow-[0_0_22px_rgba(168,85,247,0.4)] overflow-hidden
'
    >
      {/* Header */}
      <div className='flex justify-between items-center md:mb-2! sm:mb-0.5!'>
        <h3 className='text-white md:text-sm sm:text-[0.6rem] md:tracking-wide'>
          Accelerometer (X · Y · Z)
        </h3>
        <StatusLabel status={status} />
      </div>

      {sensors?.accel ? (
        <>
          {/* Values */}
          {latest && (
            <div className='grid grid-cols-3 md:gap-3 sm:gap-1 md:mb-2! sm:mb-0.5!'>
              <AxisValue label='X' value={latest.x} color='red' />
              <AxisValue label='Y' value={latest.y} color='yellow' />
              <AxisValue label='Z' value={latest.z} color='cyan' />
            </div>
          )}

          {/* Graph */}
          <XYZGraph data={data} />
        </>
      ) : (
        <div className='flex flex-col justify-center items-center h-full'>
          <BsExclamationTriangleFill className='text-red-600 md:text-[1.5rem] sm:text-[1rem]' />
          <p className='md:text-[1rem] sm:text-[0.6rem] font-medium  text-red-600'>
            connect/check the Accelerometer
          </p>
        </div>
      )}
    </div>
  );
}

function XYZGraph({ data }: { data: AccelSample[] }) {
  const width = 280;
  const height = 80;

  const scaleY = (val: number) => height - ((val + 2) / 22) * height;

  const buildPoints = (key: "x" | "y" | "z") =>
    data.map((d, i) => {
      const x = (i / (MAX_POINTS - 1)) * width;
      const y = scaleY(d[key]);
      return `${x},${y}`;
    });

  return (
    <svg width={width} height={height}>
      <Polyline points={buildPoints("x")} color='#ef4444' />
      <Polyline points={buildPoints("y")} color='#eab308' />
      <Polyline points={buildPoints("z")} color='#22d3ee' />
    </svg>
  );
}

function Polyline({ points, color }: { points: string[]; color: string }) {
  return (
    <polyline
      fill='none'
      stroke={color}
      strokeWidth='2'
      points={points.join(" ")}
      style={{
        filter: `drop-shadow(0 0 6px ${color})`,
      }}
    />
  );
}

function AxisValue({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "red" | "yellow" | "cyan";
}) {
  const colorMap = {
    red: "text-red-400",
    yellow: "text-yellow-400",
    cyan: "text-cyan-400",
  };

  return (
    <div className='bg-black/60 rounded-lg p-1! text-center'>
      <p className='text-gray-400 md:text-xs sm:text-[0.5rem]'>{label}-axis</p>
      <p className={`font-mono md:text-lg sm:text-[0.7rem] ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  );
}

function StatusLabel({ status }: { status: AccelStatus }) {
  const map: Record<AccelStatus, string> = {
    NORMAL: "text-green-400",
    WARNING: "text-yellow-400",
    IMPACT: "text-red-500",
    __: "text-red-500",
  };

  return (
    <span
      className={`md:text-xs sm:text-[0.5rem] font-semibold ${map[status]}`}
    >
      {status}
    </span>
  );
}
