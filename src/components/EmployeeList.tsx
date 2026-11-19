import { useEmployeeStore } from "../stores/useEmployeeStore";

const EmployeeList = () => {
  const employees = useEmployeeStore((state) => state.employees);
  const toggleEmployeeActive = useEmployeeStore((state)=> state.toggleEmployeeActive)
  const removeEmployee = useEmployeeStore((state)=> state.removeEmployee)

  return (
    <div>
      <h2>Employees</h2>

      {employees.map((employee) => (
        <div key={employee.id}>
          <p>{employee.name}</p>
          <button onClick={()=>toggleEmployeeActive(employee.id)}>{employee.active ? "Active" : "Inactive"}</button>
          <button onClick={()=>removeEmployee(employee.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default EmployeeList;
