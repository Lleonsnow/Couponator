const getBase = () => process.env.NEXT_PUBLIC_API_URL ?? "";

export function apiUrl(path: string): string {
  const base = getBase().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export async function apiFetch<T>(
  path: string,
  opts?: RequestInit & { token?: string | null }
): Promise<T> {
  const { token, ...init } = opts ?? {};
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(apiUrl(path), { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}
