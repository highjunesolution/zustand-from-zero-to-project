import { Link } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";

const AdminPage = () => {
    const user = useAuthStore((state)=>state.user);


  return (
    <main>
        <h1>Admin Management</h1>
        <p>Welcome, {user?.displayName}</p>
        <p>Role: {user?.role}</p>

        <Link to={"/dashboard"}>Back to Dashboard</Link>
    </main>
  )
}
export default AdminPage