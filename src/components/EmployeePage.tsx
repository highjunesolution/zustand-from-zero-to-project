import { useEffect } from "react";
import { useEmployeeStore } from "../stores/useEmployeeStore";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";

const EmployeePage = () => {
    const fetchEmployees = useEmployeeStore(state=>state.fetchEmployees);
    const loading = useEmployeeStore(state=>state.loading);
    const error = useEmployeeStore(state=>state.error);

    useEffect(()=>{
        void fetchEmployees()
    },[fetchEmployees])
  return (
    <div>
        <h4>Management</h4>

        {loading && <p>Loading employees...</p>}
        {error && <p style={{color: "red"}}>{error}</p> }
        <EmployeeForm/>
        <EmployeeList/>

        <button disabled={loading} onClick={fetchEmployees} style={{marginTop:10}}>{loading ? "Loading..." : "Reload Employees"}</button>
    </div>
  )
}

export default EmployeePage