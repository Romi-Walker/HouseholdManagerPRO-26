import Link from "next/link";
import { ArrowRight, LayoutDashboard, Shield, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center border-b px-4 lg:px-6">
        <span className="text-xl font-bold tracking-tight text-primary">
          Haushaltsmanager Pro
        </span>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/auth/login">
            <Button variant="ghost">Anmelden</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Jetzt Starten</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-accent/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Verwalten Sie Ihre Finanzen wie ein Pro
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Die modernste Lösung für Ihre Budgetplanung. Sicher, intuitiv und hochprofessionell.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Link href="/auth/register">
                  <Button size="lg" className="px-8">
                    Kostenlos Registrieren <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-xl border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full text-primary mb-2">
                  <LayoutDashboard size={24} />
                </div>
                <h3 className="text-xl font-bold text-center">Intuitives Dashboard</h3>
                <p className="text-muted-foreground text-center">
                  Alle wichtigen Kennzahlen auf einen Blick. Einnahmen, Ausgaben und Sparrate sofort sichtbar.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-xl border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full text-primary mb-2">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-center">Sicher & Diskret</h3>
                <p className="text-muted-foreground text-center">
                  Ihre Daten gehören Ihnen. Dank modernster Verschlüsselung und Supabase-Sicherheit.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-xl border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full text-primary mb-2">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold text-center">Blitzschnell</h3>
                <p className="text-muted-foreground text-center">
                  Optimistic Updates sorgen für eine flüssige Erfahrung ohne lästige Ladezeiten.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-medium text-sm text-muted-foreground">
        <p>© 2026 Haushaltsmanager Pro. Alle Rechte vorbehalten.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="underline-offset-4 hover:underline" href="#">
            Nutzungsbedingungen
          </Link>
          <Link className="underline-offset-4 hover:underline" href="#">
            Datenschutz
          </Link>
        </nav>
      </footer>
    </div>
  );
}
