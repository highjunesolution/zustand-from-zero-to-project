import AuthProfile from "./components/AuthProfile";
import EmployeePage from "./components/EmployeePage";
import LoginForm from "./components/LoginForm";
import { useAuthStore } from "./stores/useAuthStore";

const App = () => {
  const user = useAuthStore((state) => state.user);

  return <>{user ? <AuthProfile /> : <LoginForm />}</>;
};

export default App;
