import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

type AuthMode = "login" | "register";

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <>
      {mode === "login" && <Login onSwitch={() => setMode("register")} />}

      {mode === "register" && <Register onSwitch={() => setMode("login")} />}
    </>
  );
};

export default AuthPage;
