import { API_BASE_URL } from "./config";

export type ApiUser = { id: string; name: string; email: string; role: string };
export type ApiCompany = {
  id: string;
  name: string;
  type: string;
  plan: string;
  creditBalance: number;
};
export type Rfq = {
  id: string;
  title: string;
  status: string;
  categoryId: string | null;
  regionId: string | null;
  deadline: string | null;
  createdAt: string;
};

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.error ?? "Ismeretlen hiba");
  return json as T;
}

export function login(email: string, password: string) {
  return request<{ token: string; user: ApiUser; company: ApiCompany | null }>(
    "/api/v1/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
  );
}

export function me(token: string) {
  return request<{ user: ApiUser; company: ApiCompany; unreadNotifications: number }>(
    "/api/v1/me",
    { method: "GET" },
    token,
  );
}

export function listRfqs(token: string, status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<{ data: Rfq[] }>(`/api/v1/rfqs${qs}`, { method: "GET" }, token);
}

export function getRfq(token: string, id: string) {
  return request<{ data: Rfq & { spec: unknown; offers: unknown[]; invites: unknown[] } }>(
    `/api/v1/rfqs/${id}`,
    { method: "GET" },
    token,
  );
}
