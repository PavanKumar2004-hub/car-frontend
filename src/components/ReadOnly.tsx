const ReadOnly = () => {
  return (
    <div
      className='sm:w-[12rem] md:h-full sm:h-[11rem] md:w-full md:rounded-xl sm:rounded-lg md:border-2 sm:border border-teal-400 shadow-[inset_0_0_30px_rgba(20,184,166,0.25)]
shadow-[0_0_22px_rgba(20,184,166,0.35)] md:p-4! sm:p-2! relative overflow-hidden'
    >
      <div className='flex flex-col justify-center h-full md:mt-0! sm:mt-1!'>
        <h3 className='md:text-lg sm:text-sm font-semibold text-cyan-400'>
          View-Only Access
        </h3>
        <p className='md:text-sm sm:text-[0.7rem] text-gray-300 md:mt-3! sm:mt-1!'>
          You are added as a friend. You can monitor vehicle status but cannot
          request or approve actions.
        </p>
        <span className='absolute top-2 right-2 text-xs font-medium md:px-2! md:py-0.5! sm:px-2! sm:py-0.5! md:text-sm sm:text-[0.5rem] rounded border border-orange-500 text-orange-500'>
          Friend · View Only
        </span>
        <div className='md:text-sm sm:text-[0.6rem] text-blue-400 italic md:mt-2! sm:mt-1!'>
          Action controls are disabled for your role
        </div>
        <p className='md:mt-5! sm:mt-2! md:text-sm sm:text-[0.6rem]'>
          Only <span className='text-red-600 font-bold'>Accident</span>{" "}
          notification are allowed due to user privacy
        </p>
      </div>
    </div>
  );
};

export default ReadOnly;
