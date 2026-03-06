"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Plus, RefreshCw, Trash2, Calendar, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddRecurringModal } from "@/components/dashboard/add-recurring-modal";
import { deleteRecurringTransaction } from "@/lib/recurring/actions";
import { motion } from "framer-motion";

export default function RecurringPage() {
    const queryClient = useQueryClient();
    const supabase = createClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);

    const { data: recurring, isLoading } = useQuery({
        queryKey: ["recurring-transactions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("recurring_transactions")
                .select("*, category:categories(*)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as any[];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteRecurringTransaction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
        },
    });

    if (isLoading) {
        return <div className="p-8">Lade Daueraufträge...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Daueraufträge</h1>
                    <p className="text-muted-foreground">
                        Verwalte deine automatischen Einnahmen und Ausgaben.
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Dauerauftrag erstellen
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deine automatischen Buchungen</CardTitle>
                    <CardDescription>
                        Diese Beträge werden am jeweiligen Fälligkeitstag automatisch verbucht.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Beschreibung</TableHead>
                                <TableHead>Kategorie</TableHead>
                                <TableHead>Intervall</TableHead>
                                <TableHead>Betrag</TableHead>
                                <TableHead>Nächster Termin</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recurring?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                        Keine Daueraufträge gefunden.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recurring?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-amber-600 dark:text-amber-400">{item.description}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: item.category?.color }}
                                                />
                                                {item.category?.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {item.interval === 'monthly' ? 'Monatlich' :
                                                    item.interval === 'weekly' ? 'Wöchentlich' :
                                                        item.interval === 'yearly' ? 'Jährlich' : 'Täglich'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={item.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(item.next_date)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditItem(item)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteMutation.mutate(item.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AddRecurringModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
            {editItem && (
                <AddRecurringModal
                    key={editItem.id}
                    isOpen={true}
                    onClose={() => setEditItem(null)}
                    recurring={editItem}
                />
            )}
        </div>
    );
}
