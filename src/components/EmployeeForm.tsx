import { useState } from "react";
import { useEmployeeStore } from "../stores/useEmployeeStore";

const EmployeeForm = () => {
  const [name, setName] = useState("");

  const addEmployee = useEmployeeStore((state) => state.addEmployee);

  const handleAdd = () => {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    addEmployee({
      id: crypto.randomUUID(),
      name: trimmedName,
      active: true,
    });

    setName("");
  };
  return <div>
    <input value={name} onChange={(e)=>setName(e.target.value)}  />
    <button onClick={handleAdd}>Add Employee</button>
  </div>;
};

export default EmployeeForm;
