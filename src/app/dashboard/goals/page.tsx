"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSavingsGoals, type SavingsGoal } from "@/hooks/use-finance";
import { updateSavingsGoal, deleteSavingsGoal } from "@/lib/savings/actions";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AddGoalModal } from "@/components/dashboard/add-goal-modal";
import {
    Plus,
    PiggyBank,
    Trash2,
    Trophy,
    CalendarClock,
    TrendingUp,
    Pencil,
    Check,
} from "lucide-react";

// Berechnet Tage bis zum Zieldatum
function daysUntil(deadline: string | null): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function GoalsPage() {
    const queryClient = useQueryClient();
    const { data: goals, isLoading } = useSavingsGoals();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteGoal, setDeleteGoal] = useState<SavingsGoal | null>(null);
    const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);

    // State für das inline "Betrag hinzufügen" pro Karte
    const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
    const [depositAmount, setDepositAmount] = useState("");

    // Mutation: Betrag einzahlen
    const depositMutation = useMutation({
        mutationFn: ({ goal, amount }: { goal: SavingsGoal; amount: number }) =>
            updateSavingsGoal(goal.id, {
                current_amount: Math.min(goal.target_amount, goal.current_amount + amount),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
            setDepositGoalId(null);
            setDepositAmount("");
        },
    });

    // Mutation: Ziel löschen
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteSavingsGoal(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
            setDeleteGoal(null);
        },
    });

    function handleDeposit(goal: SavingsGoal) {
        const amount = Number(depositAmount);
        if (!amount || amount <= 0) return;
        depositMutation.mutate({ goal, amount });
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-2 w-full" />
                                <Skeleton className="h-9 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Statistiken für die Zusammenfassungs-Cards
    const totalTargeted = goals?.reduce((s, g) => s + Number(g.target_amount), 0) || 0;
    const totalSaved = goals?.reduce((s, g) => s + Number(g.current_amount), 0) || 0;
    const completedGoals = goals?.filter((g) => Number(g.current_amount) >= Number(g.target_amount)).length || 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sparziele</h1>
                    <p className="text-muted-foreground">
                        Verfolge deine persönlichen Sparziele und bleib motiviert.
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Neues Ziel
                </Button>
            </div>

            {/* Zusammenfassungs-Karten */}
            {goals && goals.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Gesamt gespart</CardTitle>
                            <div className="p-2 rounded-full bg-green-100">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(totalSaved)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                von {formatCurrency(totalTargeted)} Gesamtziel
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Aktive Ziele</CardTitle>
                            <div className="p-2 rounded-full bg-primary/10">
                                <PiggyBank className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{goals.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {completedGoals} davon erreicht 🎉
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Fortschritt</CardTitle>
                            <div className="p-2 rounded-full bg-blue-100">
                                <Trophy className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalTargeted > 0 ? Math.round((totalSaved / totalTargeted) * 100) : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">Gesamtfortschritt</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Leerer Zustand */}
            {goals?.length === 0 && (
                <Card className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <PiggyBank className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Noch keine Sparziele</CardTitle>
                    <CardDescription className="max-w-xs mt-2">
                        Erstelle dein erstes Sparziel — egal ob Urlaub, Notgroschen oder neues Gadget!
                    </CardDescription>
                    <Button className="mt-6" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Erstes Ziel erstellen
                    </Button>
                </Card>
            )}

            {/* Ziel-Karten */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals?.map((goal, index) => {
                    const percent = Math.min(
                        100,
                        (Number(goal.current_amount) / Number(goal.target_amount)) * 100
                    );
                    const remaining = Number(goal.target_amount) - Number(goal.current_amount);
                    const isCompleted = percent >= 100;
                    const days = daysUntil(goal.deadline);
                    const isDepositing = depositGoalId === goal.id;

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <Card className={isCompleted ? "border-green-400 bg-green-50 dark:bg-green-950/20" : ""}>
                                <CardHeader className="flex flex-row items-start justify-between pb-2 gap-2">
                                    <div className="flex items-center gap-3">
                                        {/* Farbiger Kreis als Icon */}
                                        <div
                                            className="h-10 w-10 rounded-full flex items-center justify-center text-white shrink-0"
                                            style={{ backgroundColor: goal.color }}
                                        >
                                            {isCompleted ? (
                                                <Check className="h-5 w-5" />
                                            ) : (
                                                <PiggyBank className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{goal.name}</CardTitle>
                                            <CardDescription>
                                                Ziel: {formatCurrency(goal.target_amount)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {/* Bearbeiten & Löschen */}
                                    <div className="flex shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditGoal(goal)}
                                        >
                                            <Pencil className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteGoal(goal)}
                                        >
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Fortschrittsbalken */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">
                                                {formatCurrency(goal.current_amount)} gespart
                                            </span>
                                            <span
                                                className="font-bold"
                                                style={{ color: isCompleted ? "#16a34a" : goal.color }}
                                            >
                                                {Math.round(percent)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={percent}
                                            className="h-2"
                                            style={
                                                {
                                                    "--progress-color": isCompleted ? "#16a34a" : goal.color,
                                                } as any
                                            }
                                        />
                                    </div>

                                    {/* Status-Zeile */}
                                    {isCompleted ? (
                                        <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                            <Trophy className="h-4 w-4" /> Ziel erreicht! Herzlichen Glückwunsch! 🎉
                                        </p>
                                    ) : (
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Noch {formatCurrency(remaining)} fehlen</span>
                                            {days !== null && (
                                                <span
                                                    className={`flex items-center gap-1 ${
                                                        days < 0
                                                            ? "text-red-500"
                                                            : days <= 30
                                                            ? "text-orange-500"
                                                            : ""
                                                    }`}
                                                >
                                                    <CalendarClock className="h-3 w-3" />
                                                    {days < 0
                                                        ? `${Math.abs(days)} Tage überfällig`
                                                        : `${days} Tage verbleibend`}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Betrag einzahlen */}
                                    {!isCompleted && (
                                        <div>
                                            {isDepositing ? (
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        placeholder="Betrag €"
                                                        value={depositAmount}
                                                        onChange={(e) => setDepositAmount(e.target.value)}
                                                        className="h-8 text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleDeposit(goal);
                                                            if (e.key === "Escape") {
                                                                setDepositGoalId(null);
                                                                setDepositAmount("");
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="h-8 px-3"
                                                        onClick={() => handleDeposit(goal)}
                                                        disabled={depositMutation.isPending}
                                                        style={{ backgroundColor: goal.color }}
                                                    >
                                                        {depositMutation.isPending ? (
                                                            <span className="text-xs">…</span>
                                                        ) : (
                                                            <Check className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-2"
                                                        onClick={() => {
                                                            setDepositGoalId(null);
                                                            setDepositAmount("");
                                                        }}
                                                    >
                                                        ✕
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full h-8 text-sm"
                                                    onClick={() => setDepositGoalId(goal.id)}
                                                    style={{ borderColor: goal.color, color: goal.color }}
                                                >
                                                    <Pencil className="mr-1 h-3 w-3" />
                                                    Betrag einzahlen
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Modal: Neues Ziel */}
            <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

            {/* Modal: Ziel bearbeiten */}
            <AddGoalModal
                isOpen={!!editGoal}
                onClose={() => setEditGoal(null)}
                goal={editGoal ?? undefined}
            />

            {/* Dialog: Löschen bestätigen */}
            <Dialog open={!!deleteGoal} onOpenChange={(open) => { if (!open) setDeleteGoal(null); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Sparziel löschen?</DialogTitle>
                        <DialogDescription>
                            Möchtest du das Sparziel{" "}
                            <span className="font-semibold text-foreground">„{deleteGoal?.name}"</span>{" "}
                            wirklich löschen? Alle gespeicherten Beträge gehen verloren.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteGoal(null)}>
                            Abbrechen
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteGoal && deleteMutation.mutate(deleteGoal.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Wird gelöscht…" : "Ja, löschen"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
