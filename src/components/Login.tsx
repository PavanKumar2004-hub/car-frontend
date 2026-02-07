import { useEffect, useState } from "react";
import { useDashboardStore } from "../store/dashboard.store";

type LoginProps = {
  onSwitch: () => void;
};

const EMAIL_STORAGE_KEY = "login_emails";

const Login = ({ onSwitch }: LoginProps) => {
  const login = useDashboardStore((s) => s.login);
  const loadUser = useDashboardStore((s) => s.loadUser);
  const loadContextRole = useDashboardStore((s) => s.loadContextRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savedEmails, setSavedEmails] = useState<string[]>([]);

  /* -------------------------------------------
     Load stored emails once on mount
  --------------------------------------------*/
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEY) || "[]");
    setSavedEmails(stored);
  }, []);

  /* -------------------------------------------
     Save email after successful login
  --------------------------------------------*/
  const persistEmail = (email: string) => {
    if (!email) return;

    const updated = [...new Set([...savedEmails, email])];
    setSavedEmails(updated);
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      await loadUser();
      await loadContextRole();

      // ✅ Save email only after successful auth
      persistEmail(email);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 border-2 border-green-400 px-8! py-6! rounded-xl
        shadow-[inset_0_0_20px_rgba(0,255,156,0.25)]
        shadow-[0_0_30px_rgba(0,255,156,0.35)]'
      >
        <h3 className='text-lg text-center mb-2!'>Login To Dashboard</h3>

        {/* EMAIL */}
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>E-mail</label>
          <input
            type='email'
            value={email}
            list='email-history'
            onChange={(e) => setEmail(e.target.value)}
            placeholder='email@gmail.com'
            className='border border-green-400 rounded-lg px-3! py-2! text-sm w-[14rem]'
          />

          {/* Suggestions */}
          <datalist id='email-history'>
            {savedEmails.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </div>

        {/* PASSWORD */}
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Password</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='enter password'
            className='border border-green-400 rounded-lg px-3! py-2! text-sm w-[14rem]'
          />
        </div>

        <div className='flex items-center justify-between'>
          <button
            type='submit'
            className='mt-2! text-green-500 bg-green-700/5 rounded-md px-3! py-1! w-22'
          >
            Login
          </button>

          <button
            type='button'
            onClick={onSwitch}
            className='mt-2! text-green-100 bg-green-800 rounded-md px-3! py-1.5! w-28'
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
