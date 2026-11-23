import { useEffect } from "react";
import AuthProfile from "./components/AuthProfile";
import EmployeePage from "./components/EmployeePage";
import LoginForm from "./components/LoginForm";
import { useAuthStore } from "./stores/useAuthStore";

const App = () => {
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const error = useAuthStore((state) => state.error);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  if (authStatus === "checking") {
    return <p>Checknig authentication...</p>;
  }

  if (authStatus === "error") {
    return <>
      <p>Session verification failed: {error}</p>
      <button onClick={checkAuth}>Retry Authentication</button>
    </>;
  }

  if (authStatus === "authenticated" && user) {
    return <AuthProfile />;
  }

  return <LoginForm />;
};

export default App;
