// Centralized API client for SportGuard FastAPI backend.
// Change base URL in one place. Easy to swap for prod.

export const API_BASE_URL =
  (typeof window !== "undefined" && (window as any).__SPORTGUARD_API__) ||
  "http://localhost:8000";

const TOKEN_KEY = "sg_token";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
  }
}

type ReqOpts = RequestInit & { auth?: boolean; raw?: boolean };

export async function api<T = unknown>(path: string, opts: ReqOpts = {}): Promise<T> {
  const { auth = true, raw = false, headers, ...rest } = opts;
  const h: Record<string, string> = { Accept: "application/json", ...(headers as any) };
  if (!raw && !(rest.body instanceof FormData)) {
    h["Content-Type"] = h["Content-Type"] || "application/json";
  }
  if (auth) {
    const t = tokenStore.get();
    if (t) h.Authorization = `Bearer ${t}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: h });
  } catch (e: any) {
    throw new ApiError(0, "Network unreachable. Backend offline?", { cause: e?.message });
  }

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = (data as any)?.detail || (data as any)?.message || res.statusText || "Request failed";
    throw new ApiError(res.status, typeof msg === "string" ? msg : JSON.stringify(msg), data);
  }
  return data as T;
}

// ---- Endpoints ----
export const authApi = {
  login: (email: string, password: string) =>
    api<{ access_token: string; token_type?: string; user?: any }>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: { email: string; password: string; name?: string }) =>
    api<{ access_token?: string; user?: any }>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),
  me: () => api<any>("/auth/me"),
};

export const videosApi = {
  uploadReference: (file: File, meta: { title?: string; description?: string }, onProgress?: (p: number) => void) =>
    uploadWithProgress("/videos/upload-reference", file, meta, onProgress),
  detect: (file: File, meta: { title?: string }, onProgress?: (p: number) => void) =>
    uploadWithProgress("/videos/detect", file, meta, onProgress),
};

export const detectionsApi = {
  list: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? "?" + Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
      : "";
    return api<any[]>(`/detections${qs}`);
  },
  get: (id: string) => api<any>(`/detections/${id}`),
};

export const analyticsApi = {
  overview: () => api<any>("/analytics/overview"),
  timeline: () => api<any>("/analytics/timeline"),
  topVideos: () => api<any>("/analytics/top-videos"),
  platforms: () => api<any>("/analytics/platforms"),
};

export const monitoringApi = {
  status: () => api<any>("/monitoring/status"),
  events: () => api<any[]>("/monitoring/events"),
};

function uploadWithProgress(
  path: string,
  file: File,
  meta: Record<string, any>,
  onProgress?: (p: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    Object.entries(meta).forEach(([k, v]) => v != null && fd.append(k, String(v)));
    xhr.open("POST", `${API_BASE_URL}${path}`);
    const t = tokenStore.get();
    if (t) xhr.setRequestHeader("Authorization", `Bearer ${t}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new ApiError(xhr.status, (data as any)?.detail || xhr.statusText, data));
      } catch (e: any) {
        reject(new ApiError(xhr.status, e?.message || "Upload failed"));
      }
    };
    xhr.onerror = () => reject(new ApiError(0, "Network error during upload"));
    xhr.send(fd);
  });
}
