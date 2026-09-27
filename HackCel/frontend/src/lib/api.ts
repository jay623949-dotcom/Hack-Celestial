/**
 * Centralized fetch API wrapper — single source of truth for the backend URL.
 */
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${errText}`);
  }
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${errText}`);
  }
  return res.json();
}

export { API_URL };
