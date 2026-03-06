export interface ThemePreset {
    id: string;
    label: string;
    emoji: string;
    /** CSS value for --primary (oklch) */
    primary: string;
    /** CSS value for --primary (dark mode oklch) */
    primaryDark: string;
    /** 5 orb rgba colors (light) */
    orbs: [string, string, string, string, string];
    /** 5 orb rgba colors (dark) */
    orbsDark: [string, string, string, string, string];
    /** Preview gradient for the picker swatch */
    preview: string;
}

export const THEME_PRESETS: ThemePreset[] = [
    {
        id: "violet",
        label: "Violet",
        emoji: "🔮",
        primary: "oklch(0.48 0.22 265)",
        primaryDark: "oklch(0.72 0.18 265)",
        orbs: [
            "rgba(139,92,246,0.22)", "rgba(99,102,241,0.18)",
            "rgba(236,72,153,0.15)", "rgba(34,197,94,0.12)", "rgba(59,130,246,0.08)",
        ],
        orbsDark: [
            "rgba(139,92,246,0.30)", "rgba(99,102,241,0.25)",
            "rgba(236,72,153,0.20)", "rgba(34,197,94,0.15)", "rgba(59,130,246,0.12)",
        ],
        preview: "linear-gradient(135deg, #8b5cf6, #6366f1, #ec4899)",
    },
    {
        id: "ocean",
        label: "Ocean",
        emoji: "🌊",
        primary: "oklch(0.50 0.18 215)",
        primaryDark: "oklch(0.72 0.16 215)",
        orbs: [
            "rgba(6,182,212,0.22)", "rgba(14,165,233,0.18)",
            "rgba(20,184,166,0.15)", "rgba(99,102,241,0.12)", "rgba(59,130,246,0.08)",
        ],
        orbsDark: [
            "rgba(6,182,212,0.30)", "rgba(14,165,233,0.25)",
            "rgba(20,184,166,0.20)", "rgba(99,102,241,0.15)", "rgba(59,130,246,0.12)",
        ],
        preview: "linear-gradient(135deg, #06b6d4, #0ea5e9, #14b8a6)",
    },
    {
        id: "sunset",
        label: "Sunset",
        emoji: "🌅",
        primary: "oklch(0.55 0.20 30)",
        primaryDark: "oklch(0.75 0.18 30)",
        orbs: [
            "rgba(249,115,22,0.22)", "rgba(239,68,68,0.18)",
            "rgba(236,72,153,0.15)", "rgba(234,179,8,0.12)", "rgba(249,115,22,0.08)",
        ],
        orbsDark: [
            "rgba(249,115,22,0.30)", "rgba(239,68,68,0.25)",
            "rgba(236,72,153,0.20)", "rgba(234,179,8,0.15)", "rgba(249,115,22,0.12)",
        ],
        preview: "linear-gradient(135deg, #f97316, #ef4444, #ec4899)",
    },
    {
        id: "forest",
        label: "Forest",
        emoji: "🌿",
        primary: "oklch(0.48 0.16 155)",
        primaryDark: "oklch(0.70 0.16 155)",
        orbs: [
            "rgba(34,197,94,0.22)", "rgba(20,184,166,0.18)",
            "rgba(16,185,129,0.15)", "rgba(132,204,22,0.12)", "rgba(6,182,212,0.08)",
        ],
        orbsDark: [
            "rgba(34,197,94,0.30)", "rgba(20,184,166,0.25)",
            "rgba(16,185,129,0.20)", "rgba(132,204,22,0.15)", "rgba(6,182,212,0.12)",
        ],
        preview: "linear-gradient(135deg, #22c55e, #14b8a6, #84cc16)",
    },
    {
        id: "rose",
        label: "Cherry",
        emoji: "🌸",
        primary: "oklch(0.52 0.22 355)",
        primaryDark: "oklch(0.74 0.18 355)",
        orbs: [
            "rgba(244,63,94,0.22)", "rgba(236,72,153,0.18)",
            "rgba(251,113,133,0.15)", "rgba(192,38,211,0.12)", "rgba(249,115,22,0.08)",
        ],
        orbsDark: [
            "rgba(244,63,94,0.30)", "rgba(236,72,153,0.25)",
            "rgba(251,113,133,0.20)", "rgba(192,38,211,0.15)", "rgba(249,115,22,0.12)",
        ],
        preview: "linear-gradient(135deg, #f43f5e, #ec4899, #c026d3)",
    },
    {
        id: "gold",
        label: "Gold",
        emoji: "✨",
        primary: "oklch(0.58 0.16 75)",
        primaryDark: "oklch(0.78 0.14 75)",
        orbs: [
            "rgba(234,179,8,0.22)", "rgba(249,115,22,0.18)",
            "rgba(251,191,36,0.15)", "rgba(245,158,11,0.12)", "rgba(132,204,22,0.08)",
        ],
        orbsDark: [
            "rgba(234,179,8,0.30)", "rgba(249,115,22,0.25)",
            "rgba(251,191,36,0.20)", "rgba(245,158,11,0.15)", "rgba(132,204,22,0.12)",
        ],
        preview: "linear-gradient(135deg, #eab308, #f97316, #fbbf24)",
    },
    {
        id: "minimal",
        label: "Minimal",
        emoji: "⬜",
        primary: "oklch(0.40 0.02 255)",
        primaryDark: "oklch(0.75 0.02 255)",
        orbs: [
            "rgba(148,163,184,0.10)", "rgba(148,163,184,0.08)",
            "rgba(148,163,184,0.08)", "rgba(148,163,184,0.06)", "rgba(148,163,184,0.04)",
        ],
        orbsDark: [
            "rgba(148,163,184,0.12)", "rgba(148,163,184,0.10)",
            "rgba(148,163,184,0.08)", "rgba(148,163,184,0.06)", "rgba(148,163,184,0.05)",
        ],
        preview: "linear-gradient(135deg, #94a3b8, #cbd5e1, #94a3b8)",
    },
];

export const DEFAULT_THEME_ID = "violet";
export const STORAGE_KEY = "hm-theme";

export interface StoredTheme {
    presetId: string;
}

export function loadTheme(): StoredTheme {
    if (typeof window === "undefined") return { presetId: DEFAULT_THEME_ID };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return { presetId: DEFAULT_THEME_ID };
}

export function saveTheme(t: StoredTheme) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

export function applyTheme(preset: ThemePreset, isDark: boolean) {
    const root = document.documentElement;
    const orbs = isDark ? preset.orbsDark : preset.orbs;
    root.style.setProperty("--orb-1", orbs[0]);
    root.style.setProperty("--orb-2", orbs[1]);
    root.style.setProperty("--orb-3", orbs[2]);
    root.style.setProperty("--orb-4", orbs[3]);
    root.style.setProperty("--orb-5", orbs[4]);
    root.style.setProperty("--primary", isDark ? preset.primaryDark : preset.primary);
    // ring follows primary
    root.style.setProperty("--ring", (isDark ? preset.primaryDark : preset.primary).replace(")", " / 0.5)").replace("oklch(", "oklch("));
}
