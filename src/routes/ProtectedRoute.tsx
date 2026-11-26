import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";

const ProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);

  if (authStatus !== "authenticated" || !user) {
    return <Navigate to={"/login"} replace />;
  }
  return <Outlet />;
};
export default ProtectedRoute;
