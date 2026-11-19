import { create } from "zustand";
import type { Employee } from "../types/employee";
import type { ApiUser } from "../types/apiUser";

interface EmployeeStore {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  toggleEmployeeActive: (id: string) => void;

  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
}

export const useEmployeeStore = create<EmployeeStore>()((set) => ({
  employees: [],
  loading: false,
  error: null,
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
  fetchEmployees: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users",
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data: ApiUser[] = await response.json();
      const employees: Employee[] = data.map((user) => ({
        id: String(user.id),
        name: user.name,
        active: true,
      }));

      set({ employees });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch employees",
      });
    } finally {
      set({ loading: false });
    }
  },
}));
