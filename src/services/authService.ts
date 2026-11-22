import type { AuthUser, LoginInput } from "../types/auth";

interface LoginResponse {
  user: AuthUser;
}

interface ApiErrorResponse {
  message?: string;
}

export async function loginApi(input: LoginInput): Promise<AuthUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();

    throw new Error(errorData.message ?? "Login failed");
  }

  const data = (await response.json()) as LoginResponse;

  return data.user;
}
