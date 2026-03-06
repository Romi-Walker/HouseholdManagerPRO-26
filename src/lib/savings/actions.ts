"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SavingsGoalInsert {
    name: string;
    target_amount: number;
    current_amount?: number;
    deadline?: string | null;
    color?: string;
    icon?: string;
}

export interface SavingsGoalUpdate {
    name?: string;
    target_amount?: number;
    current_amount?: number;
    deadline?: string | null;
    color?: string;
    icon?: string;
}

/** Alle Sparziele des aktuellen Nutzers laden */
export async function getSavingsGoals() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Nicht authentifiziert", data: null };

    const { data, error } = await (supabase.from("savings_goals") as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return { error: error.message, data: null };
    return { data, error: null };
}

/** Neues Sparziel erstellen */
export async function createSavingsGoal(goal: SavingsGoalInsert) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("savings_goals") as any)
        .insert([{ ...goal, user_id: user.id }]);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/goals");
    return { success: true };
}

/** Sparziel aktualisieren (z.B. Betrag erhöhen) */
export async function updateSavingsGoal(id: string, data: SavingsGoalUpdate) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("savings_goals") as any)
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/goals");
    return { success: true };
}

/** Sparziel löschen */
export async function deleteSavingsGoal(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("savings_goals") as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/goals");
    return { success: true };
}
