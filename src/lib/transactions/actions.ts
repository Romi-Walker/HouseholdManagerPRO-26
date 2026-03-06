"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TransactionInsert, TransactionUpdate } from "@/types";

export async function createTransaction(data: TransactionInsert) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("transactions") as any)
        .insert([{ ...data, user_id: user.id }]);

    if (error) return { error: error.message };

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true };
}

export async function updateTransaction(id: string, data: TransactionUpdate) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("transactions") as any)
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true };
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const { error } = await (supabase.from("transactions") as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true };
}
