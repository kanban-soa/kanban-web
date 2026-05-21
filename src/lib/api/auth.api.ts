import api, { setToken, removeToken } from "./axios";
import { AUTH } from "./routes";
import type { Account } from "./types";

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

type AuthResponse = {
  token: string;
  refreshToken: string;
  user: Account;
};

export async function login({ email, password }: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(AUTH.LOGIN, { email, password });
  setToken(data.token);
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("refresh_token", data.refreshToken);
  }
  return data;
}

export async function register({ email, password, name }: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(AUTH.REGISTER, { email, password, name });
  setToken(data.token);
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("refresh_token", data.refreshToken);
  }
  return data;
}

export async function logout() {
  removeToken();
}

export async function listAccounts(): Promise<Account[]> {
  const { data } = await api.get<Account[] | { data: Account[] }>(AUTH.LIST_ACCOUNTS);
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function updateUser(id: string, updates: Partial<Account>): Promise<Account> {
  const { data } = await api.put<Account>(AUTH.UPDATE_USER(id), updates);
  return data;
}

export async function getUser(id: string): Promise<Account> {
  const { data } = await api.get<Account>(AUTH.GET_USER(id));
  return data;
}
