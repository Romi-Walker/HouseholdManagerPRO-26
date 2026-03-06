"use client";

import { useEffect, useState } from "react";
import { Palette, X, Check } from "lucide-react";
import {
    THEME_PRESETS,
    DEFAULT_THEME_ID,
    loadTheme,
    saveTheme,
    applyTheme,
    type ThemePreset,
} from "@/lib/theme-store";
import { Button } from "@/components/ui/button";

export function ThemeCustomizer() {
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState(DEFAULT_THEME_ID);

    // Apply saved theme on mount
    useEffect(() => {
        const stored = loadTheme();
        setActiveId(stored.presetId);
        const preset = THEME_PRESETS.find((p) => p.id === stored.presetId);
        if (preset) {
            const isDark = document.documentElement.classList.contains("dark");
            applyTheme(preset, isDark);
        }
    }, []);

    // Re-apply when dark mode changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const preset = THEME_PRESETS.find((p) => p.id === activeId);
            if (preset) {
                const isDark = document.documentElement.classList.contains("dark");
                applyTheme(preset, isDark);
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, [activeId]);

    function selectPreset(preset: ThemePreset) {
        setActiveId(preset.id);
        saveTheme({ presetId: preset.id });
        const isDark = document.documentElement.classList.contains("dark");
        applyTheme(preset, isDark);
    }

    return (
        <>
            {/* Toggle button — bottom right */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Theme anpassen"
                className="no-print fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 size-11 rounded-full glass shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
                <Palette className="size-5 text-primary" />
            </button>

            {/* Panel */}
            {open && (
                <div className="no-print fixed bottom-40 right-4 lg:bottom-20 lg:right-6 z-50 w-64 glass rounded-2xl shadow-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Design anpassen</span>
                        <button
                            onClick={() => setOpen(false)}
                            className="size-6 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <X className="size-3.5" />
                        </button>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">Farbschema wählen</p>

                    <div className="grid grid-cols-4 gap-2">
                        {THEME_PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => selectPreset(preset)}
                                title={preset.label}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div
                                    className="size-11 rounded-xl relative flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 active:scale-95"
                                    style={{ background: preset.preview }}
                                >
                                    {activeId === preset.id && (
                                        <Check className="size-4 text-white drop-shadow" />
                                    )}
                                </div>
                                <span className="text-[10px] text-muted-foreground leading-none">
                                    {preset.emoji}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/30 dark:border-white/10">
                        <p className="text-xs text-muted-foreground text-center">
                            {THEME_PRESETS.find((p) => p.id === activeId)?.label ?? ""}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
