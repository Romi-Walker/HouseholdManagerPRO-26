"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    ArrowLeftRight,
    PieChart,
    TrendingUp,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Repeat,
    PiggyBank
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/transactions", label: "Transaktionen", icon: ArrowLeftRight },
    { href: "/dashboard/budgets", label: "Budgets", icon: TrendingUp },
    { href: "/dashboard/recurring", label: "Daueraufträge", icon: Repeat },
    { href: "/dashboard/goals", label: "Sparziele", icon: PiggyBank },
    { href: "/dashboard/reports", label: "Berichte", icon: PieChart },
    { href: "/dashboard/settings", label: "Einstellungen", icon: Settings },
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "relative flex h-screen flex-col glass transition-all duration-300",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
        >
            <div className="flex h-16 items-center border-b border-white/30 dark:border-white/10 px-4">
                {!isCollapsed && (
                    <span className="text-xl font-bold tracking-tight text-primary">
                        HM Pro
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("ml-auto", isCollapsed && "mx-auto")}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </Button>
            </div>

            <nav className="flex-1 space-y-2 p-2 mt-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                                    : "text-foreground/70 hover:bg-white/40 dark:hover:bg-white/10 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                            {!isCollapsed && <span>{item.label}</span>}
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute inset-0 rounded-xl ring-1 ring-primary/40"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/30 dark:border-white/10 p-2">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                        isCollapsed && "px-0 justify-center"
                    )}
                    onClick={() => signOut()}
                >
                    <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span>Abmelden</span>}
                </Button>
            </div>
        </aside>
    );
}
