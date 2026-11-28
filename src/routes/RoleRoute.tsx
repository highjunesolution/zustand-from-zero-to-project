import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import type { AuthUser } from "../types/auth";

type AllowedRolesProp = {
  allowedRoles: AuthUser["role"][];
};

const RoleRoute = ({ allowedRoles }: AllowedRolesProp) => {
  const user = useAuthStore((state) => state.user);
  
    if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={"/forbidden"} replace />;
  }

  return <Outlet />;
};
export default RoleRoute;
