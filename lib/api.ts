/**
 * CareConnect Web — Base API Client
 *
 * Mirrors the mobile `services/api.ts` pattern.
 * All HTTP calls go through this client — never use fetch() directly in components.
 *
 * Token is stored in localStorage (access_token only).
 * The backend sets refresh_token as an HttpOnly cookie automatically.
 */

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ─── Token Helpers ──────────────────────────────────────────────────────────

const TOKEN_KEY = 'careconnect_access_token';
const USER_KEY = 'careconnect_user';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): StoredUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as StoredUser;
    } catch {
        return null;
    }
}

export function setStoredUser(user: StoredUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export interface StoredUser {
    user_id: string;
    role: string;
    hospital_id?: string;
}

// ─── Token Refresh ─────────────────────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // sends the HttpOnly refresh cookie
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data.access_token) {
            setToken(data.access_token);
            setStoredUser({
                user_id: data.user_id,
                role: data.role,
            });
            return data.access_token;
        }
        return null;
    } catch {
        return null;
    }
}

// ─── API Client ─────────────────────────────────────────────────────────────

interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    params?: Record<string, string>;
}

export async function apiRequest<T>(config: RequestConfig): Promise<T> {
    const { method, path, body, headers = {}, params } = config;

    let url = `${API_BASE_URL}${path}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const token = getToken();

    let res = await fetch(url, {
        method,
        credentials: 'include', // send refresh cookie
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    // ── Auto-refresh on 401 ──
    if (res.status === 401 && token) {
        // Use a shared promise to prevent concurrent refresh calls
        if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
                refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;

        if (newToken) {
            // Retry the original request with the new token
            res = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${newToken}`,
                    ...headers,
                },
                body: body ? JSON.stringify(body) : undefined,
            });
        } else {
            // Refresh failed — session is truly expired
            clearToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Session expired. Please log in again.');
        }
    }

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }));

        // Create a custom error that includes the status code
        const customError = new Error(error.detail || `API error: ${res.status}`);
        (customError as any).status = res.status; // Attach the HTTP Status Code here

        throw customError;
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
}
