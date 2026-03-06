"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ArrowLeftRight,
    TrendingUp,
    PieChart,
    PlusCircle,
    PiggyBank
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/transactions", label: "Liste", icon: ArrowLeftRight },
    { href: "/dashboard/budgets", label: "Budgets", icon: TrendingUp },
    { href: "/dashboard/goals", label: "Sparziele", icon: PiggyBank },
    { href: "/dashboard/reports", label: "Berichte", icon: PieChart },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center glass border-t border-white/40 dark:border-white/10 lg:hidden p-2">
            <div className="flex w-full items-center justify-around">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
