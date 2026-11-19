import { create } from "zustand";
import type { Employee } from "../types/employee";

interface EmployeeStore {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  toggleEmployeeActive: (id: string) => void;
}

export const useEmployeeStore = create<EmployeeStore>()((set) => ({
  employees: [
    { id: "emp001", name: "Tony", active: true },
    { id: "emp002", name: "Junior", active: false },
  ],

  addEmployee: (employee) => {
    set((state) => ({
      employees: [...state.employees, employee],
    }));
  },
  removeEmployee: (id) => {
    set(({ employees }) => ({
      employees: employees.filter((e) => e.id !== id),
    }));
  },

  toggleEmployeeActive: (id) => {
    set(({ employees }) => ({
      employees: employees.map((e) =>
        e.id === id ? { ...e, active: !e.active } : e,
      ),
    }));
  },
}));
