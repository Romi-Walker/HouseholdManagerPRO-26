"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const authSchema = z.object({
    email: z.string().email({ message: "Ungültige E-Mail-Adresse" }),
    password: z.string().min(6, { message: "Passwort muss mindestens 6 Zeichen lang sein" }),
});

export async function signIn(formData: z.infer<typeof authSchema>) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function signUp(formData: z.infer<typeof authSchema> & { fullName: string }) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                full_name: formData.fullName,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/auth/login");
}
