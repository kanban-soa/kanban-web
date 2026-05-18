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
};

export async function login({ email, password }: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(AUTH.LOGIN, { email, password });
  setToken(data.token);
  return data;
}

export async function register({ email, password, name }: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(AUTH.REGISTER, { email, password, name });
  setToken(data.token);
  return data;
}

export async function logout() {
  removeToken();
}

export async function listAccounts(): Promise<Account[]> {
  const { data } = await api.get<Account[] | { data: Account[] }>(AUTH.LIST_ACCOUNTS);
  return Array.isArray(data) ? data : data.data ?? [];
}
