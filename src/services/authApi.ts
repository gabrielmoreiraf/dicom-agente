import type {
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
} from "@/types/auth";

import { apiUrl } from "./apiBase";

class AuthApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function parseError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const j = JSON.parse(text) as { message?: unknown };
    if (Array.isArray(j.message)) {
      return j.message.map(String).join(", ");
    }
    if (j && typeof j.message === "string") return j.message;
  } catch {
    /* ignore */
  }
  return text || `HTTP ${res.status}`;
}

export async function loginRequest(body: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      cpf: body.cpf,
      password: body.password,
    }),
  });

  if (!res.ok) {
    throw new AuthApiError(await parseError(res), res.status);
  }

  return res.json() as Promise<LoginResponse>;
}

export async function changePasswordRequest(
  accessToken: string,
  body: ChangePasswordRequest,
): Promise<AuthUser> {
  const res = await fetch(apiUrl("/auth/change-password"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new AuthApiError(await parseError(res), res.status);
  }

  const data = (await res.json()) as AuthUser | { user: AuthUser };
  if (data && typeof data === "object" && "user" in data) {
    return data.user;
  }
  return data as AuthUser;
}
