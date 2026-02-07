import { useEffect, useState } from "react";
import AccelerometerMonitor from "../components/AccelerometerMonitor";
import AccidentAlertModal from "../components/AccidentAlertModal";
import AlcoholCalibration from "../components/AlcoholCalibration";
import AlcoholMeter from "../components/AlcoholMeter";
import CarImage from "../components/CarImage";
import { MemberDecisionPanel } from "../components/MemberDecisionPanel";
import ReadOnly from "../components/ReadOnly";
import SensorStatus from "../components/SensorStatus";
import SpeedMeter from "../components/SpeedMeter";
import TopBar from "../components/TopBar";

import { UserRequests } from "../components/UserRequests";
import { MapView } from "../features/map/MapView";
import { useDashboardStore, type ContextRole } from "../store/dashboard.store";
import { tone } from "../utils/tone";

const Dashboard = () => {
  const { contextRole }: { contextRole: ContextRole | null } =
    useDashboardStore();
  const sensors = useDashboardStore((s) => s.sensors);
  const [status, setStatus] = useState(false);

  useEffect(() => {
    if (!sensors?.accel) return;
    const { x, y, z } = sensors.accel;
    const mag = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    if (mag) {
      if (mag > 14) setStatus(true);
      else if (mag < 11) setStatus(false);
    } else setStatus(false);
    if (mag > 14) {
      tone.unlock();
      tone.accidentStart();
      tone.unmute();
      tone.setVolume(1);
    } else {
      tone.unlock();
      tone.accidentStop();
    }
  }, [sensors?.accel]);

  return (
    <section className=''>
      <TopBar contextRole={contextRole} />
      <div
        className={`grid ${contextRole !== "FRIEND" ? "w-[96%] " : "w-[72%] "} mx-auto! md:mt-4! sm:mt-2! md:gap-4 sm:gap-2
        ${contextRole !== "FRIEND" ? "md:grid-cols-[20rem_18rem_20rem_20rem] sm:grid-cols-[11rem_10rem_12rem_11rem]" : "md:grid-cols-[20rem_20rem_20rem] sm:grid-cols-[11rem_12rem_11rem]"}`}
      >
        <div className='grid grid-rows-[1fr] md:gap-6 sm:gap-3'>
          <CarImage />
          <SpeedMeter />
        </div>
        {contextRole !== "FRIEND" && (
          <div className='grid grid-rows-[1fr] md:gap-4 sm:gap-2'>
            <AlcoholCalibration />
            <AlcoholMeter />
          </div>
        )}

        <div className='grid grid-rows-[1fr] md:gap-4 sm:gap-2'>
          {contextRole === "OWNER" && <UserRequests />}
          {contextRole === "FAMILY" && <MemberDecisionPanel />}
          {contextRole === "FRIEND" && <ReadOnly />}

          <SensorStatus />
        </div>

        <div className='grid md:grid-rows-[14rem_20.5rem] sm:grid-rows-[8rem_10.5rem] md:gap-4 sm:gap-2'>
          <AccelerometerMonitor />

          {contextRole !== "FRIEND" ? (
            <MapView />
          ) : (
            <div className='md:w-[20rem] md:h-[20rem] sm:h-[13.5rem] sm:w-[10rem] md:border-2 sm:border border-amber-300 shadow-[inset_0_0_30px_rgba(255,170,0,0.25)] shadow-[0_0_22px_rgba(255,170,0,0.35)] rounded-md md:p-4! sm:p-2! flex flex-col items-center gap-5  text-center'>
              <h3 className='text-lg font-semibold tracking-wider'>
                Emergency-Only Location Sharing
              </h3>
              <p className='text-sm'>
                To protect the driver’s privacy, you cannot view the vehicle’s
                live location during normal operation.
              </p>
              <p className='text-sm text-red-500'>
                If an accident occurs, the system will automatically reveal the
                location so you can provide help quickly.
              </p>
            </div>
          )}
        </div>
      </div>
      <AccidentAlertModal
        open={status}
        onClose={() => setStatus(false)}
        MapComponent={<MapView />}
      />
    </section>
  );
};

export default Dashboard;
