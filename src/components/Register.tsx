import { useState } from "react";
import { useDashboardStore } from "../store/dashboard.store";

type RegisterProps = {
  onSwitch: () => void;
};

const Register = ({ onSwitch }: RegisterProps) => {
  const register = useDashboardStore((s) => s.register);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(form);
    onSwitch();
    alert("Registered successfully. Please login.");
  };
  return (
    <div className='flex items-center justify-center h-screen'>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 border-2 border-purple-400 px-8! py-6! rounded-xl
        shadow-[inset_0_0_30px_rgba(168,85,247,0.25)]
        shadow-[0_0_22px_rgba(168,85,247,0.4)]'
      >
        <h3 className='text-lg text-center mb-2!'>Register For Dashboard</h3>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>User Name</label>
          <input
            type='text'
            placeholder='enter your name'
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className='border border-purple-400 rounded-lg px-3! py-2! text-sm w-[14rem]'
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>E-mail</label>
          <input
            type='email'
            placeholder='email@gmail.com'
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className='border border-purple-400 rounded-lg px-3! py-2! text-sm w-[14rem]'
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>User Phone.No</label>
          <input
            type='number'
            placeholder='enter your phone.no'
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className='border border-purple-400 rounded-lg px-3! py-2! text-sm w-[14rem]'
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Password</label>
          <input
            type='password'
            placeholder='enter password'
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className='border border-purple-400 rounded-lg px-3! py-2! text-sm w-[14rem]'
          />
        </div>

        <div className='flex items-center justify-between'>
          <button
            type='submit'
            className='mt-2! text-purple-100 bg-purple-800 rounded-md px-3! py-1.5! w-28'
          >
            Register
          </button>

          <button
            type='button'
            onClick={onSwitch}
            className='mt-2! text-purple-500 bg-purple-700/5 rounded-md px-3! py-1! w-22'
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
