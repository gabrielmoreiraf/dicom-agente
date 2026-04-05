import { db } from "@/db";
import type { AuthUser } from "@/types/auth";

export interface StoredSession {
  accessToken: string;
  cpf: string;
  user: AuthUser;
}

export async function getSession(): Promise<StoredSession | null> {
  const row = await db.session.get("current");
  if (!row?.access_token || !row.user_json) return null;
  try {
    const user = JSON.parse(row.user_json) as AuthUser;
    return {
      accessToken: row.access_token,
      cpf: row.cpf,
      user,
    };
  } catch {
    return null;
  }
}

export async function saveSession(s: StoredSession): Promise<void> {
  await db.session.put({
    id: "current",
    access_token: s.accessToken,
    cpf: s.cpf,
    user_json: JSON.stringify(s.user),
    updated_at: new Date().toISOString(),
  });
}

export async function updateSessionUser(user: AuthUser): Promise<void> {
  const row = await db.session.get("current");
  if (!row) return;
  await db.session.put({
    ...row,
    user_json: JSON.stringify(user),
    cpf: user.cpf,
    updated_at: new Date().toISOString(),
  });
}

export async function logout(): Promise<void> {
  await db.session.delete("current");
}
