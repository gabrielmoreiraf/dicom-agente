import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginRequest, changePasswordRequest } from "@/services/authApi";
import type { AuthUser } from "@/types/auth";
import type { ChangePasswordRequest } from "@/types/auth";
import { refreshComunidadesCatalog } from "@/features/diagnoses/services/comunidades";
import {
  getSession,
  logout as logoutDb,
  saveSession,
  updateSessionUser,
} from "./session";

/**
 * Issue 2.2: prefetch do catálogo no máximo uma vez por carregamento da página (cold start).
 * Evita reexecução em remounts (ex.: React Strict Mode) e quando `accessToken` oscila sem novo reload.
 */
let communityCatalogColdStartPrefetchDone = false;

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  mustChangePassword: boolean;
  login: (cpf: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completePasswordChange: (body: ChangePasswordRequest) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const s = await getSession();
      if (s) {
        setUserState(s.user);
        setAccessToken(s.accessToken);
      }
      setLoading(false);
    })();
  }, []);

  /**
   * Issue 2.2 — Com sessão hidratada do Dexie e rede: prefetch em background (não bloqueia render).
   * `refreshComunidadesCatalog` já trata offline sem apagar cache; single-flight deduplica com o login.
   */
  useEffect(() => {
    if (loading) return;
    if (!accessToken) return;
    if (communityCatalogColdStartPrefetchDone) return;

    communityCatalogColdStartPrefetchDone = true;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return;
    }

    void refreshComunidadesCatalog().catch(() => {});
  }, [loading, accessToken]);

  const login = useCallback(async (cpf: string, password: string) => {
    const normalized = cpf.replace(/\D/g, "");
    const res = await loginRequest({
      cpf: normalized,
      password: password.trim(),
    });
    const sessionUser = res.user;
    await saveSession({
      accessToken: res.accessToken,
      cpf: sessionUser.cpf,
      user: sessionUser,
    });
    setAccessToken(res.accessToken);
    setUserState(sessionUser);
    void refreshComunidadesCatalog().catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await logoutDb();
    setAccessToken(null);
    setUserState(null);
  }, []);

  const completePasswordChange = useCallback(
    async (body: ChangePasswordRequest) => {
      const token = accessToken;
      if (!token) throw new Error("Sessão inválida");
      const updated = await changePasswordRequest(token, body);
      await updateSessionUser(updated);
      setUserState(updated);
    },
    [accessToken],
  );

  const mustChangePassword = !!(user?.mustChangePassword);

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      loading,
      mustChangePassword,
      login,
      logout,
      completePasswordChange,
    }),
    [
      user,
      accessToken,
      loading,
      mustChangePassword,
      login,
      logout,
      completePasswordChange,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
