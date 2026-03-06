"use client";



import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/use-finance";
import { createRecurringTransaction, updateRecurringTransaction } from "@/lib/recurring/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
    description: z.string().min(1, "Beschreibung ist erforderlich"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Betrag muss eine positive Zahl sein",
    }),
    category_id: z.string().min(1, "Kategorie ist erforderlich"),
    type: z.enum(["income", "expense"]),
    interval: z.enum(["daily", "weekly", "monthly", "yearly"]),
    start_date: z.string().min(1, "Startdatum ist erforderlich"),
});

type FormValues = z.infer<typeof formSchema>;

interface RecurringItem {
    id: string;
    description: string;
    amount: number;
    category_id: string;
    type: "income" | "expense";
    interval: "daily" | "weekly" | "monthly" | "yearly";
    next_date: string;
}

interface AddRecurringModalProps {
    isOpen: boolean;
    onClose: () => void;
    recurring?: RecurringItem;
}

export function AddRecurringModal({ isOpen, onClose, recurring }: AddRecurringModalProps) {
    const queryClient = useQueryClient();
    const { data: categories } = useCategories();
    const isEdit = !!recurring;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: recurring
            ? {
                  description: recurring.description,
                  amount: String(recurring.amount),
                  category_id: recurring.category_id,
                  type: recurring.type,
                  interval: recurring.interval,
                  start_date: recurring.next_date,
              }
            : {
                  description: "",
                  amount: "",
                  category_id: "",
                  type: "expense",
                  interval: "monthly",
                  start_date: new Date().toISOString().split("T")[0],
              },
    });

    const categoryType = form.watch("type");
    const filteredCategories = categories?.filter((c) => c.type === categoryType) || [];

    const mutation = useMutation({
        mutationFn: (values: FormValues) => {
            const payload = {
                description: values.description,
                amount: Number(values.amount),
                category_id: values.category_id,
                type: values.type,
                interval: values.interval,
                next_date: values.start_date,
            };
            if (isEdit) {
                return updateRecurringTransaction(recurring!.id, payload);
            }
            return createRecurringTransaction({ ...payload, start_date: values.start_date });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
            form.reset();
            onClose();
        },
    });

    function onSubmit(values: FormValues) {
        mutation.mutate(values);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90svh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Dauerauftrag bearbeiten" : "Dauerauftrag erstellen"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Typ</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Typ wählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="expense">Ausgabe</SelectItem>
                                            <SelectItem value="income">Einnahme</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Beschreibung</FormLabel>
                                    <FormControl>
                                        <Input placeholder="z.B. Miete, Netflix..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Betrag (€)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0,00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="interval"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Intervall</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="daily">Täglich</SelectItem>
                                                <SelectItem value="weekly">Wöchentlich</SelectItem>
                                                <SelectItem value="monthly">Monatlich</SelectItem>
                                                <SelectItem value="yearly">Jährlich</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategorie</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Kategorie wählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {filteredCategories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    <div className="flex items-center">
                                                        <span
                                                            className="mr-2 h-2 w-2 rounded-full"
                                                            style={{ backgroundColor: category.color }}
                                                        />
                                                        {category.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{isEdit ? "Nächster Termin" : "Startdatum"}</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Abbrechen
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? "Speichern" : "Dauerauftrag erstellen"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
