import { useEffect } from "react";
import AuthProfile from "./components/AuthProfile";
import { useAuthStore } from "./stores/useAuthStore";
import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import EmployeePage from "./pages/EmployeePage";
import ForbiddenPage from "./pages/ForbiddenPage";
import AdminRoute from "./routes/AdminRoute";
import AdminPage from "./pages/AdminPage";

const App = () => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const error = useAuthStore((state) => state.error);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  if (authStatus === "checking") {
    return <p>Checking authentication...</p>;
  }

  if (authStatus === "error") {
    return (
      <>
        <p>Session verification failed: {error}</p>
        <button onClick={() => void checkAuth}>Retry Authentication</button>
      </>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<AuthProfile />} />
        <Route path="/employees" element={<EmployeePage />} />

        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<h2>404 Not Found</h2>} />
    </Routes>
  );
};

export default App;
