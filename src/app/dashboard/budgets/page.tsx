"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Plus, Target, AlertCircle } from "lucide-react";
import { useBudgets } from "@/hooks/use-finance";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AddBudgetModal } from "@/components/dashboard/add-budget-modal";
import { motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";

function formatDateRange(startDate: string, endDate: string) {
    const fmt = (d: string) => {
        const [y, m, day] = d.split("-");
        return `${day}.${m}.${y}`;
    };
    return `${fmt(startDate)} – ${fmt(endDate)}`;
}

export default function BudgetsPage() {
    const { data: budgets, isLoading } = useBudgets();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-10" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
                    <p className="text-muted-foreground">
                        Behalte deine Ausgabenlimits im Blick.
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Budget setzen
                </Button>
            </div>

            {budgets?.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Target className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Noch keine Budgets gesetzt</CardTitle>
                    <CardDescription className="max-w-xs mt-2">
                        Lege Limits für deine Kategorien fest, um deine Finanzen besser zu managen.
                    </CardDescription>
                    <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Erstes Budget erstellen
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {budgets?.map((budget, index) => (
                        <motion.div
                            key={budget.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-sm font-medium">
                                            {budget.category?.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {formatDateRange(budget.start_date, budget.end_date)}
                                        </CardDescription>
                                        <CardDescription>
                                            Limit: {formatCurrency(budget.amount)}
                                        </CardDescription>
                                    </div>
                                    <div
                                        className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                                        style={{ backgroundColor: budget.category?.color }}
                                    >
                                        <Target className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-muted-foreground">
                                            Ausgegeben: {formatCurrency(budget.spent)}
                                        </span>
                                        <span className={`text-xs font-bold ${budget.percent > 90 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                            {Math.round(budget.percent)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={budget.percent}
                                        className="h-2"
                                        style={{
                                            // Optional: visual cue if limit is reached
                                            filter: budget.percent >= 100 ? 'hue-rotate(320deg)' : 'none'
                                        } as any}
                                    />
                                    <div className="mt-4 flex items-center gap-2">
                                        {budget.percent >= 100 ? (
                                            <div className="flex items-center text-red-600 text-xs gap-1 font-medium">
                                                <AlertCircle className="h-3 w-3" />
                                                Budget überschritten!
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                Noch {formatCurrency(budget.remaining)} verfügbar
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <AddBudgetModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
