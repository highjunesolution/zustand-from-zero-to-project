import { useAuthStore } from "../stores/useAuthStore";

const AuthProfile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const loadingLogout = useAuthStore((state) => state.logoutLoading);
  const error = useAuthStore((state) => state.error);

  if (!user) return null;

  return (
    <div>
      <h2>Welcome {user.displayName}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      <button disabled={loadingLogout} onClick={() => void logout()}>
        {loadingLogout ? "Logging out" : "Logout"}
      </button>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AuthProfile;
