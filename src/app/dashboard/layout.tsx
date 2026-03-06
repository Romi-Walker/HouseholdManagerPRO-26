import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ThemeCustomizer } from "@/components/layout/theme-customizer";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Liquid Glass background orbs */}
            <div className="liquid-bg" />

            <Sidebar className="hidden lg:flex" />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
                    {children}
                </main>
                <BottomNav />
            </div>
            <ThemeCustomizer />
        </div>
    );
}
