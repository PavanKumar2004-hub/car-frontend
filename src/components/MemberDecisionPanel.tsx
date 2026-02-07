import type { FC } from "react";
import { useEffect, useState } from "react";
import { BsExclamationTriangleFill } from "react-icons/bs";
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTimesCircle,
} from "react-icons/fa";
import { useDashboardStore } from "../store/dashboard.store";

/* ===============================
   TYPES
================================ */
type Decision = "approved" | "rejected";

/* ===============================
   COMPONENT
================================ */
export const MemberDecisionPanel: FC = () => {
  /* -------- STORE -------- */
  const sensors = useDashboardStore((s) => s.uiOverrideSensors ?? s.sensors);
  const approvals = useDashboardStore((s) => s.requestApprovals);
  const activeRequestId = useDashboardStore((s) => s.activeRequestId);
  const user = useDashboardStore((s) => s.user);
  const fetchActiveRequest = useDashboardStore((s) => s.fetchActiveRequest);
  const requestedAt = useDashboardStore((s) => s.requestCreatedAt);
  const expiresAt = useDashboardStore((s) => s.requestExpiresAt);

  const formatTime = (value: string | null | undefined) => {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const time = requestedAt
    ? new Date(requestedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "--";

  /* -------- LOCAL STATE -------- */
  const [confirm, setConfirm] = useState<{
    memberId: string;
    action: Decision;
  } | null>(null);

  /* -------- SENSOR DATA -------- */
  const alcoholLevel = useDashboardStore((s) => s.requestAlcoholLevel);
  const alcoholPercent = Math.round(alcoholLevel ?? 0);

  const location = sensors?.location ?? {
    lat: 16.8628,
    lng: 81.927,
  };

  /* ===============================
     DERIVED STATE
  ================================ */
  const myApproval = approvals.find((a) => a.userId === user?._id);
  const approvedBy = approvals.find((a) => a.status === "APPROVED");
  const rejectedByOthers = approvals.filter(
    (a) => a.status === "REJECTED" && a.userId !== user?._id
  );

  /* -------- SUBMIT DECISION -------- */
  const handleDecision = async (memberId: string, action: Decision) => {
    if (!activeRequestId) return;

    await fetch("https://car-backend-onkl.onrender.com/api/requests/decision", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        requestId: activeRequestId,
        memberId,
        decision: action.toUpperCase(),
      }),
    });

    setConfirm(null);
  };

  useEffect(() => {
    fetchActiveRequest(); // always load on mount
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

  if (!myApproval) {
    return (
      <section
        className='sm:w-[12rem] md:h-full sm:h-[11rem] md:w-full md:border-2 sm:border border-teal-400
shadow-[inset_0_0_30px_rgba(20,184,166,0.25)]
shadow-[0_0_22px_rgba(20,184,166,0.35)]
md:p-4! sm:p-2! md:rounded-xl sm:rounded-lg flex flex-col items-center justify-center'
      >
        <p>No requests are there</p>
        <p>Waiting for request...</p>
      </section>
    );
  }

  const canAct = myApproval.status === "PENDING" && !approvedBy;
  return (
    <section
      className='sm:w-[12rem] md:h-full sm:h-[11rem] md:w-full md:border-2 sm:border border-teal-400
shadow-[inset_0_0_30px_rgba(20,184,166,0.25)]
shadow-[0_0_22px_rgba(20,184,166,0.35)]
md:p-4! sm:p-2! md:rounded-xl sm:rounded-lg'
    >
      {/* ================= HEADER ================= */}
      <div className='md:mb-4! sm:mb-2! border-b border-red-400/40 md:pb-3! sm:pb-1!'>
        <h2 className='md:text-lg sm:text-xs text-center font-semibold text-red-500'>
          Car Start Authorization
        </h2>

        <div className='md:mt-2! sm:mt-1! flex items-baseline md:gap-2 sm:gap-1 md:text-sm sm:text-[0.6rem] text-gray-300'>
          <BsExclamationTriangleFill className='text-red-400' />
          Alcohol level is high. Driver requests permission.
        </div>
      </div>

      {/* ================= LIVE DATA ================= */}
      <div className='md:mb-4! sm:mb-0! rounded-lg bg-[#11161c] md:p-3! sm:p-1!'>
        <div className='flex items-center justify-between'>
          <p className='md:text-sm sm:text-[0.6rem] text-gray-400'>
            Alcohol Level:{" "}
            <span className='font-semibold text-red-400'>
              {alcoholPercent}%
            </span>
          </p>
          <p className='md:text-xs sm:text-[0.5rem] text-gray-400'>
            Requested at: {time}
          </p>
        </div>
        <p className='md:mt-1! sm:mt-0! flex items-center gap-1 md:text-sm sm:text-[0.6rem] text-gray-400'>
          <FaMapMarkerAlt className='text-cyan-400 md:text-[0.8rem] sm:text-[0.4rem]' />
          {location.lat}, {location.lng}
        </p>
      </div>

      <div className='hide-scrollbar h-[7rem]'>
        {/* ================= OTHERS STATUS (TEXT ONLY) ================= */}
        <div className='md:mt-3! sm:mt-2! space-y-1 '>
          {approvedBy && approvedBy.userId !== user?._id && (
            <p className='md:text-sm sm:text-[0.6rem] text-emerald-400 font-medium'>
              Approved by {approvedBy.name} at{" "}
              {formatTime(approvedBy.decidedAt)}
            </p>
          )}

          {!approvedBy &&
            rejectedByOthers.map((r) => (
              <p
                key={r.memberId}
                className='md:text-sm sm:text-[0.6rem] text-red-400'
              >
                Rejected by {r.name} at {formatTime(r.decidedAt)}
              </p>
            ))}
        </div>

        {/* ================= MY CARD ================= */}
        <div className='md:mt-4! sm:mt-2! md:rounded-xl sm:rounded-lg border border-white/10 bg-[#11161c] md:p-3! sm:pt-1.5!'>
          <div className='flex justify-between'>
            <p className='md:text-sm sm:text-[0.7rem] text-white'>
              Your Decision
            </p>

            <div className='flex flex-col items-end'>
              <span
                className={`md:text-xs sm:text-[0.5rem] font-semibold md:tracking-widest ${
                  myApproval.status === "PENDING"
                    ? "text-amber-400"
                    : myApproval.status === "APPROVED"
                      ? "text-emerald-400"
                      : "text-red-400"
                }`}
              >
                {myApproval.status}
              </span>

              {myApproval.decidedAt && (
                <span className='md:text-[0.65rem] sm:text-[0.45rem] text-slate-400'>
                  {formatTime(myApproval.decidedAt)}
                </span>
              )}
            </div>
          </div>

          {/* ================= ACTIONS ================= */}
          <div className='md:mt-3! sm:mt-1! flex md:gap-2 sm:gap-1'>
            {canAct && (
              <>
                <button
                  onClick={() =>
                    setConfirm({
                      memberId: myApproval.memberId,
                      action: "approved",
                    })
                  }
                  className='flex flex-1 items-center justify-center gap-1 rounded-md bg-emerald-700
md:py-1.5! sm:py-0.5! md:text-sm sm:text-[0.6rem]
text-emerald-100 hover:bg-emerald-800'
                >
                  <FaCheckCircle /> Accept
                </button>

                <button
                  onClick={() =>
                    setConfirm({
                      memberId: myApproval.memberId,
                      action: "rejected",
                    })
                  }
                  className='flex flex-1 items-center justify-center gap-1 rounded-md bg-red-700
md:py-1.5! sm:py-0.5! md:text-sm sm:text-[0.6rem]
text-red-100 hover:bg-red-800'
                >
                  <FaTimesCircle /> Reject
                </button>
              </>
            )}

            {/* 📞 CALL — ONLY FOR LOGGED-IN MEMBER */}
            <button
              onClick={() => window.open("tel:+910000000000")}
              className='rounded-md bg-cyan-900 px-3!
md:py-1.5! sm:py-0.5! md:text-sm sm:text-[0.6rem]
text-cyan-100 hover:bg-cyan-800'
            >
              <FaPhoneAlt />
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      {confirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
          <div className='w-[90%] max-w-sm rounded-xl bg-[#0b0f14] p-4! text-center shadow-xl'>
            <p className='text-sm text-gray-300'>
              {confirm.action === "approved"
                ? "Allow car to start with speed limit (40 km/h)?"
                : "Reject request and keep vehicle stopped?"}
            </p>

            <div className='mt-4! flex gap-3'>
              <button
                onClick={() => handleDecision(confirm.memberId, confirm.action)}
                className='flex-1 rounded-md bg-emerald-700 py-1.5! text-white'
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirm(null)}
                className='flex-1 rounded-md bg-gray-700 py-1.5! text-white'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
