"use client";

export const dynamic = "force-dynamic";

import { useDashboardStats } from "@/hooks/use-finance";
import { cn, formatCurrency } from "@/lib/utils";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Percent,
    Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { AddTransactionModal } from "@/components/dashboard/add-transaction-modal";
import { useState, useEffect } from "react";
import { initializeDefaultCategories } from "@/lib/categories/actions";

import { Skeleton } from "@/components/ui/skeleton";
import { processRecurringTransactions } from "@/lib/recurring/actions";

export default function DashboardPage() {
    const { data: stats, isLoading } = useDashboardStats();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        initializeDefaultCategories();
        // Trigger processing of recurring transactions
        processRecurringTransactions();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                            <Skeleton className="h-[250px] w-full rounded-xl" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const cards = [
        {
            title: "Gesamtbilanz",
            value: formatCurrency(stats?.balance || 0),
            icon: Wallet,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            title: "Einnahmen (Monat)",
            value: formatCurrency(stats?.income || 0),
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "Ausgaben (Monat)",
            value: formatCurrency(stats?.expenses || 0),
            icon: TrendingDown,
            color: "text-red-600",
            bg: "bg-red-100",
        },
        {
            title: "Sparquote",
            value: `${stats?.savingsRate || 0}%`,
            icon: Percent,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Willkommen zurück! Hier ist deine Übersicht.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Transaktion
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
                                <div className={cn("p-2 rounded-full", card.bg)}>
                                    <card.icon className={cn("h-4 w-4", card.color)} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <OverviewCharts data={stats} />

            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}

