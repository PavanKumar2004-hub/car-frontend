import { useEffect } from "react";
import AuthPage from "./components/AuthPage";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import { useDashboardStore } from "./store/dashboard.store";

export default function App() {
  const token = useDashboardStore((s) => s.token);
  const user = useDashboardStore((s) => s.user);
  const loadUser = useDashboardStore((s) => s.loadUser);
  const loadContextRole = useDashboardStore((s) => s.loadContextRole);
  const connectSocket = useDashboardStore((s) => s.connectSocket);

  // 1. Restore user from token
  useEffect(() => {
    if (token && !user) {
      loadUser();
    }
  }, [token, user, loadUser]);

  // 1b. Restore dashboard context (role + active vehicle)
  useEffect(() => {
    if (token) {
      loadContextRole();
    }
  }, [token, loadContextRole]);

  // 2. Connect socket after token exists
  useEffect(() => {
    if (token) {
      connectSocket();
    }
  }, [token, connectSocket]);

  // 3. No token → Auth
  if (!token) {
    return <AuthPage />;
  }

  // // 4. Token exists but user not loaded yet → WAIT
  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  // 5. Fully authenticated + hydrated
  return <Dashboard />;
}
