"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, updatePassword, deleteAccount } from "@/lib/profile/actions";
import { createCategory, deleteCategory } from "@/lib/categories/actions";
import { cn } from "@/lib/utils";
import {
    Loader2, User, Shield, Tag, AlertTriangle, Plus, Trash2, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { Category } from "@/types";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const profileSchema = z.object({
    full_name: z.string().min(1, "Name ist erforderlich"),
});

const passwordSchema = z
    .object({
        new_password: z.string().min(8, "Mindestens 8 Zeichen"),
        confirm_password: z.string(),
    })
    .refine((d) => d.new_password === d.confirm_password, {
        message: "Passwörter stimmen nicht überein",
        path: ["confirm_password"],
    });

const categorySchema = z.object({
    name: z.string().min(1, "Name ist erforderlich"),
    type: z.enum(["income", "expense"]),
});

const PRESET_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#6b7280",
    "#ef4444", "#a855f7", "#64748b",
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

    // ── Data ──────────────────────────────────────────────────────────────────

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        },
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("type", { ascending: true })
                .order("name", { ascending: true });
            if (error) throw error;
            return data as Category[];
        },
    });

    // ── Forms ─────────────────────────────────────────────────────────────────

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        values: { full_name: user?.user_metadata?.full_name || "" },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { new_password: "", confirm_password: "" },
    });

    const categoryForm = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "", type: "expense" },
    });

    // ── Mutations ─────────────────────────────────────────────────────────────

    const profileMutation = useMutation({
        mutationFn: (v: z.infer<typeof profileSchema>) => updateProfile(v.full_name),
        onSuccess: (res: any) => {
            if (res?.error) return;
            queryClient.invalidateQueries({ queryKey: ["user"] });
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        },
    });

    const passwordMutation = useMutation({
        mutationFn: (v: z.infer<typeof passwordSchema>) => updatePassword(v.new_password),
        onSuccess: (res: any) => {
            if (res?.error) return;
            passwordForm.reset();
            setPasswordSuccess(true);
            setTimeout(() => setPasswordSuccess(false), 3000);
        },
    });

    const addCategoryMutation = useMutation({
        mutationFn: (v: z.infer<typeof categorySchema>) =>
            createCategory({ ...v, color: newCategoryColor, icon: "Tag", is_default: false }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            categoryForm.reset();
            setNewCategoryColor(PRESET_COLORS[0]);
            setIsAddingCategory(false);
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });

    const deleteAccountMutation = useMutation({
        mutationFn: deleteAccount,
        onSuccess: (res: any) => {
            if (res?.error) {
                setDeleteAccountError(res.error);
                setDeleteConfirmOpen(false);
            }
        },
        onError: () => {
            setDeleteConfirmOpen(false);
        },
    });

    // ── Helpers ───────────────────────────────────────────────────────────────

    const expenseCategories = categories?.filter((c) => c.type === "expense") || [];
    const incomeCategories = categories?.filter((c) => c.type === "income") || [];

    const profileError = (profileMutation.data as any)?.error;
    const passwordError = (passwordMutation.data as any)?.error;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Einstellungen</h1>
                <p className="text-muted-foreground">Verwalte dein Konto und deine Präferenzen.</p>
            </div>

            <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">
                        <User className="mr-1.5 h-4 w-4" /> Profil
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield className="mr-1.5 h-4 w-4" /> Sicherheit
                    </TabsTrigger>
                    <TabsTrigger value="categories">
                        <Tag className="mr-1.5 h-4 w-4" /> Kategorien
                    </TabsTrigger>
                    <TabsTrigger value="account">
                        <AlertTriangle className="mr-1.5 h-4 w-4" /> Konto
                    </TabsTrigger>
                </TabsList>

                {/* ── PROFIL ── */}
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profilinformationen</CardTitle>
                            <CardDescription>Dein Name und deine E-Mail-Adresse.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...profileForm}>
                                <form
                                    onSubmit={profileForm.handleSubmit((v) => profileMutation.mutate(v))}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={profileForm.control}
                                        name="full_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Dein vollständiger Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">E-Mail</p>
                                        <p className="text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted/50">
                                            {user?.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Die E-Mail-Adresse kann nicht geändert werden.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-1">
                                        <Button type="submit" disabled={profileMutation.isPending}>
                                            {profileMutation.isPending && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Speichern
                                        </Button>
                                        {profileSuccess && (
                                            <span className="text-sm text-green-600 flex items-center gap-1">
                                                <Check className="h-4 w-4" /> Gespeichert
                                            </span>
                                        )}
                                        {profileError && (
                                            <span className="text-sm text-destructive">{profileError}</span>
                                        )}
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── SICHERHEIT ── */}
                <TabsContent value="security" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Passwort ändern</CardTitle>
                            <CardDescription>Lege ein neues Passwort für dein Konto fest.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...passwordForm}>
                                <form
                                    onSubmit={passwordForm.handleSubmit((v) => passwordMutation.mutate(v))}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={passwordForm.control}
                                        name="new_password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Neues Passwort</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Mindestens 8 Zeichen"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirm_password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Passwort bestätigen</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Passwort wiederholen"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex items-center gap-3 pt-1">
                                        <Button type="submit" disabled={passwordMutation.isPending}>
                                            {passwordMutation.isPending && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Passwort ändern
                                        </Button>
                                        {passwordSuccess && (
                                            <span className="text-sm text-green-600 flex items-center gap-1">
                                                <Check className="h-4 w-4" /> Passwort geändert
                                            </span>
                                        )}
                                        {passwordError && (
                                            <span className="text-sm text-destructive">{passwordError}</span>
                                        )}
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── KATEGORIEN ── */}
                <TabsContent value="categories" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle>Kategorien verwalten</CardTitle>
                                <CardDescription>Eigene Kategorien hinzufügen oder entfernen.</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsAddingCategory((v) => !v)}>
                                <Plus className="mr-1 h-4 w-4" /> Neu
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Add form */}
                            {isAddingCategory && (
                                <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                                    <p className="text-sm font-semibold">Neue Kategorie</p>
                                    <Form {...categoryForm}>
                                        <form
                                            onSubmit={categoryForm.handleSubmit((v) =>
                                                addCategoryMutation.mutate(v)
                                            )}
                                            className="space-y-3"
                                        >
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField
                                                    control={categoryForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="z.B. Haustier" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={categoryForm.control}
                                                    name="type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Typ</FormLabel>
                                                            <div className="flex gap-2 pt-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant={
                                                                        field.value === "expense"
                                                                            ? "default"
                                                                            : "outline"
                                                                    }
                                                                    onClick={() => field.onChange("expense")}
                                                                >
                                                                    Ausgabe
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant={
                                                                        field.value === "income"
                                                                            ? "default"
                                                                            : "outline"
                                                                    }
                                                                    onClick={() => field.onChange("income")}
                                                                >
                                                                    Einnahme
                                                                </Button>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-sm font-medium">Farbe</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {PRESET_COLORS.map((color) => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() => setNewCategoryColor(color)}
                                                            className={cn(
                                                                "h-6 w-6 rounded-full transition-transform hover:scale-110",
                                                                newCategoryColor === color &&
                                                                    "ring-2 ring-offset-2 ring-foreground scale-110"
                                                            )}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={addCategoryMutation.isPending}
                                                >
                                                    {addCategoryMutation.isPending && (
                                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                    )}
                                                    Hinzufügen
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setIsAddingCategory(false)}
                                                >
                                                    Abbrechen
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            )}

                            {/* Expense categories */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    Ausgaben
                                </p>
                                <div className="space-y-0.5">
                                    {expenseCategories.length === 0 && (
                                        <p className="text-sm text-muted-foreground py-2">Keine Ausgaben-Kategorien.</p>
                                    )}
                                    {expenseCategories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-black/6 dark:hover:bg-white/8"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="h-3 w-3 rounded-full shrink-0"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                <span className="text-sm">{cat.name}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => deleteCategoryMutation.mutate(cat.id)}
                                                disabled={deleteCategoryMutation.isPending}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-border" />

                            {/* Income categories */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    Einnahmen
                                </p>
                                <div className="space-y-0.5">
                                    {incomeCategories.length === 0 && (
                                        <p className="text-sm text-muted-foreground py-2">Keine Einnahmen-Kategorien.</p>
                                    )}
                                    {incomeCategories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-black/6 dark:hover:bg-white/8"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="h-3 w-3 rounded-full shrink-0"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                <span className="text-sm">{cat.name}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => deleteCategoryMutation.mutate(cat.id)}
                                                disabled={deleteCategoryMutation.isPending}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── KONTO / GEFAHRENZONE ── */}
                <TabsContent value="account" className="mt-6">
                    <Card className="border-destructive/40">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" /> Gefahrenzone
                            </CardTitle>
                            <CardDescription>
                                Diese Aktionen sind unwiderruflich. Bitte mit Vorsicht verwenden.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <hr className="border-border" />
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">Konto löschen</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Löscht dein Konto und alle zugehörigen Daten dauerhaft.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={() => {
                                        setDeleteAccountError(null);
                                        setDeleteConfirmOpen(true);
                                    }}
                                >
                                    Konto löschen
                                </Button>
                            </div>
                            {deleteAccountError && (
                                <p className="text-sm text-destructive">{deleteAccountError}</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete confirmation dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onOpenChange={(open) => {
                    setDeleteConfirmOpen(open);
                    if (!open) setDeleteConfirmText("");
                }}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Konto wirklich löschen?</DialogTitle>
                        <DialogDescription>
                            Diese Aktion ist <strong>unwiderruflich</strong>. Alle Daten — Transaktionen,
                            Budgets, Sparziele und Kategorien — werden permanent gelöscht.
                            <br />
                            <br />
                            Gib zur Bestätigung <strong>LÖSCHEN</strong> ein:
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="LÖSCHEN"
                        className="mt-1"
                    />
                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteConfirmOpen(false);
                                setDeleteConfirmText("");
                            }}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={
                                deleteConfirmText !== "LÖSCHEN" || deleteAccountMutation.isPending
                            }
                            onClick={() => deleteAccountMutation.mutate()}
                        >
                            {deleteAccountMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Endgültig löschen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
