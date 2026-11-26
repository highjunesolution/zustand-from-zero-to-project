import { useEffect } from "react";
import { useEmployeeStore } from "../stores/useEmployeeStore";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";

const EmployeePage = () => {
  const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);
  const loading = useEmployeeStore((state) => state.loading);
  const error = useEmployeeStore((state) => state.error);
  const searchTerm = useEmployeeStore((state) => state.searchTerm);
  const setSearchTerm = useEmployeeStore((state) => state.setSearchTerm);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);
  return (
    <div>
      <h4>Management</h4>

      {loading && <p>Loading employees...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <EmployeeForm />
      <EmployeeList />

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search employee.."
      />

      <button
        disabled={loading}
        onClick={fetchEmployees}
        style={{ marginTop: 10 }}
      >
        {loading ? "Loading..." : "Reload Employees"}
      </button>
    </div>
  );
};

export default EmployeePage;
