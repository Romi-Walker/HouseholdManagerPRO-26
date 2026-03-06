"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    ArrowLeftRight,
    PieChart,
    TrendingUp,
    Settings,
    Repeat
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/transactions", label: "Transaktionen", icon: ArrowLeftRight },
    { href: "/dashboard/budgets", label: "Budgets", icon: TrendingUp },
    { href: "/dashboard/recurring", label: "Daueraufträge", icon: Repeat },
    { href: "/dashboard/reports", label: "Berichte", icon: PieChart },
    { href: "/dashboard/settings", label: "Einstellungen", icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="flex items-center lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu size={20} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                    <SheetHeader className="text-left">
                        <SheetTitle className="text-xl font-bold tracking-tight text-primary">
                            HM Pro
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-2 mt-8">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
