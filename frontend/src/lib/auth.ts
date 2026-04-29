/**
 * JWT-based Authentication Helpers
 * Replaces NextAuth with direct API calls to the Express backend.
 */

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

/** Save auth data to localStorage */
export function setAuth(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Get the JWT token */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Get the current user from localStorage */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Clear auth data */
export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Check if user is authenticated */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Login via the Express backend */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || "Invalid credentials" };
    }

    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;

    if (token && user) {
      setAuth(token, user);
      return { success: true, user };
    }

    return { success: false, error: "Unexpected response format" };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

/** Signup via the Express backend */
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || "Signup failed" };
    }

    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;

    // Signup is successful if we get a user, even if there's no token yet
    // (User might need to verify email first)
    if (user) {
      if (token) setAuth(token, user);
      return { success: true, user };
    }

    return { success: false, error: "Unexpected response format" };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

/** Logout: clear token and redirect */
export function logout() {
  clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

/** Verify current token with the backend */
export async function verifySession(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      clearAuth();
      return null;
    }

    const data = await res.json();
    const user = data.user || data.data?.user;
    if (user) {
      // Update stored user in case token data differs
      setAuth(token, user);
      return user;
    }
    return null;
  } catch {
    return null;
  }
}

/** Get auth headers for API requests */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
