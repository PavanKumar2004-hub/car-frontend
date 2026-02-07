import { FiLogOut } from "react-icons/fi";

import { GoPersonAdd } from "react-icons/go";
import logo from "../assets/gojura.jpg";
import { useDashboardStore, type ContextRole } from "../store/dashboard.store";

import { useState } from "react";
import { IoCarSportOutline } from "react-icons/io5";
import { RxEnterFullScreen, RxExitFullScreen } from "react-icons/rx";
import { MembersListModal } from "./MemberModal";
import { VehicleManagerModal } from "./VehicleManagerModal";

const TopBar = ({ contextRole }: { contextRole: ContextRole | null }) => {
  const user = useDashboardStore((s) => s.user);
  const logout = useDashboardStore((s) => s.logout);
  const { activeVehicle } = useDashboardStore();
  const [open, setOpen] = useState(false);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [openvehicle, setOpenVehicle] = useState(false);

  interface FullscreenHTMLElement extends HTMLElement {
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  }

  const goFullscreen = () => {
    const el = document.documentElement as FullscreenHTMLElement;

    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
    setIsFullScreen(true);
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <section className='border-b border-teal-200 w-screen'>
      <header className='flex items-center justify-between md:px-4! md:py-2! sm:px-2! sm:py-1!'>
        <div className='flex items-center md:gap-4 sm:gap-2 md:text-sm sm:text-xs'>
          <p className=''>Alocohol, Accident and FoothPath Prevention System</p>
          <p className=''>(Batch - 09)</p>
        </div>

        <div className=''>
          <p className=''>
            <span>vechile model : </span>
            {activeVehicle?.name}
            {activeVehicle?.plateNumber ? ` (${activeVehicle.plateNumber})` : ""}
          </p>
        </div>

        <div className='flex items-center md:gap-6 sm:gap-3'>
          {contextRole === "OWNER" && (
            <button onClick={() => setOpenVehicle(true)}>
              <IoCarSportOutline size={22} className='text-cyan-400' />
            </button>
          )}
          {contextRole !== "FRIEND" && (
            <button>
              <GoPersonAdd
                className='text-teal-500'
                size={22}
                onClick={() => setOpen(true)}
              />
            </button>
          )}
          {/* {contextRole !== "FRIEND" && (
            <button className='flex items-center gap-2 bg-teal-700 px-2! py-1! md:text-sm sm:text-xs rounded-lg'>
              <BiDownload size={18} />
              <span className='md:text-sm sm:text-xs'>Last Reports</span>
            </button>
          )} */}
          <div className='flex items-center gap-3'>
            <p className='md:text-sm sm:text-xs'>
              Hello, <span>{user?.name}</span>
            </p>
            <div className='rounded-full w-8 h-8 bg-white overflow-hidden border-2 border-teal-400'>
              <img src={logo} alt='logo' />
            </div>
            <button>
              <FiLogOut className='text-red-500' onClick={logout} size={20} />
            </button>

            {isFullScreen ? (
              <button onClick={exitFullscreen}>
                <RxExitFullScreen size={22} />
              </button>
            ) : (
              <button onClick={goFullscreen}>
                <RxEnterFullScreen size={22} />
              </button>
            )}
          </div>
        </div>
      </header>
      <MembersListModal open={open} onClose={() => setOpen(false)} />

      {openvehicle && (
        <VehicleManagerModal onClose={() => setOpenVehicle(false)} />
      )}
    </section>
  );
};

export default TopBar;
