"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(fullName: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
    });
    if (error) return { error: error.message };
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
}

export async function updatePassword(newPassword: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Nicht authentifiziert" };

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return { error: "Account-Löschung nicht konfiguriert. Bitte wende dich an den Support." };
    }

    const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
    if (error) return { error: error.message };

    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/auth/login");
}
