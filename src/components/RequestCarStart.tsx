type RequestCarStartProps = {
  onRequest: () => void;
  disabled: boolean;
};

export function RequestCarStart({ onRequest, disabled }: RequestCarStartProps) {
  return (
    <div
      className='p-6 rounded-xl bg-black/70 backdrop-blur-md
                    border border-white/10 w-[360px]'
    >
      <h3 className='text-white text-lg font-semibold'>Car Start Request</h3>

      <p className='text-gray-400 text-sm mt-2'>
        You are not allowed to start the car directly. A request will be sent to
        family members.
      </p>

      <button
        disabled={disabled}
        onClick={onRequest}
        className={`mt-4 w-full py-3 rounded-lg font-semibold
          ${
            disabled
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
          }
        `}
      >
        Request Car Start
      </button>
    </div>
  );
}
