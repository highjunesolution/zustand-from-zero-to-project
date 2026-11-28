import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";

const AdminRoute = () => {
    const user = useAuthStore(state=>state.user)
    
    if(user?.role !== "ADMIN") {
        return <Navigate to={"/forbidden"} replace/>
    }
  return (
    <Outlet/>
  )

}
export default AdminRoute