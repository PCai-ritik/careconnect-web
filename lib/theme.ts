/**
 * CareConnect Web — White-Label Theme Initializer
 *
 * Fetches hospital branding from the API and applies it as CSS custom properties.
 * This enables dynamic white-labelling: once branding is set, all components
 * that use `var(--brand-primary)` automatically adopt the hospital's colors.
 *
 * FOUC Prevention: Branding is cached in localStorage and applied synchronously
 * on module load, before React mounts. This eliminates the flash of default styles.
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
    white_label_config?: {
        heading_font?: string | null;
        body_font?: string | null;
        waiting_room_msg?: string | null;
    };
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CACHE_KEY = 'careconnect_branding_cache';

export const DEFAULT_BRANDING: HospitalBranding = {
    name: 'CareConnect',
    brand_color: '#4F46E5',
    logo_url: null,
};

// Module-level cache
let currentBranding: HospitalBranding = DEFAULT_BRANDING;

// ─── localStorage Cache ─────────────────────────────────────────────────────

function getCachedBranding(): HospitalBranding | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as HospitalBranding;
    } catch {
        return null;
    }
}

function setCachedBranding(branding: HospitalBranding): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(branding));
        // Also persist as a cookie for Next.js SSR
        document.cookie = `careconnect_branding=${encodeURIComponent(JSON.stringify(branding))}; path=/; max-age=31536000`;
    } catch {
        // Silently ignore storage errors (private browsing, quota, etc.)
    }
}

export function clearCachedBranding(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(CACHE_KEY);
        document.cookie = `careconnect_branding=; path=/; max-age=0`;
    } catch {
        // Silently ignore
    }
}

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
export function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '79, 70, 229'; // fallback to default indigo
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * Darken a hex color by a percentage (for hover states).
 * e.g. darken("#4F46E5", 10) → darker shade
 */
export function darkenHex(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
    const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Generate CSS properties representing the branding.
 * Suitable for inline styles on the <html> tag during SSR.
 */
export function getBrandingStyle(branding: HospitalBranding): React.CSSProperties {
    const rgb = hexToRgb(branding.brand_color);
    const hover = darkenHex(branding.brand_color, 8);

    const style: Record<string, string> = {
        '--brand-primary': branding.brand_color,
        '--brand-primary-rgb': rgb,
        '--brand-primary-hover': hover,
        '--brand-name': branding.name,
        '--brand-name-content': `"${branding.name}"`,
    };

    if (branding.logo_url) {
        style['--brand-logo'] = `url(${branding.logo_url})`;
        style['--show-custom-logo'] = 'block';
        style['--show-default-logo'] = 'none';
    } else {
        style['--show-custom-logo'] = 'none';
        style['--show-default-logo'] = 'block';
    }

    return style as React.CSSProperties;
}

/**
 * Apply branding as CSS custom properties on :root.
 * Also caches branding to localStorage for instant application on next load.
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
    root.style.setProperty('--brand-name-content', `"${branding.name}"`);
    document.title = branding.name;
    if (branding.logo_url) {
        root.style.setProperty('--brand-logo', `url(${branding.logo_url})`);
        root.style.setProperty('--show-custom-logo', 'block');
        root.style.setProperty('--show-default-logo', 'none');
    } else {
        root.style.removeProperty('--brand-logo');
        root.style.setProperty('--show-custom-logo', 'none');
        root.style.setProperty('--show-default-logo', 'block');
    }

    // Apply dynamic fonts
    const headingFont = branding.white_label_config?.heading_font;
    const bodyFont = branding.white_label_config?.body_font;

    if (headingFont || bodyFont) {
        const families = [];
        if (headingFont) families.push(`family=${headingFont.replace(/ /g, '+')}:wght@400;500;600;700;800`);
        if (bodyFont && bodyFont !== headingFont) families.push(`family=${bodyFont.replace(/ /g, '+')}:wght@400;500;600;700;800`);
        
        if (families.length > 0) {
            const fontUrl = `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
            
            let link = document.getElementById("dynamic-tenant-font") as HTMLLinkElement;
            if (link && link.href !== fontUrl) {
                link.remove();
                link = null as any;
            }
            if (!link) {
                link = document.createElement("link");
                link.id = "dynamic-tenant-font";
                link.rel = "stylesheet";
                link.href = fontUrl;
                document.head.appendChild(link);
            }
        }
    } else {
        const link = document.getElementById("dynamic-tenant-font");
        if (link) {
            link.remove();
        }
    }

    if (headingFont) {
        root.style.setProperty('--font-heading-custom', `"${headingFont}", sans-serif`);
    } else {
        root.style.removeProperty('--font-heading-custom');
    }

    if (bodyFont) {
        root.style.setProperty('--font-body-custom', `"${bodyFont}", sans-serif`);
    } else {
        root.style.removeProperty('--font-body-custom');
    }

    currentBranding = branding;

    // Cache for instant application on next page load (FOUC prevention)
    setCachedBranding(branding);

    window.dispatchEvent(
        new CustomEvent('brandingUpdated', { detail: branding })
    );
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
    clearCachedBranding();
    applyBranding(DEFAULT_BRANDING);
}

/**
 * Get the currently active branding.
 */
export function getCurrentBranding(): HospitalBranding {
    return currentBranding;
}

// ─── Synchronous FOUC Prevention ────────────────────────────────────────────
// On module load, immediately apply any cached branding BEFORE React mounts.
// This runs synchronously when the JS bundle is first parsed.

if (typeof window !== 'undefined') {
    const cached = getCachedBranding();
    if (cached && cached.brand_color !== DEFAULT_BRANDING.brand_color) {
        applyBranding(cached);
    }
}
