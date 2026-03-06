"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Search, X, Filter } from "lucide-react";
import type { TransactionWithCategory } from "@/types";
import { EditTransactionModal } from "@/components/dashboard/edit-transaction-modal";
import { AddTransactionModal } from "@/components/dashboard/add-transaction-modal";
import { useTransactionMutations } from "@/hooks/use-transaction-mutations";
import { useCategories } from "@/hooks/use-finance";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

export default function TransactionsPage() {
    const supabase = createClient();
    const { deleteMutation } = useTransactionMutations();
    const { data: categories } = useCategories();

    // --- Modal-States ---
    const [editTransaction, setEditTransaction] = useState<TransactionWithCategory | null>(null);
    const [deleteTransaction, setDeleteTransaction] = useState<TransactionWithCategory | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // --- Filter-States ---
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [monthFilter, setMonthFilter] = useState<string>("all");

    // Alle Transaktionen laden
    const { data: transactions, isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("transactions")
                .select("*, category:categories(*)")
                .order("date", { ascending: false });

            if (error) throw error;
            return data as TransactionWithCategory[];
        },
    });

    // Verfügbare Monate aus den Transaktionsdaten ableiten
    const availableMonths = useMemo(() => {
        if (!transactions) return [];
        const months = new Set<string>();
        transactions.forEach(t => {
            const d = new Date(t.date);
            months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    }, [transactions]);

    // --- Client-seitiges Filtern (ohne neue API-Anfragen!) ---
    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];

        return transactions.filter(t => {
            // 1) Suche in Beschreibung
            const matchesSearch =
                searchQuery === "" ||
                (t.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

            // 2) Typ-Filter: Einnahme / Ausgabe / Alle
            const matchesType = typeFilter === "all" || t.type === typeFilter;

            // 3) Kategorie-Filter
            const matchesCategory =
                categoryFilter === "all" || t.category_id === categoryFilter;

            // 4) Monats-Filter
            const matchesMonth = (() => {
                if (monthFilter === "all") return true;
                const d = new Date(t.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                return key === monthFilter;
            })();

            return matchesSearch && matchesType && matchesCategory && matchesMonth;
        });
    }, [transactions, searchQuery, typeFilter, categoryFilter, monthFilter]);

    // Prüfen ob aktive Filter vorhanden sind
    const hasActiveFilters =
        searchQuery !== "" ||
        typeFilter !== "all" ||
        categoryFilter !== "all" ||
        monthFilter !== "all";

    // Alle Filter zurücksetzen
    function resetFilters() {
        setSearchQuery("");
        setTypeFilter("all");
        setCategoryFilter("all");
        setMonthFilter("all");
    }

    // Löschen bestätigen
    function handleConfirmDelete() {
        if (!deleteTransaction) return;
        deleteMutation.mutate(deleteTransaction.id, {
            onSuccess: () => setDeleteTransaction(null),
        });
    }

    // Monat lesbar formatieren
    function formatMonthLabel(key: string) {
        const [year, month] = key.split("-");
        const d = new Date(Number(year), Number(month) - 1, 1);
        return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="rounded-md border bg-card">
                    <div className="p-4 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Transaktionen</h1>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Neue Transaktion
                </Button>
            </div>

            {/* ===== FILTER-LEISTE ===== */}
            <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Filter & Suche
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Suchfeld */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Suche nach Beschreibung oder Kategorie…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Typ-Filter */}
                    <div className="flex rounded-md border overflow-hidden">
                        {(["all", "expense", "income"] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={cn(
                                    "px-3 py-2 text-sm font-medium transition-colors",
                                    typeFilter === type
                                        ? type === "income"
                                            ? "bg-green-600 text-white"
                                            : type === "expense"
                                            ? "bg-red-600 text-white"
                                            : "bg-primary text-primary-foreground"
                                        : "bg-background text-muted-foreground hover:bg-accent"
                                )}
                            >
                                {type === "all" ? "Alle" : type === "income" ? "Einnahmen" : "Ausgaben"}
                            </button>
                        ))}
                    </div>

                    {/* Kategorie-Filter */}
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Kategorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle Kategorien</SelectItem>
                            {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        {cat.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Monats-Filter */}
                    <Select value={monthFilter} onValueChange={setMonthFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Monat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle Monate</SelectItem>
                            {availableMonths.map((m) => (
                                <SelectItem key={m} value={m}>
                                    {formatMonthLabel(m)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter zurücksetzen */}
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                            <X className="mr-1 h-4 w-4" /> Filter zurücksetzen
                        </Button>
                    )}
                </div>

                {/* Ergebnis-Hinweis */}
                <p className="text-xs text-muted-foreground">
                    {filteredTransactions.length} von {transactions?.length || 0} Transaktionen angezeigt
                    {hasActiveFilters && " (gefiltert)"}
                </p>
            </div>

            {/* Tabelle */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Datum</TableHead>
                            <TableHead>Beschreibung</TableHead>
                            <TableHead>Kategorie</TableHead>
                            <TableHead>Typ</TableHead>
                            <TableHead className="text-right">Betrag</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {hasActiveFilters
                                        ? "Keine Transaktionen für diese Filtereinstellungen gefunden."
                                        : "Keine Transaktionen gefunden."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransactions.map((t) => (
                                <TableRow key={t.id} className="group">
                                    <TableCell className="font-medium">
                                        {formatDate(t.date)}
                                    </TableCell>
                                    <TableCell>{t.description}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: t.category?.color || "#ccc" }}
                                            />
                                            {t.category?.name || "Unkategorisiert"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={t.type === "income" ? "success" : "destructive"}>
                                            {t.type === "income" ? "Einnahme" : "Ausgabe"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right font-bold",
                                        t.type === "income" ? "text-green-600" : "text-red-600"
                                    )}>
                                        {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditTransaction(t)}
                                                title="Transaktion bearbeiten"
                                            >
                                                <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteTransaction(t)}
                                                title="Transaktion löschen"
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modals */}
            <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditTransactionModal
                transaction={editTransaction}
                isOpen={!!editTransaction}
                onClose={() => setEditTransaction(null)}
            />

            {/* Löschen-Bestätigungsdialog */}
            <Dialog open={!!deleteTransaction} onOpenChange={(open) => { if (!open) setDeleteTransaction(null); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Transaktion löschen?</DialogTitle>
                        <DialogDescription>
                            Möchtest du{" "}
                            <span className="font-semibold text-foreground">
                                „{deleteTransaction?.description}"
                            </span>{" "}
                            wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteTransaction(null)}>
                            Abbrechen
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? "Wird gelöscht…" : "Ja, löschen"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
