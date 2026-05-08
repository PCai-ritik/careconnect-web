/**
 * CareConnect Web — Auth Service
 *
 * Login and registration functions for the doctor web portal.
 * Matches the backend Token schema: { access_token, token_type, user_id, role }
 *
 * RULE: Components call these functions — never fetch() directly.
 */

import { apiRequest, setToken, setStoredUser, clearToken, type StoredUser } from './api';

// ─── Backend Response Types ─────────────────────────────────────────────────

/** Matches backend schemas.Token exactly */
export interface TokenResponse {
    access_token: string;
    token_type: string;
    user_id: string;
    role: string;
}

/** Matches backend schemas.UserResponse (from GET /api/me) */
export interface MeResponse {
    id: string;
    email: string;
    full_name: string;
    hospital_id: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

// ─── Auth Functions ─────────────────────────────────────────────────────────

/**
 * Login with email + password.
 * Backend determines the role from the DB — no need to send it.
 */
export async function login(email: string, password: string): Promise<TokenResponse> {
    const response = await apiRequest<TokenResponse>({
        method: 'POST',
        path: '/auth/login',
        body: { email, password },
    });

    // Store token and basic user info
    setToken(response.access_token);
    setStoredUser({
        user_id: response.user_id,
        role: response.role,
    });

    return response;
}

/**
 * Register a new doctor account.
 * Backend contract: POST /auth/register/doctor
 * Required: email, password, full_name, hospital_id
 * Optional: specialization
 */
export async function registerDoctor(data: {
    email: string;
    password: string;
    full_name: string;
    hospital_id?: string;
    specialization?: string;
    phone_number?: string;
}): Promise<TokenResponse> {
    const response = await apiRequest<TokenResponse>({
        method: 'POST',
        path: '/auth/register/doctor',
        body: data,
    });

    setToken(response.access_token);
    setStoredUser({
        user_id: response.user_id,
        role: response.role,
    });

    return response;
}

/**
 * Fetch the current user's profile.
 * Token must be set before calling.
 */
export async function getMe(): Promise<MeResponse> {
    return apiRequest<MeResponse>({
        method: 'GET',
        path: '/api/me',
    });
}

/**
 * Logout — clear all stored auth state.
 */
export function logout(): void {
    clearToken();
}
