"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * TanStack Query Provider for client-side data fetching.
 * Wraps the application with QueryClientProvider.
 */
export function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time of 60 seconds to reduce unnecessary refetches
                        staleTime: 60 * 1000,
                        // Retry failed queries up to 2 times
                        retry: 2,
                        // Refetch on window focus for fresh data
                        refetchOnWindowFocus: true,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}
