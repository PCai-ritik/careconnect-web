"use client";

import { useEffect, useState } from "react";
import { apiRequest, getToken } from "@/lib/api";
import { Loader2, Save, Globe, Paintbrush, ToggleLeft, ToggleRight, Sparkles, Phone, Eye, UploadCloud, Image, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { applyBranding } from "@/lib/theme";

interface TenantFeatures {
    ai_summaries: boolean;
    whatsapp_enabled: boolean;
    whatsapp_api_key: string | null;
}

interface WhiteLabelConfig {
    primary_color: string;
    heading_font?: string | null;
    body_font?: string | null;
    logo_url: string | null;
    platform_name: string | null;
    waiting_room_msg: string | null;
    features: TenantFeatures;
}

interface BrandingData {
    id: string;
    name: string;
    brand_color: string;
    logo_url: string | null;
    domain: string | null;
    subdomain: string | null;
    white_label_config: WhiteLabelConfig;
}

export default function BrandingPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [logoError, setLogoError] = useState<string | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [domain, setDomain] = useState("");
    const [subdomain, setSubdomain] = useState("");
    
    // white label config states
    const [primaryColor, setPrimaryColor] = useState("#4F46E5");
    const [headingFont, setHeadingFont] = useState("");
    const [bodyFont, setBodyFont] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [platformName, setPlatformName] = useState("");
    const [waitingRoomMsg, setWaitingRoomMsg] = useState("");
    
    // features
    const [aiSummaries, setAiSummaries] = useState(false);
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [whatsappApiKey, setWhatsappApiKey] = useState("");

    // Logo upload states
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const data = await apiRequest<BrandingData>({
                    method: "GET",
                    path: "/admin/branding",
                });
                
                setName(data.name || "");
                setDomain(data.domain || "");
                setSubdomain(data.subdomain || "");

                const config = data.white_label_config || {};
                setPrimaryColor(config.primary_color || "#4F46E5");
                setHeadingFont(config.heading_font || "");
                setBodyFont(config.body_font || "");
                setLogoUrl(config.logo_url || "");
                setPlatformName(config.platform_name || "");
                setWaitingRoomMsg(config.waiting_room_msg || "");

                const feats = config.features || {};
                setAiSummaries(feats.ai_summaries || false);
                setWhatsappEnabled(feats.whatsapp_enabled || false);
                setWhatsappApiKey(feats.whatsapp_api_key || "");
            } catch (err: any) {
                setError(err.message || "Failed to load branding settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchBranding();
    }, []);

    // Live preview fonts hook
    useEffect(() => {
        if (headingFont || bodyFont) {
            const families = [];
            if (headingFont) families.push(`family=${headingFont.replace(/ /g, '+')}:wght@400;500;600;700;800`);
            if (bodyFont && bodyFont !== headingFont) families.push(`family=${bodyFont.replace(/ /g, '+')}:wght@400;500;600;700;800`);
            
            if (families.length > 0) {
                const fontUrl = `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
                let link = document.getElementById("mockup-preview-font") as HTMLLinkElement;
                if (link && link.href !== fontUrl) {
                    link.remove();
                    link = null as any;
                }
                if (!link) {
                    link = document.createElement("link");
                    link.id = "mockup-preview-font";
                    link.rel = "stylesheet";
                    link.href = fontUrl;
                    document.head.appendChild(link);
                }
            }
        } else {
            const link = document.getElementById("mockup-preview-font");
            if (link) link.remove();
        }
    }, [headingFont, bodyFont]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setLogoError("Please select a valid image file.");
            return;
        }

        setUploadingLogo(true);
        setLogoError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = getToken();
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
            const res = await fetch(`${apiBaseUrl}/admin/upload-logo`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ detail: "Upload failed" }));
                throw new Error(errData.detail || "Failed to upload logo.");
            }

            const data = await res.json();
            setLogoUrl(data.logo_url);
        } catch (err: any) {
            setLogoError(err.message || "An error occurred during upload.");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg(null);

        const payload = {
            name: name.trim() || null,
            domain: domain.trim() || null,
            subdomain: subdomain.trim() || null,
            white_label_config: {
                primary_color: primaryColor,
                heading_font: headingFont || null,
                body_font: bodyFont || null,
                logo_url: logoUrl.trim() || null,
                platform_name: platformName.trim() || null,
                waiting_room_msg: waitingRoomMsg.trim() || null,
                features: {
                    ai_summaries: aiSummaries,
                    whatsapp_enabled: whatsappEnabled,
                    whatsapp_api_key: whatsappApiKey.trim() || null,
                }
            }
        };

        try {
            const updated = await apiRequest<BrandingData>({
                method: "PUT",
                path: "/admin/branding",
                body: payload as any,
            });

            setSuccessMsg("Branding updated successfully!");
            setShowSaveModal(true);
            
            // Proactively update active browser variables
            applyBranding({
                name: updated.white_label_config?.platform_name || updated.name,
                brand_color: updated.white_label_config?.primary_color || updated.brand_color || "#4F46E5",
                logo_url: updated.white_label_config?.logo_url || updated.logo_url || null,
                white_label_config: updated.white_label_config,
            });
        } catch (err: any) {
            setError(err.message || "Failed to update configurations.");
        } finally {
            setSaving(false);
        }
    };

    const handleResetDefaults = async () => {
        if (!confirm("Are you sure you want to reset all branding to default CareConnect settings?")) return;
        
        setSaving(true);
        setError(null);
        setSuccessMsg(null);

        const payload = {
            name: null,
            domain: null,
            subdomain: null,
            white_label_config: {
                primary_color: "#4F46E5",
                heading_font: null,
                body_font: null,
                logo_url: null,
                platform_name: null,
                waiting_room_msg: null,
                features: {
                    ai_summaries: false,
                    whatsapp_enabled: false,
                    whatsapp_api_key: null,
                }
            }
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/admin/branding`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to reset configurations.");
            const data = await res.json();

            // Update states
            setName("");
            setDomain("");
            setSubdomain("");
            setPrimaryColor("#4F46E5");
            setHeadingFont("");
            setBodyFont("");
            setLogoUrl("");
            setPlatformName("");
            setWaitingRoomMsg("");
            setAiSummaries(false);
            setWhatsappEnabled(false);
            setWhatsappApiKey("");

            setSuccessMsg("Reset to default configurations.");
            setShowSaveModal(true);
            applyBranding({
                name: data.name,
                brand_color: data.brand_color || "#4F46E5",
                logo_url: data.logo_url || null,
                white_label_config: data.white_label_config,
            });
        } catch (err: any) {
            setError(err.message || "Failed to reset configurations.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-sm text-gray-500 font-medium">Fetching branding profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Header Title */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Branding Customization</h1>
                <p className="text-sm text-gray-500 mt-2">
                    Personalize your domain, coloring, logo, waiting room message, and specialized feature flags.
                </p>
            </div>

            {/* Notifications */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-fade-in shadow-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Inputs (Left & Center columns) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Domain & Subdomain Card */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-5">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <h2 className="text-base font-bold text-gray-900">Custom Domains & Hosting</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="St. Mary Hospital"
                                    className="w-full h-10 bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 text-sm transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Domain</label>
                                <input
                                    type="text"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    placeholder="stmary.careconnect.com"
                                    className="w-full h-10 bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 text-sm transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subdomain Prefix</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={subdomain}
                                        onChange={(e) => setSubdomain(e.target.value)}
                                        placeholder="stmary"
                                        className="w-full h-10 bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl pl-4 pr-32 text-sm transition-all outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium bg-gray-100 py-1 px-2.5 rounded-lg">
                                        .careconnect.com
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Styling Config Card */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-5">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <h2 className="text-base font-bold text-gray-900">Coloring & Identity</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Primary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-12 h-10 p-1 bg-gray-50 border border-gray-200/80 rounded-xl cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="flex-1 h-10 bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 text-sm uppercase transition-all outline-none font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Heading Font</label>
                                <select
                                    value={headingFont}
                                    onChange={(e) => setHeadingFont(e.target.value)}
                                    className="w-full h-10 bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 text-sm transition-all outline-none"
                                >
                                    <option value="">Default (Spline Sans)</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Outfit">Outfit</option>
                                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Playfair Display">Playfair Display</option>
                                    <option value="Merriweather">Merriweather</option>
                                    <option value="Lora">Lora</option>
                                    <option value="Space Grotesk">Space Grotesk</option>
                                    <option value="Fira Sans">Fira Sans</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Body Font</label>
                                <select
                                    value={bodyFont}
                                    onChange={(e) => setBodyFont(e.target.value)}
                                    className="w-full h-10 bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 text-sm transition-all outline-none"
                                >
                                    <option value="">Default (Spline Sans)</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Outfit">Outfit</option>
                                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Playfair Display">Playfair Display</option>
                                    <option value="Merriweather">Merriweather</option>
                                    <option value="Lora">Lora</option>
                                    <option value="Space Grotesk">Space Grotesk</option>
                                    <option value="Fira Sans">Fira Sans</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform Title (Platform Name)</label>
                                <input
                                    type="text"
                                    value={platformName}
                                    onChange={(e) => setPlatformName(e.target.value)}
                                    placeholder="St. Mary Patient Hub"
                                    className="w-full h-10 bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 text-sm transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital Logo</label>
                                {logoError && (
                                    <p className="text-xs font-semibold text-red-500">{logoError}</p>
                                )}
                                
                                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gray-200/80 bg-gray-50/50 rounded-2xl">
                                    {/* Current Logo Preview */}
                                    <div className="relative w-full sm:w-32 h-20 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-inner group shrink-0">
                                        {logoUrl ? (
                                            <>
                                                <img src={logoUrl} alt="Hospital Logo" className="max-w-full max-h-full object-contain p-2" />
                                                <button
                                                    type="button"
                                                    onClick={() => setLogoUrl("")}
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                                                    title="Remove Logo"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-400" />
                                                </button>
                                            </>
                                        ) : (
                                            <Image className="w-8 h-8 text-gray-300" />
                                        )}
                                        
                                        {uploadingLogo && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Action description & upload button */}
                                    <div className="flex-1 space-y-2 text-center sm:text-left">
                                        <p className="text-sm font-semibold text-gray-700">
                                            {logoUrl ? "Logo uploaded successfully" : "Upload your hospital logo"}
                                        </p>
                                        <p className="text-xs text-gray-400 font-medium">
                                            Supports PNG, JPEG, or WEBP. Max size 2MB.
                                        </p>
                                        
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                            <label className="inline-flex items-center gap-2 h-9 px-4 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm text-xs font-semibold text-gray-700 rounded-xl cursor-pointer transition-all active:scale-95">
                                                <UploadCloud className="w-4 h-4 text-indigo-500" />
                                                <span>{logoUrl ? "Change logo" : "Choose file"}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    disabled={uploadingLogo}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Waiting Room Message</label>
                                <textarea
                                    value={waitingRoomMsg}
                                    onChange={(e) => setWaitingRoomMsg(e.target.value)}
                                    placeholder="Welcome to our virtual clinic. Please wait for a few moments..."
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl p-4 text-sm transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features Toggle Card */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-5">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <h2 className="text-base font-bold text-gray-900">Feature Activation</h2>
                        </div>
                        <div className="space-y-4">
                            {/* AI Summaries */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mt-0.5">
                                        <Sparkles className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">AI Medical Consultation Summaries</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Enable auto-generation of clinical notes after telehealth calls.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAiSummaries(!aiSummaries)}
                                    className="text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                                >
                                    {aiSummaries ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-gray-300" />}
                                </button>
                            </div>

                            {/* WhatsApp notifications */}
                            <div className="flex flex-col gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
                                            <Phone className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">WhatsApp Notification Alerts</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Broadcast appointment schedules and summaries directly to patients via WhatsApp.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                                        className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                                    >
                                        {whatsappEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-gray-300" />}
                                    </button>
                                </div>
                                {whatsappEnabled && (
                                    <div className="space-y-1.5 mt-2 animate-slide-down">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp Business Api Key</label>
                                        <input
                                            type="password"
                                            value={whatsappApiKey}
                                            onChange={(e) => setWhatsappApiKey(e.target.value)}
                                            placeholder="Enter your API token..."
                                            className="w-full h-10 bg-white border border-gray-200/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-4 text-sm transition-all outline-none font-mono"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column: Live Preview */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sticky top-24 space-y-5">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <h2 className="text-base font-bold text-gray-900">Live Mockup Preview</h2>
                        </div>

                        {/* Interactive Preview Mock */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-inner bg-slate-50 p-4">
                            <div 
                                className="bg-white rounded-lg shadow-sm border border-gray-200/60 p-4 space-y-4"
                                style={{ fontFamily: bodyFont ? `"${bodyFont}", sans-serif` : undefined }}
                            >
                                {/* Header section with Mock logo and name */}
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-10 h-10 rounded bg-transparent flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden"
                                        style={!logoUrl ? { backgroundColor: primaryColor } : {}}
                                    >
                                        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" /> : (platformName ? platformName.substring(0,2) : name.substring(0,2))}
                                    </div>
                                    <span 
                                        className="text-xs font-bold text-gray-800 truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
                                        style={{ fontFamily: headingFont ? `"${headingFont}", sans-serif` : undefined }}
                                    >
                                        {platformName || name || "CareConnect"}
                                    </span>
                                </div>

                                {/* Mock card content styling */}
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center space-y-2">
                                    <p className="text-[10px] text-gray-500 font-medium max-w-[200px] mx-auto leading-relaxed italic">
                                        "{waitingRoomMsg || "Waiting room greetings will be displayed here..."}"
                                    </p>
                                </div>

                                {/* Mock Actions */}
                                <div className="space-y-1.5">
                                    <button 
                                        type="button"
                                        style={{ backgroundColor: primaryColor }}
                                        className="w-full py-1.5 rounded-md text-[10px] text-white font-semibold transition-all hover:brightness-95 cursor-default"
                                    >
                                        Patient Portal Access
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Save Changes button */}
                        <button
                            type="submit"
                            disabled={saving}
                            style={{ backgroundColor: primaryColor }}
                            className="w-full py-3 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:translate-y-0.5 cursor-pointer"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Configurations"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Persistent Save Confirmation Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Configurations Saved</h3>
                        <p className="text-sm text-gray-500 mb-6">{successMsg}</p>
                        <button
                            type="button"
                            onClick={() => setShowSaveModal(false)}
                            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
