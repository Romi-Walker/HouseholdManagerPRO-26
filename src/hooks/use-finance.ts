"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TransactionWithCategory, Category } from "@/types";

export function useDashboardStats(month?: number, year?: number) {
    const supabase = createClient();

    const now = new Date();
    const selectedMonth = month ?? now.getMonth() + 1;
    const selectedYear = year ?? now.getFullYear();

    return useQuery({
        queryKey: ["dashboard-stats", selectedMonth, selectedYear],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Nicht authentifiziert");

            const firstDayOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
            const lastDayOfMonth = selectedMonth === 12
                ? `${selectedYear + 1}-01-01`
                : `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
            // Last day (inclusive) for budget overlap check
            const lastDayInclusive = new Date(selectedYear, selectedMonth, 0).toISOString().split("T")[0];

            // Fetch transactions for the selected month
            const { data: transactions, error: tError } = await supabase
                .from("transactions")
                .select("*, category:categories(*)")
                .eq("user_id", user.id)
                .gte("date", firstDayOfMonth)
                .lt("date", lastDayOfMonth);

            if (tError) throw tError;

            // Fetch budgets that overlap with the selected month
            const { data: budgets, error: bStatsError } = await supabase
                .from("budgets")
                .select("*, category:categories(*)")
                .eq("user_id", user.id)
                .lte("start_date", lastDayInclusive)
                .gte("end_date", firstDayOfMonth);

            if (bStatsError) throw bStatsError;

            // Fetch total balance (all time)
            const { data: allTransactions, error: aError } = await supabase
                .from("transactions")
                .select("type, amount")
                .eq("user_id", user.id);

            if (aError) throw aError;

            const typedTransactions = (transactions || []) as unknown as TransactionWithCategory[];
            const typedBudgets = (budgets || []) as any[];

            const income = typedTransactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const expenses = typedTransactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + Number(t.amount), 0);

            // Calculate budget utilization
            const totalBudget = typedBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
            const budgetUsage = totalBudget > 0 ? (expenses / totalBudget) * 100 : 0;

            const typedAllTransactions = (allTransactions || []) as any[];

            const totalBalance = typedAllTransactions.reduce((sum, t) => {
                return t.type === "income" ? sum + Number(t.amount) : sum - Number(t.amount);
            }, 0);

            const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

            // Prepare data for Reports (Expenses by Category)
            const expenseCategoryMap = new Map();
            typedTransactions
                .filter(t => t.type === "expense")
                .forEach(t => {
                    const categoryName = t.category?.name || "Unkategorisiert";
                    const amount = Number(t.amount);
                    if (expenseCategoryMap.has(categoryName)) {
                        expenseCategoryMap.set(categoryName, expenseCategoryMap.get(categoryName) + amount);
                    } else {
                        expenseCategoryMap.set(categoryName, amount);
                    }
                });

            const categoryWiseExpenses = Array.from(expenseCategoryMap.entries()).map(([name, value]) => ({
                name,
                value,
                color: typedTransactions.find(t => t.category?.name === name)?.category?.color || "#ccc"
            }));

            return {
                income,
                expenses,
                balance: totalBalance,
                savingsRate: Math.max(0, Math.round(savingsRate)),
                transactionCount: typedTransactions.length,
                totalBudget,
                budgetUsage: Math.min(100, Math.round(budgetUsage)),
                categoryWiseExpenses: categoryWiseExpenses.sort((a, b) => b.value - a.value),
            };
        },
    });
}

export function useBudgets() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["budgets"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Nicht authentifiziert");

            // Fetch all budgets, sorted by most recent first
            const { data: budgets, error: bError } = await supabase
                .from("budgets")
                .select("*, category:categories(*)")
                .eq("user_id", user.id)
                .order("start_date", { ascending: false });

            if (bError) throw bError;

            const typedBudgets = (budgets || []) as any[];

            // For each budget, fetch expense transactions within its date range
            const results = await Promise.all(
                typedBudgets.map(async (budget) => {
                    const { data: transactions, error: tError } = await supabase
                        .from("transactions")
                        .select("category_id, amount")
                        .eq("user_id", user.id)
                        .eq("type", "expense")
                        .eq("category_id", budget.category_id)
                        .gte("date", budget.start_date)
                        .lte("date", budget.end_date);

                    if (tError) throw tError;

                    const spent = (transactions || []).reduce(
                        (sum, t: any) => sum + Number(t.amount), 0
                    );

                    return {
                        ...budget,
                        spent,
                        remaining: Math.max(0, budget.amount - spent),
                        percent: Math.min(100, (spent / budget.amount) * 100),
                    };
                })
            );

            return results;
        },
    });
}

// Alias for useDashboardStats for backward compatibility
export const useFinance = useDashboardStats;

export function useSavingsGoals() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["savings-goals"],
        queryFn: async () => {
            const { data, error } = await (supabase.from("savings_goals") as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as SavingsGoal[];
        },
    });
}

export type SavingsGoal = {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    color: string;
    icon: string;
    created_at: string;
    updated_at: string;
};

export function useCategories() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            return data as Category[];
        },
    });
}

export function useTransactions() {
    const supabase = createClient();

    return useQuery({
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
}
