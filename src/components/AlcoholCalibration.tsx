import { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "../store/dashboard.store";

const AlcoholCalibration = () => {
  // ✅ UI override controls (NO server)
  const setUiOverride = useDashboardStore((s) => s.setUiOverride);
  const clearUiOverride = useDashboardStore((s) => s.clearUiOverride);

  // Local test inputs
  const [values, setValues] = useState({
    alcohol: "",
    front: "",
    back: "",
    left: "",
    right: "",
  });

  const timerRef = useRef<number | null>(null);

  const handleChange = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleDone = () => {
    // 🔴 Give UI test values highest priority
    setUiOverride({
      alcohol: Number(values.alcohol) / 100,
      ultrasonic: {
        front: Number(values.front),
        back: Number(values.back),
      },
      surface: {
        left: Number(values.left),
        right: Number(values.right),
      },
    });

    // ⏱ After 5 seconds, return to backend-rendered values
    timerRef.current = window.setTimeout(() => {
      clearUiOverride();
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section
      className=' md:w-[18rem] md:h-fit sm:h-[13.5rem] sm:w-[10rem] md:border-2 sm:border border-amber-300 shadow-[inset_0_0_30px_rgba(255,170,0,0.25)]
shadow-[0_0_22px_rgba(255,170,0,0.35)] rounded-md md:p-4! sm:p-2!'
    >
      <div className=''>
        <h3 className='md:text-lg sm:text-sm font-semibold text-center'>
          DashBoard Testing
        </h3>
        <p className='md:text-sm sm:text-xs text-amber-200 text-center'>
          ESP-32 Board
        </p>
      </div>

      <div className='flex-col flex md:gap-4 sm:gap-2 md:mt-2! sm:mt-1!'>
        <ul className='flex flex-col md:gap-2 sm:gap-0'>
          <li className='md:mt-0! sm:-mt-1.5!'>
            <label className='text-cyan-400 md:text-lg sm:text-[0.6rem]'>
              alcohol sensor
            </label>
            <div className='flex md:ml-5! sm:ml-2.5! items-center justify-between'>
              <p className='md:text-sm sm:text-[0.6rem]'>ALC :</p>
              <input
                type='number'
                placeholder='value'
                value={values.alcohol}
                onChange={(e) => handleChange("alcohol", e.target.value)}
                className='border border-white rounded-md md:px-2! md:py-0.5! md:w-28 text-center md:text-sm sm:px-1! sm:py-0.5! sm:w-14 sm:text-[0.5rem]'
              />
            </div>
          </li>

          <li className='sm:-mt-1.5! md:mt-0!'>
            <label className='text-cyan-400 md:text-lg sm:text-[0.6rem]'>
              ultrasonic sensor
            </label>
            <div className='flex md:ml-5! sm:ml-2.5! md:flex-col md:gap-2 sm:gap-1'>
              <div className='flex items-center justify-between'>
                <p className='md:text-sm sm:text-[0.6rem] md:block sm:hidden'>
                  Front :{" "}
                </p>
                <input
                  type='number'
                  placeholder='value'
                  value={values.front}
                  onChange={(e) => handleChange("front", e.target.value)}
                  className='border border-white rounded-md md:px-2! md:py-0.5! md:w-28 text-center md:text-sm sm:px-1! sm:py-0.5! sm:w-14 sm:text-[0.5rem]'
                />
              </div>
              <div className='flex items-center justify-between'>
                <p className='md:text-sm sm:text-[0.6rem] md:block sm:hidden'>
                  Back :{" "}
                </p>
                <input
                  type='number'
                  placeholder='value'
                  value={values.back}
                  onChange={(e) => handleChange("back", e.target.value)}
                  className='border border-white rounded-md md:px-2! md:py-0.5! md:w-28 text-center md:text-sm sm:px-1! sm:py-0.5! sm:w-14 sm:text-[0.5rem]'
                />
              </div>
            </div>
          </li>

          <li className='sm:-mt-0.5! md:mt-0!'>
            <label className='text-cyan-400 md:text-lg sm:text-[0.6rem]'>
              surface sensor
            </label>
            <div className='flex md:ml-5! sm:ml-2.5! md:flex-col md:gap-2 sm:gap-1'>
              <div className='flex items-center justify-between'>
                <p className='md:text-sm sm:text-[0.6rem] md:block sm:hidden'>
                  Left :{" "}
                </p>
                <input
                  type='number'
                  placeholder='value'
                  value={values.left}
                  onChange={(e) => handleChange("left", e.target.value)}
                  className='border border-white rounded-md md:px-2! md:py-0.5! md:w-28 text-center md:text-sm sm:px-1! sm:py-0.5! sm:w-14 sm:text-[0.5rem]'
                />
              </div>
              <div className='flex items-center justify-between'>
                <p className='md:text-sm sm:text-[0.6rem] md:block sm:hidden'>
                  Right :{" "}
                </p>
                <input
                  type='number'
                  placeholder='value'
                  value={values.right}
                  onChange={(e) => handleChange("right", e.target.value)}
                  className='border border-white rounded-md md:px-2! md:py-0.5! md:w-28 text-center md:text-sm sm:px-1! sm:py-0.5! sm:w-14 sm:text-[0.5rem]'
                />
              </div>
            </div>
          </li>
        </ul>

        <button
          onClick={handleDone}
          className='bg-amber-300 text-black md:px-2! md:py-1! sm:px-1! sm:py-0.5! rounded-md font-medium md:mt-2! sm:mt-1! md:text-lg sm:text-[0.7rem]'
        >
          Done
        </button>
      </div>
    </section>
  );
};

export default AlcoholCalibration;
