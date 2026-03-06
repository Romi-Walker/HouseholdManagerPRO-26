"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, PiggyBank } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSavingsGoal, updateSavingsGoal } from "@/lib/savings/actions";
import type { SavingsGoal } from "@/hooks/use-finance";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Validierungsschema
const formSchema = z.object({
    name: z.string().min(1, "Name ist erforderlich"),
    target_amount: z
        .string()
        .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
            message: "Betrag muss eine positive Zahl sein",
        }),
    current_amount: z
        .string()
        .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
            message: "Betrag muss 0 oder positiv sein",
        })
        .optional(),
    deadline: z.string().optional(),
});

// Auswahl an vordefinierten Farben
const PRESET_COLORS = [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#f43f5e", // Rose
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#14b8a6", // Teal
    "#3b82f6", // Blue
    "#6b7280", // Gray
];

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal?: SavingsGoal; // wenn gesetzt → Bearbeitungsmodus
}

export function AddGoalModal({ isOpen, onClose, goal }: AddGoalModalProps) {
    const queryClient = useQueryClient();
    const isEdit = !!goal;
    const [selectedColor, setSelectedColor] = useState(goal?.color ?? PRESET_COLORS[0]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: goal?.name ?? "",
            target_amount: goal ? String(goal.target_amount) : "",
            current_amount: goal ? String(goal.current_amount) : "0",
            deadline: goal?.deadline ?? "",
        },
    });

    // Formular neu befüllen wenn sich das goal ändert (z.B. anderes Ziel öffnen)
    useEffect(() => {
        if (goal) {
            form.reset({
                name: goal.name,
                target_amount: String(goal.target_amount),
                current_amount: String(goal.current_amount),
                deadline: goal.deadline ?? "",
            });
            setSelectedColor(goal.color);
        } else {
            form.reset({ name: "", target_amount: "", current_amount: "0", deadline: "" });
            setSelectedColor(PRESET_COLORS[0]);
        }
    }, [goal]); // eslint-disable-line react-hooks/exhaustive-deps

    const mutation = useMutation({
        mutationFn: (values: z.infer<typeof formSchema>) => {
            if (isEdit && goal) {
                return updateSavingsGoal(goal.id, {
                    name: values.name,
                    target_amount: Number(values.target_amount),
                    current_amount: Number(values.current_amount || 0),
                    deadline: values.deadline || null,
                    color: selectedColor,
                });
            }
            return createSavingsGoal({
                name: values.name,
                target_amount: Number(values.target_amount),
                current_amount: Number(values.current_amount || 0),
                deadline: values.deadline || null,
                color: selectedColor,
                icon: "PiggyBank",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
            form.reset();
            setSelectedColor(PRESET_COLORS[0]);
            onClose();
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PiggyBank className="h-5 w-5" />
                        {isEdit ? "Sparziel bearbeiten" : "Neues Sparziel erstellen"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">

                        {/* Name des Ziels */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name des Ziels</FormLabel>
                                    <FormControl>
                                        <Input placeholder="z.B. Urlaub, Notgroschen, Laptop…" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Zielbetrag & Aktuell gespart (nebeneinander) */}
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="target_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zielbetrag (€)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="5000"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="current_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bereits gespart (€)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Fälligkeitsdatum (optional) */}
                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zieldatum (optional)</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Farbauswahl */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Farbe</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={cn(
                                            "h-7 w-7 rounded-full transition-transform hover:scale-110",
                                            selectedColor === color &&
                                                "ring-2 ring-offset-2 ring-foreground scale-110"
                                        )}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Abbrechen
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEdit ? "Änderungen speichern" : "Ziel erstellen"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
