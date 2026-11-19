export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface LoginInput {
  email: string;
  password: string;
}
