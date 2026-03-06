"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useDashboardStats, useTransactions } from "@/hooks/use-finance";
import { formatCurrency } from "@/lib/utils";
import { exportReportToCSV } from "@/lib/utils/export";
import { Download, FileDown, PieChart as ChartIcon, BarChart3 } from "lucide-react";
import type { TransactionWithCategory } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";

const MONTH_NAMES = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default function ReportsPage() {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    const { data: stats, isLoading } = useDashboardStats(selectedMonth, selectedYear);
    const { data: transactions } = useTransactions();

    const currentYear = now.getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    const monthLabel = MONTH_NAMES[selectedMonth - 1];

    // Filter transactions to selected month
    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        return transactions.filter((t: TransactionWithCategory) => {
            const d = new Date(t.date);
            return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
        });
    }, [transactions, selectedMonth, selectedYear]);

    const handleExportCSV = () => {
        if (!filteredTransactions.length && !stats) return;
        exportReportToCSV(filteredTransactions, stats, monthLabel, selectedYear, selectedMonth);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Skeleton className="h-96 w-full rounded-xl" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-6 w-full" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Date range for report header
    const firstDay = `01.${String(selectedMonth).padStart(2, "0")}.${selectedYear}`;
    const lastDayDate = new Date(selectedYear, selectedMonth, 0);
    const lastDay = `${String(lastDayDate.getDate()).padStart(2, "0")}.${String(selectedMonth).padStart(2, "0")}.${selectedYear}`;

    return (
        <div className="flex flex-col gap-8">
            <div className="hidden print-only text-center mb-4">
                <h1 className="text-2xl font-bold">Finanzbericht</h1>
                <p className="text-lg">{monthLabel} {selectedYear}</p>
                <p className="text-sm text-muted-foreground">Zeitraum: {firstDay} – {lastDay}</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Finanzberichte</h1>
                    <p className="text-muted-foreground">
                        Detaillierte Analyse deiner Einnahmen und Ausgaben.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 no-print">
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTH_NAMES.map((name, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExportCSV} disabled={!filteredTransactions.length && !stats}>
                        <FileDown className="mr-2 h-4 w-4" /> CSV Export
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="mr-2 h-4 w-4" /> PDF (Drucken)
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monatliche Sparquote</CardTitle>
                        <ChartIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.savingsRate || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            {(stats?.savingsRate || 0) > 20 ? "Exzellent!" : "Luft nach oben."}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Durchschnittliche Ausgaben</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.expenses || 0)}</div>
                        <p className="text-xs text-muted-foreground">Basis: {monthLabel} {selectedYear}</p>
                    </CardContent>
                </Card>
            </div>

            <OverviewCharts data={stats} />

            <Card>
                <CardHeader>
                    <CardTitle>Daten-Zusammenfassung</CardTitle>
                    <CardDescription>Rohdaten für {monthLabel} {selectedYear}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">Erfasste Transaktionen:</span>
                            <span className="text-right font-medium">{stats?.transactionCount || 0}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm border-t pt-2">
                            <span className="text-muted-foreground">Gesamt Einnahmen:</span>
                            <span className="text-right font-medium text-green-600">+{formatCurrency(stats?.income || 0)}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">Gesamt Ausgaben:</span>
                            <span className="text-right font-medium text-red-600">-{formatCurrency(stats?.expenses || 0)}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm border-t pt-2 font-bold">
                            <span>Netto Saldo:</span>
                            <span className={`text-right ${(stats?.income || 0) - (stats?.expenses || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency((stats?.income || 0) - (stats?.expenses || 0))}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredTransactions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Einzelne Transaktionen</CardTitle>
                        <CardDescription>Alle Buchungen für {monthLabel} {selectedYear}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-2 font-medium">Datum</th>
                                        <th className="pb-2 font-medium">Beschreibung</th>
                                        <th className="pb-2 font-medium">Kategorie</th>
                                        <th className="pb-2 font-medium text-right">Betrag</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((t: TransactionWithCategory) => (
                                        <tr key={t.id} className="border-b last:border-0">
                                            <td className="py-2 whitespace-nowrap">{new Date(t.date).toLocaleDateString("de-DE")}</td>
                                            <td className="py-2">{t.description || "–"}</td>
                                            <td className="py-2">{t.category?.name || "Unkategorisiert"}</td>
                                            <td className={`py-2 text-right font-medium whitespace-nowrap ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                                                {t.type === "income" ? "+" : "–"}{formatCurrency(Number(t.amount))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
