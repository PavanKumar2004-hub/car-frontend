import { type FC, useEffect, useState } from "react";
import { TbCopy } from "react-icons/tb";
import {
  useDashboardStore,
  type VehicleCredentials,
  type VehicleDevice,
} from "../store/dashboard.store";

interface Props {
  onClose: () => void;
}

export const VehicleManagerModal: FC<Props> = ({ onClose }) => {
  const {
    vehicles,
    activeVehicle,
    fetchVehicles,
    addVehicle,
    deleteVehicle,
    rotateVehicleKey,
    setActiveVehicle,
  } = useDashboardStore();

  const [name, setName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  const owner = useDashboardStore((s) => s.owner);

  /* 🔥 holds credentials (create / rotate / reveal) */
  const [creds, setCreds] = useState<VehicleCredentials | null>(null);
  const getVehicleCredentials = useDashboardStore(
    (s) => s.getVehicleCredentials
  );

  /* 🔥 QR provisioning (active vehicle) */
  const [qrCreds, setQrCreds] = useState<VehicleCredentials | null>(null);
  const [qrNonce, setQrNonce] = useState<string>("");
  const [qrIssuedAt, setQrIssuedAt] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const createNonce = () => {
    try {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return Math.random().toString(16).slice(2);
    }
  };

  const refreshQr = () => {
    setQrNonce(createNonce());
    setQrIssuedAt(new Date().toISOString());
  };

  const activeVehicleId = activeVehicle?._id ?? null;

  useEffect(() => {
    const run = async () => {
      if (!activeVehicleId) {
        setQrCreds(null);
        setQrError(null);
        setQrLoading(false);
        return;
      }

      refreshQr();

      setQrLoading(true);
      setQrError(null);

      try {
        const c = await getVehicleCredentials(activeVehicleId);
        setQrCreds(c);
      } catch {
        setQrCreds(null);
        setQrError("Failed to load vehicle key for QR");
      } finally {
        setQrLoading(false);
      }
    };

    void run();
  }, [activeVehicleId, getVehicleCredentials]);

  const qrValue =
    activeVehicle && qrCreds
      ? JSON.stringify({
          v: 1,
          issuedAt: qrIssuedAt,
          nonce: qrNonce,
          owner: {
            name: owner?.name ?? "",
            phone: owner?.phone ?? "",
          },
          vehicle: {
            name: activeVehicle.name,
            plateNumber: activeVehicle.plateNumber,
            vehicleId: qrCreds.vehicleId,
          },
          espKey: qrCreds.espKey,
        })
      : "";

  const qrUrl = qrValue
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encodeURIComponent(qrValue)}`
    : "";

  /* ===============================
     HANDLERS
  ================================ */

  const handleCreate = async () => {
    if (!name.trim() || !plateNumber.trim()) return;
    await addVehicle(name, plateNumber);
    setName("");
    setPlateNumber("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vehicle permanently?")) return;
    await deleteVehicle(id);
  };

  const handleRotate = async (id: string) => {
    const res = await rotateVehicleKey(id);
    showCredsTemporarily(res);
    setQrCreds(res);
    refreshQr();
  };

  const handleSelect = async (v: VehicleDevice) => {
    await setActiveVehicle(v);
    refreshQr();
  };

  /* 🔥 NEW: fetch key for active vehicle */
  const handleRevealKey = async () => {
    if (!activeVehicle) return;

    const creds = await getVehicleCredentials(activeVehicle._id);
    showCredsTemporarily(creds);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied");
  };

  const showCredsTemporarily = (data: VehicleCredentials) => {
    setCreds(data);

    setTimeout(() => {
      setCreds(null);
    }, 10000); // 10 seconds
  };

  /* ===============================
     UI
  ================================ */

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
      <div className='w-[95%] max-w-2xl rounded-2xl bg-[#0b0f14]  shadow-md border-2 border-green-400 px-8! py-7! hide-scrollbar max-h-[30rem]'>
        {/* Header */}
        <div className='flex justify-between items-center mb-5!'>
          <h2 className='text-xl font-semibold text-cyan-400'>
            Vehicle Manager
          </h2>

          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            ✕
          </button>
        </div>

        {/* ================= CREATE ================= */}
        <div className='mb-6! flex gap-2'>
          <input
            placeholder='Vehicle name (e.g. Family Car)'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='flex-1 rounded-lg bg-[#11161c] border border-white/10 p-2! text-white'
          />
          <input
            placeholder='Vehicle Number (e.g. AP-123)'
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            className='flex-1 rounded-lg bg-[#11161c] border border-white/10 p-2! text-white'
          />

          <button
            onClick={handleCreate}
            className='rounded-lg bg-emerald-700 px-4! text-white hover:bg-emerald-800'
          >
            Add
          </button>
        </div>

        {/* ================= ACTIVE VEHICLE DETAILS ================= */}
        {activeVehicle && (
          <div className='mb-2! rounded-xl border border-cyan-500/40 bg-[#111c22] p-4!'>
            <div className='flex items-start justify-between gap-4'>
              {/* LEFT: details */}
              <div className='flex-1'>
                <p className='text-sm text-cyan-400 mb-2! font-semibold'>
                  Active Vehicle
                </p>

                <p className='text-white text-sm'>{activeVehicle.name}</p>
                <p className='text-xs text-gray-400'>
                  {activeVehicle.plateNumber}
                </p>
                <p className='text-xs text-gray-400 mb-3!'>
                  {activeVehicle.vehicleId}
                </p>

                <div className='flex gap-2'>
                  <button
                    onClick={handleRevealKey}
                    className='text-xs bg-blue-700 px-3! py-1! rounded text-white hover:bg-blue-800'
                  >
                    Reveal Key
                  </button>

                  <button
                    onClick={() => handleRotate(activeVehicle._id)}
                    className='text-xs bg-amber-700 px-3! py-1! rounded text-white hover:bg-amber-800'
                  >
                    Rotate Key
                  </button>
                </div>
              </div>

              {/* RIGHT: QR */}
              <div className='shrink-0 flex flex-col items-center gap-2'>
                {qrLoading ? (
                  <div className='h-[140px] w-[140px] rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xs text-gray-300'>
                    Generating…
                  </div>
                ) : qrUrl ? (
                  <img
                    src={qrUrl}
                    alt='Vehicle Provision QR'
                    className='h-[140px] w-[140px] rounded-xl bg-white p-2'
                  />
                ) : (
                  <div className='h-[140px] w-[140px] rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xs text-gray-300'>
                    No QR
                  </div>
                )}

                {qrError && (
                  <p className='text-[10px] text-red-400'>{qrError}</p>
                )}

                <button
                  onClick={refreshQr}
                  className='text-[10px] bg-[#0b0f14] border border-white/10 px-2! py-1! rounded text-gray-200 hover:bg-black'
                >
                  Refresh QR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SHOW CREDS ================= */}
        {creds && (
          <div className='mt-2! mb-4! p-4! rounded-xl bg-black border border-emerald-500/30'>
            <p className='text-sm text-emerald-400 mb-2!'>Credentials</p>

            <div className='flex justify-between text-xs mb-2!'>
              <span>ID:</span>
              <button
                className='flex items-center gap-5'
                onClick={() => copy(creds.vehicleId)}
              >
                {creds.vehicleId}
                <span>
                  <TbCopy />
                </span>
              </button>
            </div>

            <div className='flex justify-between text-xs'>
              <span>Key:</span>
              <button
                className='flex items-center gap-5'
                onClick={() => copy(creds.espKey)}
              >
                {creds.espKey}
                <span>
                  <TbCopy />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ================= LIST ================= */}
        <div className='space-y-3 max-h-[260px] overflow-y-auto pr-2 '>
          {vehicles.map((v) => (
            <div
              key={v._id}
              className={`rounded-xl p-4! mb-2! border ${
                activeVehicle?._id === v._id
                  ? "border-cyan-500 bg-[#111c22]"
                  : "border-white/10 bg-[#11161c]"
              }`}
            >
              <div className='flex justify-between items-center'>
                <div>
                  <p className='text-white text-sm'>{v.name}</p>
                  <p className='text-xs text-gray-400'>{v.vehicleId}</p>
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={() => void handleSelect(v)}
                    className='text-xs bg-blue-700 px-3! py-1! rounded text-white'
                  >
                    Select
                  </button>

                  <button
                    onClick={() => handleDelete(v._id)}
                    className='text-xs bg-red-700 px-3! py-1! rounded text-white'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
