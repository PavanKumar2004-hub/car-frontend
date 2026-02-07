import React, { useEffect } from "react";
import { useDashboardStore } from "../store/dashboard.store";

type Props = {
  open: boolean;
  onClose: () => void;
  MapComponent: React.ReactNode;
};

//--------------------------------------------------------------

/* ======================================================
   DARK ACCIDENT MODAL
====================================================== */
const AccidentAlertModalDark: React.FC<Props> = ({
  open,
  onClose,
  MapComponent,
}) => {
  if (!open) return null;

  const loadUser = useDashboardStore((s) => s.loadUser);
  const loadContextRole = useDashboardStore((s) => s.loadContextRole);

  const { members, fetchMembers, owner, activeVehicle } = useDashboardStore();
  const sensors = useDashboardStore((s) => s.uiOverrideSensors ?? s.sensors);
  const lat = sensors?.location?.lat ?? 0;
  const lng = sensors?.location?.lng ?? 0;

  useEffect(() => {
    if (open) fetchMembers();
    // 2. Load authenticated user
    try {
      loadUser();
      loadContextRole();
    } catch (err) {
      console.log(err);
    }

    // 3. Resolve dashboard role (OWNER / FAMILY / FRIEND)
  }, [open]);
  console.log("owner", owner);

  const severity = "HIGH";

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md'>
      {/* MAIN CARD */}
      <div className='w-[95%] max-w-[60.5rem] bg-zinc-900 text-zinc-100 grid grid-rows-1 lg:grid-rows-[24rem_12rem] overflow-hidden border-2 rounded-lg border-red-500 shadow-[inset_0_0_40px_rgba(255,77,77,0.25)] shadow-[0_0_22px_rgba(255,77,77,0.4)] z-50!'>
        {/* ================= LEFT PANEL ================= */}
        <div className='grid grid-cols-[40rem_20rem]'>
          <div className='py-3! px-6! overflow-y-auto'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4!'>
              <div>
                <h2 className='text-xl font-bold text-red-500 animate-pulse'>
                  🚨 Accident Detected
                </h2>
                <p className='text-xs text-zinc-400'>Detected at {""}</p>
              </div>

              <button
                onClick={onClose}
                className='px-3! py-1! text-sm bg-red-800 hover:bg-zinc-700 rounded-lg'
              >
                Close
              </button>
            </div>

            {/* Severity Badge */}
            <div className='mb-4!'>
              <span
                className={`px-3! py-1! text-xs font-semibold rounded-full
                ${
                  severity === "HIGH"
                    ? "bg-red-600/20 text-red-400 border border-red-600"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500"
                }`}
              >
                Severity: {severity}
              </span>
            </div>

            <Section title='Driver Information'>
              <Info label='Name' value={owner?.name} />
              <Info label='Phone' value={owner?.phone} />
            </Section>

            <Section title='Vehicle Details'>
              <Info label='Model' value={activeVehicle?.name} />
              <Info label='Number' value={activeVehicle?.plateNumber} />
            </Section>

            <Section title='Location'>
              <Info label='Latitude' value={lat} />
              <Info label='Longitude' value={lng} />
            </Section>
          </div>

          {/* ================= RIGHT PANEL (MAP) ================= */}
          <div className='bg-black border-l border-zinc-800 h-[400px] lg:h-auto'>
            {MapComponent}
          </div>
        </div>
        {/* Contacts */}
        <div className=' py-3! px-6!'>
          <h3 className='text-lg font-semibold mb-1!'>Emergency Contacts</h3>

          <div className='grid grid-cols-3 overflow-auto gap-2'>
            {members.map((m) => (
              <div
                key={m._id}
                className='flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 transition px-3! py-1.5! rounded-xl'
              >
                <div>
                  <p className='font-medium'>{m.userId.name}</p>
                  <p className='text-xs text-zinc-400'>{m.relation}</p>
                </div>

                <a
                  href={`tel:${m.userId.phone}`}
                  className='text-blue-400 font-semibold'
                >
                  +91 {m.userId.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   SMALL HELPERS
====================================================== */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className='mb-2!'>
    <h3 className='text-sm font-semibold mb-1! text-zinc-300'>{title}</h3>
    <div className='grid grid-cols-2 gap-2'>{children}</div>
  </div>
);

const Info: React.FC<{
  label: string;
  value: any;
  danger?: boolean;
}> = ({ label, value, danger }) => (
  <div
    className={`rounded-xl px-4! py-1.5! border
      ${
        danger
          ? "bg-red-900/30 border-red-700 text-red-300"
          : "bg-zinc-800 border-zinc-700"
      }`}
  >
    <p className='text-xs text-zinc-400'>{label}</p>
    <p className='font-semibold'>{value}</p>
  </div>
);

export default AccidentAlertModalDark;
