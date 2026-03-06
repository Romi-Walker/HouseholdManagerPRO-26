import { MobileNav } from "./mobile-nav";
import { UserNav } from "@/components/layout/user-nav";
import { ModeToggle } from "./mode-toggle";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Navbar() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 glass border-b border-white/40 dark:border-white/10 px-4 lg:px-6">
            <MobileNav />
            <div className="flex flex-1 items-center gap-4 md:gap-8 overflow-hidden">
                <Breadcrumb className="hidden md:flex">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
                <ModeToggle />
                <UserNav />
            </div>
        </header>
    );
}
