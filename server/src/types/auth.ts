export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  role: "USER" | "ADMIN";
}
