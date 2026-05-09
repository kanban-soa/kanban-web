import api, { setToken, removeToken } from "./axios";

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
  const { data } = await api.post<AuthResponse>("/api/v1/auth/login", { email, password });
  setToken(data.token);
  return data;
}

export async function register({ email, password, name }: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/v1/auth/register", { email, password, name });
  setToken(data.token);
  return data;
}

export async function logout() {
  removeToken();
}
