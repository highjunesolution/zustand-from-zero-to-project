import { useAuthStore } from "../stores/useAuthStore";

const AuthProfile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  return (
    <div>
      <h2>Welcome {user.displayName}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default AuthProfile;
