"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Pencil } from "lucide-react";
import { useCategories } from "@/hooks/use-finance";
import { useTransactionMutations } from "@/hooks/use-transaction-mutations";
import type { TransactionWithCategory } from "@/types";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Validierungsschema — gleich wie beim Erstellen
const formSchema = z.object({
    type: z.enum(["income", "expense"]),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Betrag muss eine positive Zahl sein",
    }),
    description: z.string().min(1, "Beschreibung ist erforderlich"),
    category_id: z.string().min(1, "Kategorie ist erforderlich"),
    date: z.string().min(1, "Datum ist erforderlich"),
});

interface EditTransactionModalProps {
    transaction: TransactionWithCategory | null;
    isOpen: boolean;
    onClose: () => void;
}

export function EditTransactionModal({ transaction, isOpen, onClose }: EditTransactionModalProps) {
    const { data: categories } = useCategories();
    const { updateMutation } = useTransactionMutations();
    const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "expense",
            amount: "",
            description: "",
            category_id: "",
            date: new Date().toISOString().split("T")[0],
        },
    });

    // Wenn eine Transaktion übergeben wird, fülle das Formular vor
    useEffect(() => {
        if (transaction) {
            const type = transaction.type as "income" | "expense";
            setActiveTab(type);
            form.reset({
                type,
                amount: transaction.amount.toString(),
                description: transaction.description || "",
                category_id: transaction.category_id || "",
                date: transaction.date,
            });
        }
    }, [transaction, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!transaction) return;

        updateMutation.mutate(
            {
                id: transaction.id,
                data: {
                    ...values,
                    amount: Number(values.amount),
                },
            },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    }

    // Nur Kategorien passend zum aktiven Tab anzeigen
    const filteredCategories = categories?.filter((c) => c.type === activeTab) || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Transaktion bearbeiten
                    </DialogTitle>
                </DialogHeader>

                {/* Tab: Ausgabe / Einnahme */}
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => {
                        const type = v as "income" | "expense";
                        setActiveTab(type);
                        form.setValue("type", type);
                        form.setValue("category_id", ""); // Kategorie zurücksetzen beim Wechsel
                    }}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="expense">Ausgabe</TabsTrigger>
                        <TabsTrigger value="income">Einnahme</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">

                        {/* Betrag */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Betrag (€)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Beschreibung */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Beschreibung</FormLabel>
                                    <FormControl>
                                        <Input placeholder="z.B. Supermarkt" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Kategorie */}
                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategorie</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Wähle eine Kategorie" />
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

                        {/* Datum */}
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Datum</FormLabel>
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
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Änderungen speichern
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
