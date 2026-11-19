import type { AuthUser, LoginInput } from "../types/auth";

export async function mockLogin(input: LoginInput): Promise<AuthUser> {
  // จำลองการรอ Backend 500ms
  await new Promise<void>((resolve) => setTimeout(resolve, 500));

  if (!input.email.trim() || !input.password.trim()) {
    throw new Error("Email and password are required");
  }

  //   จำลอง API ตอบ Login ไม่สำเร็จ
  if (input.email === "fail@example.com") {
    throw new Error("Invalid credentials (demo)");
  }

  return {
    id: "demo-001",
    displayName: "Demo User",
    email: input.email,
    role: "USER",
  };
}
