"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { BudgetInsert, BudgetUpdate } from "@/types";

/**
 * Creates or updates a budget for a category and date range.
 * Checks for overlapping budgets with the same category before inserting.
 */
export async function upsertBudget(data: BudgetInsert & { id?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const budgetData = { ...data, user_id: user.id };

    // Check for overlapping budgets with the same category
    let query = (supabase.from("budgets") as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("category_id", budgetData.category_id)
        .lte("start_date", budgetData.end_date)
        .gte("end_date", budgetData.start_date);

    // Exclude current budget when updating
    if (budgetData.id) {
        query = query.neq("id", budgetData.id);
    }

    const { data: overlapping, error: checkError } = await query;

    if (checkError) return { error: checkError.message };

    if (overlapping && overlapping.length > 0) {
        return { error: "Es existiert bereits ein Budget für diese Kategorie im gewählten Zeitraum." };
    }

    let error;
    if (budgetData.id) {
        // Update existing budget
        const { id, user_id, ...updateData } = budgetData;
        ({ error } = await (supabase.from("budgets") as any)
            .update(updateData)
            .eq("id", id)
            .eq("user_id", user.id));
    } else {
        // Insert new budget
        const { id, ...insertData } = budgetData;
        ({ error } = await (supabase.from("budgets") as any)
            .insert([insertData]));
    }

    if (error) return { error: error.message };

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Deletes a budget by ID.
 */
export async function deleteBudget(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("budgets") as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
}
