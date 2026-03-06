"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CategoryInsert, CategoryUpdate } from "@/types";

/**
 * Initializes default categories for a new user.
 * This should be called after a user signs up or logs in for the first time.
 */
export async function initializeDefaultCategories() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const defaultCategories: Omit<CategoryInsert, "user_id">[] = [
        // Income
        { name: "Gehalt", type: "income", icon: "Banknote", color: "#22c55e", is_default: true },
        { name: "Bonus", type: "income", icon: "Gift", color: "#10b981", is_default: true },
        { name: "Zinsen", type: "income", icon: "TrendingUp", color: "#059669", is_default: true },
        // Expense
        { name: "Miete", type: "expense", icon: "Home", color: "#ef4444", is_default: true },
        { name: "Lebensmittel", type: "expense", icon: "ShoppingCart", color: "#f97316", is_default: true },
        { name: "Transport", type: "expense", icon: "Car", color: "#3b82f6", is_default: true },
        { name: "Freizeit", type: "expense", icon: "Gamepad2", color: "#a855f7", is_default: true },
        { name: "Gesundheit", type: "expense", icon: "Stethoscope", color: "#ec4899", is_default: true },
        { name: "Versicherung", type: "expense", icon: "ShieldCheck", color: "#64748b", is_default: true },
        { name: "KI Abos", type: "expense", icon: "Bot", color: "#6366f1", is_default: true },
    ];

    // Fetch existing category names for this user
    const { data: existing } = await supabase
        .from("categories")
        .select("name")
        .eq("user_id", user.id);

    const existingNames = new Set((existing || []).map((c: any) => c.name));
    const missing = defaultCategories.filter(cat => !existingNames.has(cat.name));

    if (missing.length === 0) return { success: true };

    const { error } = await (supabase.from("categories") as any).insert(
        missing.map(cat => ({ ...cat, user_id: user.id }))
    );

    if (error) return { error: error.message };

    revalidatePath("/dashboard");
    return { success: true };
}

export async function createCategory(data: CategoryInsert) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("categories") as any)
        .insert([{ ...data, user_id: user.id }]);

    if (error) return { error: error.message };

    revalidatePath("/settings");
    return { success: true };
}

export async function updateCategory(id: string, data: CategoryUpdate) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("categories") as any)
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/settings");
    return { success: true };
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    // Note: Transactions with this category will have category_id set to NULL (on delete set null)
    const { error } = await (supabase.from("categories") as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/settings");
    return { success: true };
}
