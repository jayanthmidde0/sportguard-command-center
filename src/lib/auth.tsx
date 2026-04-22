import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, tokenStore } from "./api";

type User = { id?: string; email: string; name?: string };

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = tokenStore.get();
    if (!t) { setLoading(false); return; }
    authApi.me()
      .then((u: any) => setUser(u?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await authApi.login(email, password);
    if (r.access_token) tokenStore.set(r.access_token);
    const u = r.user ?? { email };
    setUser(u);
    localStorage.setItem("sg_user", JSON.stringify(u));
  };

  const register = async (email: string, password: string, name?: string) => {
    await authApi.register({ email, password, name });
    const loginRes = await authApi.login(email, password);
    if (loginRes.access_token) tokenStore.set(loginRes.access_token);
    const u = loginRes.user ?? { email, name };
    setUser(u);
    localStorage.setItem("sg_user", JSON.stringify(u));
  };

  const logout = () => {
    tokenStore.clear();
    localStorage.removeItem("sg_user");
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
