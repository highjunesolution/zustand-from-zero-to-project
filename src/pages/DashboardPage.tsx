import { Link } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";

const DashboardPage = () => {
    const user = useAuthStore(state=>state.user)

    
  return (
    <main>
        <h1>Dashboard</h1>

        <p>Welcome, {user?.displayName}</p>

        <nav style={{display: "flex", gap: 10}}>
            <Link to={"/profile"}>My Profile</Link>
            <Link to={"/employees"}>Employee list</Link>

            {user?.role === "ADMIN" && (
              <Link to={"/admin"}>Admin management</Link>
            )}
        </nav>
    </main>
  )
}
export default DashboardPage