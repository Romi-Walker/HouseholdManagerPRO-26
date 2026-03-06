"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateNextDate } from "@/lib/utils/dates";

/**
 * Creates a new recurring transaction.
 */
export async function createRecurringTransaction(data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("recurring_transactions") as any)
        .insert([{ ...data, user_id: user.id }]);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/recurring");
    return { success: true };
}

/**
 * Updates an existing recurring transaction.
 */
export async function updateRecurringTransaction(id: string, data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("recurring_transactions") as any)
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/recurring");
    return { success: true };
}

/**
 * Deletes a recurring transaction.
 */
export async function deleteRecurringTransaction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("recurring_transactions") as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/recurring");
    return { success: true };
}

/**
 * Main logic to process due recurring transactions.
 * This should be called on dashboard load.
 */
export async function processRecurringTransactions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const now = new Date().toISOString().split('T')[0];

    // Get active recurring transactions where next_date <= today
    const { data: dueItems, error: fetchError } = await (supabase.from("recurring_transactions") as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .lte("next_date", now);

    if (fetchError) return { error: fetchError.message };
    if (!dueItems || dueItems.length === 0) return { success: true, processedCount: 0 };

    const transactionsToInsert = [];
    const updatesToPerform = [];

    for (const item of dueItems) {
        // Create the actual transaction
        transactionsToInsert.push({
            user_id: user.id,
            category_id: item.category_id,
            type: item.type,
            amount: item.amount,
            description: `[Automatisch] ${item.description || ""}`,
            date: item.next_date,
            is_recurring: true,
        });

        updatesToPerform.push({
            id: item.id,
            last_processed_at: new Date().toISOString(),
            next_date: calculateNextDate(item.next_date, item.interval),
        });
    }

    // Perfrom batch insert of transactions
    const { error: insertError } = await (supabase.from("transactions") as any).insert(transactionsToInsert);
    if (insertError) return { error: insertError.message };

    // Update recurring transaction metadata (one by one for simplicity/safety in this context)
    for (const update of updatesToPerform) {
        await (supabase.from("recurring_transactions") as any)
            .update({
                last_processed_at: update.last_processed_at,
                next_date: update.next_date
            })
            .eq("id", update.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    return { success: true, processedCount: dueItems.length };
}
