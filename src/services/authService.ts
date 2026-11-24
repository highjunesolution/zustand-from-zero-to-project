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

interface MeResponse {
  user: AuthUser;
}

export async function getCurrentUserApi(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Session check failed: ${response.status}`);
  }

  const data: MeResponse = await response.json();

  return data.user;
}

export async function logoutApi():Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if(!response.ok) {
    throw new Error(`Logout failed: HTTP ${response.status}`);
    
  }
}