import { Navigate } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  const user = useAuthStore((state) => state.user);
  if (user) {
    return <Navigate to={"/dashboard"} replace />;
  }

  return <LoginForm />;
};
export default LoginPage;
