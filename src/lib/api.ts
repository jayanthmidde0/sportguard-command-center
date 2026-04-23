// Centralized API client for SportGuard FastAPI backend.
// Change base URL in one place. Easy to swap for prod.

const envApiBase = (import.meta as any)?.env?.VITE_API_BASE_URL;

export const API_BASE_URL =
  (typeof envApiBase === "string" && envApiBase.trim()) ||
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
      raw: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ email, password }).toString(),
    }),
  register: (payload: { email: string; password: string; name?: string }) =>
    api<{ message: string }>(
      `/auth/register?email=${encodeURIComponent(payload.email)}&password=${encodeURIComponent(payload.password)}`,
      {
      method: "POST",
      auth: false,
      raw: true,
      }
    ),
  me: async () => {
    const cached = typeof window === "undefined" ? null : localStorage.getItem("sg_user");
    return cached ? { user: JSON.parse(cached) } : { user: null };
  },
};

export const videosApi = {
  uploadReference: (file: File, meta: { title?: string; description?: string; keywords?: string; playback_mode?: string }, onProgress?: (p: number) => void) =>
    uploadWithProgress("/upload", file, meta, onProgress),
  detect: (file: File, meta: { title?: string }, onProgress?: (p: number) => void) =>
    uploadWithProgress("/detect", file, meta, onProgress),
};

export const linkScanApi = {
  scan: (link: string) => api<any>("/scan-link", { method: "POST", body: JSON.stringify({ link }) }),
};

export const youtubeApi = {
  scan: (payload: { query: string; min_keyword_matches?: number }) => {
    const params = new URLSearchParams({ query: payload.query });
    if (typeof payload.min_keyword_matches === "number") {
      params.set("min_keyword_matches", String(payload.min_keyword_matches));
    }
    return api<any>(`/scan-youtube?${params.toString()}`);
  },
};

export const telegramApi = {
  scan: (channel?: string) =>
    api<any>(`/scan-telegram${channel ? `?channel=${encodeURIComponent(channel)}` : ""}`),
};

export const watermarkApi = {
  verify: (file: File, bits?: number, onProgress?: (p: number) => void) =>
    uploadWithProgress(`/watermark/verify${typeof bits === "number" ? `?bits=${bits}` : ""}`, file, {}, onProgress),
};

export const detectionsApi = {
  list: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? "?" + Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
      : "";
    return api<any[]>(`/detections${qs}`);
  },
  get: async (id: string) => {
    const rows = await api<any[]>("/detections");
    return rows.find((row: any) => String(row?.id) === String(id));
  },
};

export const proofApi = {
  report: (detectionId: string | number, kind: "pirated" | "original" = "pirated") =>
    api<any>(`/proof/report/${detectionId}?kind=${kind}`),
  downloadUrl: (detectionId: string | number, kind: "pirated" | "original" = "pirated") =>
    `${API_BASE_URL}/proof/download/${detectionId}?kind=${kind}`,
  download: async (detectionId: string | number, kind: "pirated" | "original" = "pirated") => {
    const t = tokenStore.get();
    const res = await fetch(`${API_BASE_URL}/proof/download/${detectionId}?kind=${kind}`, {
      headers: {
        Accept: "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new ApiError(res.status, (body as any)?.detail || res.statusText || "Proof download failed", body);
    }

    return res.blob();
  },
};

export const analyticsApi = {
  overview: () => api<any>("/analytics/overview"),
  timeline: () => api<any>("/analytics/timeline"),
  topVideos: () => api<any>("/analytics/top-videos"),
  platforms: () => api<any>("/analytics/platforms"),
  similarity: () => api<any>("/analytics/similarity"),
};

export const monitoringApi = {
  status: () => api<any>("/monitoring/status"),
  control: (payload: { youtube_enabled?: boolean; telegram_enabled?: boolean }) =>
    api<any>("/monitoring/control", { method: "POST", body: JSON.stringify(payload) }),
  events: async (limit = 50) => {
    const data = await api<{ events?: any[] }>(`/webhook/events?limit=${limit}`);
    return data?.events ?? [];
  },
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
