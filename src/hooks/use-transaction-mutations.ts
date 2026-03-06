"use client";

import { useCategories } from "@/hooks/use-finance";
import { createTransaction, updateTransaction, deleteTransaction } from "@/lib/transactions/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook for transaction mutations with cache invalidation.
 * Supports create, update, and delete operations.
 */
export function useTransactionMutations() {
    const queryClient = useQueryClient();

    // Helper to invalidate all relevant queries after any mutation
    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
    };

    const createMutation = useMutation({
        mutationFn: createTransaction,
        onMutate: async (newTransaction) => {
            await queryClient.cancelQueries({ queryKey: ["dashboard-stats"] });
            await queryClient.cancelQueries({ queryKey: ["transactions"] });
            const previousStats = queryClient.getQueryData(["dashboard-stats"]);
            return { previousStats };
        },
        onError: (err, newTransaction, context) => {
            queryClient.setQueryData(["dashboard-stats"], context?.previousStats);
        },
        onSettled: () => {
            invalidateAll();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            updateTransaction(id, data),
        onSettled: () => {
            invalidateAll();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteTransaction(id),
        onSettled: () => {
            invalidateAll();
        },
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
}
