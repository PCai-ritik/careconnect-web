/**
 * CareConnect Web — White-Label Theme Initializer
 *
 * Fetches hospital branding from the API and applies it as CSS custom properties.
 * This enables dynamic white-labelling: once branding is set, all components
 * that use `var(--brand-primary)` automatically adopt the hospital's colors.
 *
 * Call `initBranding(hospitalId)` on app mount / after login.
 * Call `getHospitalBranding()` to fetch without applying.
 */

import { apiRequest } from './api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HospitalBranding {
    name: string;
    brand_color: string;
    logo_url: string | null;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_BRANDING: HospitalBranding = {
    name: 'CareConnect',
    brand_color: '#4F46E5',
    logo_url: null,
};

// Module-level cache
let currentBranding: HospitalBranding = DEFAULT_BRANDING;

// ─── API ────────────────────────────────────────────────────────────────────

/**
 * Fetch hospital branding from the API.
 */
export async function getHospitalBranding(hospitalId: string): Promise<HospitalBranding> {
    try {
        return await apiRequest<HospitalBranding>({
            method: 'GET',
            path: `/hospitals/${hospitalId}/branding`,
        });
    } catch (error) {
        console.warn('[Theme] Failed to fetch branding, using defaults:', error);
        return DEFAULT_BRANDING;
    }
}

// ─── CSS Variable Application ───────────────────────────────────────────────

/**
 * Parse a hex color into RGB components for alpha compositing.
 * e.g. "#4F46E5" → "79, 70, 229"
 */
function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '79, 70, 229'; // fallback to default indigo
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * Darken a hex color by a percentage (for hover states).
 * e.g. darken("#4F46E5", 10) → darker shade
 */
function darkenHex(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
    const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Apply branding as CSS custom properties on :root.
 */
export function applyBranding(branding: HospitalBranding): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const rgb = hexToRgb(branding.brand_color);
    const hover = darkenHex(branding.brand_color, 8);

    root.style.setProperty('--brand-primary', branding.brand_color);
    root.style.setProperty('--brand-primary-rgb', rgb);
    root.style.setProperty('--brand-primary-hover', hover);
    root.style.setProperty('--brand-name', branding.name);
    if (branding.logo_url) {
        root.style.setProperty('--brand-logo', `url(${branding.logo_url})`);
    }

    currentBranding = branding;
}

/**
 * Fetch branding from the API and apply it. Full init flow.
 */
export async function initBranding(hospitalId: string): Promise<HospitalBranding> {
    const branding = await getHospitalBranding(hospitalId);
    applyBranding(branding);
    return branding;
}

/**
 * Apply default branding (used when no hospital context is available).
 */
export function applyDefaultBranding(): void {
    applyBranding(DEFAULT_BRANDING);
}

/**
 * Get the currently active branding.
 */
export function getCurrentBranding(): HospitalBranding {
    return currentBranding;
}
