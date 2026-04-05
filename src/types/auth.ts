export type AgentRole = "pesquisador" | "admin" | "supervisor" | "visualizador";

export interface AuthUser {
  id: string;
  name: string;
  /** Somente dígitos (11) */
  cpf: string;
  role: AgentRole;
  mustChangePassword: boolean;
  isActive: boolean;
}

export interface LoginRequest {
  cpf: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ChangePasswordRequest {
  newPassword: string;
  confirmPassword: string;
}
