import type { FC } from "react";
import { useEffect } from "react";
import { BsExclamationTriangleFill } from "react-icons/bs";
import {
  FaRegCheckCircle,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
} from "react-icons/fa";
import { useDashboardStore } from "../store/dashboard.store";

/* ===============================
   TYPES (UI ONLY)
================================ */
type UIRequestStatus = "approved" | "pending" | "rejected";

/* ===============================
   STATUS UI CONFIG
================================ */
const statusConfig: Record<
  UIRequestStatus,
  {
    color: string;
    glow: string;
    icon: React.ReactNode;
  }
> = {
  approved: {
    color: "text-emerald-400",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.6)]",
    icon: <FaUserCheck className='md:text-[1rem] sm:text-[0.5rem]' />,
  },
  pending: {
    color: "text-amber-400",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.6)]",
    icon: <FaUserClock className='md:text-[1rem] sm:text-[0.5rem]' />,
  },
  rejected: {
    color: "text-red-400",
    glow: "shadow-[0_0_12px_rgba(248,113,113,0.6)]",
    icon: <FaUserTimes className='md:text-[1rem] sm:text-[0.5rem]' />,
  },
};

/* ===============================
   COMPONENT
================================ */
export const UserRequests: FC = () => {
  /* -------- STORE DATA -------- */
  const sensors = useDashboardStore((s) => s.uiOverrideSensors ?? s.sensors);
  const approvals = useDashboardStore((s) => s.requestApprovals);
  const askStartRequest = useDashboardStore((s) => s.askStartRequest);
  const fetchActiveRequest = useDashboardStore((s) => s.fetchActiveRequest);
  const requestedAt = useDashboardStore((s) => s.requestCreatedAt);
  const expiresAt = useDashboardStore((s) => s.requestExpiresAt);

  /* -------- ALCOHOL LOGIC -------- */
  const alcoholPercent = Math.round((sensors?.alcohol ?? 0) * 100);

  const MAX_SPEED = 100;
  const isSafe = alcoholPercent <= 30;

  const requestedTime = requestedAt
    ? new Date(requestedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  const allowedSpeed = isSafe ? MAX_SPEED : MAX_SPEED / 2;
  const statusText = isSafe ? "Safe to drive" : "Alert: Alcohol level elevated";
  const statusDesc = isSafe
    ? "Your alcohol level is within the permitted limit. Full speed access enabled."
    : "Alcohol level is at medium. Speed is restricted to ensure safety.";

  useEffect(() => {
    fetchActiveRequest();
  }, [fetchActiveRequest]);

  useEffect(() => {
    if (!expiresAt) return;

    const msLeft = new Date(expiresAt).getTime() - Date.now();

    if (msLeft <= 0) {
      fetchActiveRequest();
      return;
    }

    const t = setTimeout(() => {
      fetchActiveRequest();
    }, msLeft + 500);

    return () => clearTimeout(t);
  }, [expiresAt, fetchActiveRequest]);

  /* ===============================
     RENDER
  ================================ */
  return (
    <section
      className='sm:w-[12rem] md:h-full sm:h-[11rem] md:w-full md:border-2 sm:border border-teal-400
shadow-[inset_0_0_30px_rgba(20,184,166,0.25)]
shadow-[0_0_22px_rgba(20,184,166,0.35)]
md:p-4! sm:p-2! md:rounded-xl sm:rounded-lg'
    >
      {alcoholPercent ? (
        alcoholPercent > 70 ? (
          <>
            {/* ================= HEADER ================= */}
            <div className='md:pb-3! sm:pb-1.5! border-b border-teal-300 flex flex-col md:gap-2 sm:gap-1'>
              <h2 className='md:text-lg sm:text-xs md:tracking-wide font-semibold text-cyan-100'>
                Request to Start Car
              </h2>

              <div className='flex items-center justify-between md:gap-2 sm:gap-1'>
                <p className='w-[70%] md:text-sm sm:text-[0.6rem] md:tracking-wide text-gray-300'>
                  Alcohol value is high. Ask family members to start car
                </p>

                <button
                  onClick={() => askStartRequest(alcoholPercent)}
                  className='rounded-md bg-emerald-900 md:px-3! sm:px-1.5!
md:py-0.5! sm:py-0.5! md:text-sm sm:text-[0.7rem]
text-emerald-100 hover:bg-emerald-800 transition'
                >
                  Ask
                </button>

                <FaRegCheckCircle className='text-emerald-500 sm:text-xs md:text-lg' />
              </div>

              {requestedTime && (
                <p className='md:text-xs sm:text-[0.55rem] text-gray-400'>
                  Requested at: {requestedTime}
                </p>
              )}
            </div>

            {/* ================= REQUEST LIST ================= */}
            <div className='flex flex-col md:gap-3 md:mt-4! sm:gap-1 sm:mt-1!'>
              {approvals.map((req) => {
                const uiStatus = req.status.toLowerCase() as UIRequestStatus;
                const status = statusConfig[uiStatus];

                return (
                  <div
                    key={req.memberId}
                    className='flex items-center justify-between md:rounded-xl sm:rounded-lg
border border-white/5 bg-[#11161c]
md:px-4! md:py-1! sm:px-2! sm:py-0.5!'
                  >
                    {/* USER INFO */}
                    <div className='flex items-center md:gap-3 sm:gap-1'>
                      <div
                        className={`flex md:h-8 md:w-8 sm:h-4 sm:w-4
items-center justify-center rounded-full bg-[#0b0f14]
${status.color} ${status.glow}`}
                      >
                        {status.icon}
                      </div>

                      <div>
                        <p className='md:text-sm sm:text-[0.6rem] text-white'>
                          {req.name}
                        </p>
                        <p className='md:text-[0.75rem] sm:text-[0.5rem] text-slate-400'>
                          {req.relation}
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className='flex flex-col items-end'>
                      <span
                        className={`md:text-[0.7rem] sm:text-[0.5rem]
font-semibold md:tracking-widest ${status.color}`}
                      >
                        {uiStatus.toUpperCase()}
                      </span>

                      {req.decidedAt && (
                        <span className='md:text-[0.65rem] sm:text-[0.45rem] text-slate-400'>
                          {new Date(req.decidedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* ================= SAFE / LIMITED MODE ================= */
          <div className='flex flex-col justify-center items-center h-full md:px-2! sm:px-1! text-center!'>
            {alcoholPercent > 30 && (
              <BsExclamationTriangleFill className='text-amber-400 mb-3! md:text-[2rem] sm:text-[1rem]' />
            )}

            <p
              className={`md:text-lg sm:text-[0.6rem] font-semibold ${
                isSafe ? "text-green-400" : "text-amber-400"
              }`}
            >
              {statusText}
            </p>

            <p className='md:text-sm sm:text-[0.5rem] font-medium text-gray-400 md:mt-2! sm:mt-1!'>
              {statusDesc}
            </p>

            <p className='md:mt-4! sm:mt-2! md:text-lg sm:text-[0.7rem] font-semibold text-blue-600'>
              Allowed Speed: {allowedSpeed} km/h
            </p>
          </div>
        )
      ) : (
        /* ================= NO SENSOR ================= */
        <div className='flex flex-col justify-center items-center h-full'>
          <BsExclamationTriangleFill className='text-red-600 md:text-[2rem] sm:text-[1rem]' />
          <p className='md:text-[1rem] sm:text-[0.6rem] font-medium mt-2! text-red-600'>
            connect/check the Alcohol sensor
          </p>
        </div>
      )}
    </section>
  );
};
