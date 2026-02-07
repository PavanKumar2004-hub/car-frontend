import { useDashboardStore, type ContextRole } from "../store/dashboard.store";

export default function SpeedMeter() {
  const sensors = useDashboardStore((s) => s.uiOverrideSensors ?? s.sensors);
  const approvals = useDashboardStore((s) => s.requestApprovals);
  const { contextRole }: { contextRole: ContextRole | null } =
    useDashboardStore();

  const alcoholPercent = Math.round((sensors?.alcohol ?? 0) * 100);
  const speed = sensors?.speed ?? 0;

  const rotation = (speed / 106) * 180 - 179;

  /* ===============================
     APPROVAL LOGIC (TEXT ONLY)
  ================================ */
  const approvedBy = approvals.find((a) => a.status === "APPROVED");
  const allRejected =
    approvals.length > 0 && approvals.every((a) => a.status === "REJECTED");
  // const pendingApproval = approvals.some((a) => a.status === "PENDING");

  let statusText: string | null = null;
  let statusClass = "border-amber-400 text-amber-400 bg-amber-400/10";

  if (approvedBy) {
    statusText = "Family Control Mode : 30 km/h";
    statusClass = "border-emerald-400 text-emerald-400 bg-emerald-400/10";
  } else if (allRejected) {
    statusText = "Rejected – Car Locked";
    statusClass = "border-red-500 text-red-500 bg-red-400/10";
  } else if (alcoholPercent > 30 && alcoholPercent <= 70) {
    statusText = "Alcohol is elevated";
  } else if (alcoholPercent > 70) {
    statusText = "Alcohol level is high";
    statusClass = "border-red-500 text-red-500 bg-red-400/10";
  }

  return (
    <div className='md:w-[20rem] sm:w-[11rem] md:h-[14rem] sm:h-[7rem] bg-black md:rounded-xl sm:rounded-lg flex flex-col items-center justify-center overflow-hidden md:border-2 sm:border border-red-500 shadow-[inset_0_0_30px_rgba(255,77,77,0.25)] shadow-[0_0_22px_rgba(255,77,77,0.4)]'>
      {/* ===== STATUS TEXT (PLAIN) ===== */}
      {statusText && contextRole !== "FRIEND" && (
        <span
          className={`border md:px-2! md:py-0.5! md:text-xs sm:px-1! sm:py-0.5! sm:text-[0.5rem] rounded-lg font-medium md:mt-2! sm:mt-1! ${statusClass}`}
        >
          {statusText}
        </span>
      )}

      <div className='relative! w-full h-full '>
        {/* ===== ARC BACKGROUND ===== */}
        <div
          className='absolute inset-0 rounded-t-full
          bg-[conic-gradient(
            from_180deg,
            #22c55e_0deg,
            #22c55e_45deg,
            #ffffff_90deg,
            #ef4444_150deg,
            #ef4444_180deg
          )]
          [mask-image:radial-gradient(transparent_58%,black_60%,black_72%,transparent_74%)]
          [-webkit-mask-image:radial-gradient(transparent_58%,black_60%,black_72%,transparent_74%)]
        '
        />

        {/* ===== TICKS ===== */}
        <div className='absolute inset-0 rounded-full'>
          {[...Array(56)].map((_, i) => {
            const deg = (i / 60) * 180 - 172;
            const isMajor = i % 5 === 0;
            return (
              <div
                key={i}
                className='absolute top-1/2 left-1/2 translate-x-1/2 translate-y-1/2 md:mt-16! sm:mt-8! origin-left'
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div
                  className={`${
                    isMajor
                      ? "bg-red-500 md:w-[4px] sm:w-[2px]"
                      : "bg-green-500 md:w-[2px] sm:w-[1px]"
                  } md:h-[8px] sm:h-[2px] md:translate-x-[150px] translate-x-[72px]`}
                />
              </div>
            );
          })}
        </div>

        {/* ===== SPEED NUMBERS ===== */}
        {[0, 20, 40, 60, 80, 100].map((v) => {
          const deg = (v / 120) * 180 - 165;
          return (
            <div
              key={v}
              className='absolute top-1/2 left-[46%] md:mt-16! sm:mt-8! text-white md:text-sm sm:text-[0.6rem] transform sm:[--r:65px] md:[--r:120px]'
              style={{
                transform: `rotate(${deg}deg) translate(var(--r)) rotate(${-deg}deg)`,
              }}
            >
              {v}
            </div>
          );
        })}

        {/* ===== NEEDLE ===== */}
        <div
          className='absolute top-1/2 left-1/2 md:w-[140px] sm:w-[60px] md:mt-14! sm:mt-7! md:h-[2px] sm:h-[1.5px]
                     bg-red-500 origin-left
                     shadow-[0_0_12px_rgba(239,68,68,0.9)]'
          style={{ transform: `rotate(${rotation}deg)` }}
        />

        {/* ===== CENTER SPEED ===== */}
        <div className='absolute inset-0 flex flex-col items-center justify-center md:mt-18! sm:mt-9!'>
          <div
            className='md:text-[64px] sm:text-[32px] font-extrabold font-mono
                       text-cyan-400
                       drop-shadow-[0_0_20px_rgba(34,211,238,1)]
                       [text-shadow:0_0_10px_rgba(34,211,238,0.8)]'
          >
            {speed.toFixed(0)}
          </div>
          <div className='text-cyan-300 md:text-sm sm:text-xs md:-mt-6! sm:-mt-3!'>
            km/hr
          </div>
        </div>
      </div>
    </div>
  );
}
