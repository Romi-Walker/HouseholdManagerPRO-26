/**
 * Wraps a value in quotes so Excel treats it as text (prevents date/number interpretation).
 */
function txt(value: string) {
    // Escape any existing quotes
    return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Utility to export transactions to CSV.
 */
export function exportToCSV(transactions: any[]) {
    if (!transactions || transactions.length === 0) return;

    const sep = ";";
    const headers = ["Datum", "Beschreibung", "Kategorie", "Typ", "Betrag"];
    const rows = transactions.map(t => [
        txt(t.date),
        txt(t.description || ""),
        txt(t.category?.name || "Unkategorisiert"),
        txt(t.type === 'income' ? 'Einnahme' : 'Ausgabe'),
        t.amount.toString().replace('.', ',')
    ]);

    const csvContent = [
        `sep=${sep}`,
        headers.join(sep),
        ...rows.map(r => r.join(sep))
    ].join("\n");

    downloadCSV(csvContent, `haushaltsmanager_export_${new Date().toISOString().split('T')[0]}.csv`);
}

/**
 * Export a full report (summary + category breakdown + transactions) for a given month.
 */
export function exportReportToCSV(
    transactions: any[],
    stats: any,
    monthLabel: string,
    year: number,
    month: number,
) {
    const fmt = (n: number) => n.toFixed(2).replace('.', ',');
    const sep = ";";
    const lines: string[] = [];

    const pad = (n: number) => String(n).padStart(2, "0");
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const firstDay = `01.${pad(month)}.${year}`;
    const lastDay = `${pad(lastDayOfMonth)}.${pad(month)}.${year}`;

    // Tell Excel which separator to use
    lines.push(`sep=${sep}`);

    // Header — wrap in quotes so Excel doesn't misinterpret as dates
    lines.push(txt("Finanzbericht"));
    lines.push(txt(`${monthLabel} ${year}`));
    lines.push(txt(`Zeitraum: ${firstDay} - ${lastDay}`));
    lines.push("");

    // Summary section
    lines.push(txt("=== Zusammenfassung ==="));
    lines.push(`${txt("Einnahmen")}${sep}${fmt(stats?.income || 0)}`);
    lines.push(`${txt("Ausgaben")}${sep}${fmt(stats?.expenses || 0)}`);
    lines.push(`${txt("Netto Saldo")}${sep}${fmt((stats?.income || 0) - (stats?.expenses || 0))}`);
    lines.push(`${txt("Sparquote")}${sep}${txt(`${stats?.savingsRate || 0}%`)}`);
    lines.push(`${txt("Gesamtbudget")}${sep}${fmt(stats?.totalBudget || 0)}`);
    lines.push(`${txt("Budget-Auslastung")}${sep}${txt(`${stats?.budgetUsage || 0}%`)}`);
    lines.push(`${txt("Anzahl Transaktionen")}${sep}${stats?.transactionCount || 0}`);
    lines.push("");

    // Category breakdown
    if (stats?.categoryWiseExpenses?.length > 0) {
        lines.push(txt("=== Ausgaben nach Kategorie ==="));
        lines.push(`${txt("Kategorie")}${sep}${txt("Betrag")}`);
        for (const cat of stats.categoryWiseExpenses) {
            lines.push(`${txt(cat.name)}${sep}${fmt(cat.value)}`);
        }
        lines.push("");
    }

    // Transaction list
    if (transactions && transactions.length > 0) {
        lines.push(txt("=== Einzelne Transaktionen ==="));
        lines.push([txt("Datum"), txt("Beschreibung"), txt("Kategorie"), txt("Typ"), txt("Betrag")].join(sep));
        for (const t of transactions) {
            lines.push([
                txt(t.date),
                txt(t.description || ""),
                txt(t.category?.name || "Unkategorisiert"),
                txt(t.type === 'income' ? 'Einnahme' : 'Ausgabe'),
                fmt(Number(t.amount)),
            ].join(sep));
        }
    }

    const csvContent = lines.join("\n");
    downloadCSV(csvContent, `Bericht_${firstDay}_bis_${lastDay}.csv`);
}

function downloadCSV(content: string, filename: string) {
    // UTF-8 BOM so Excel recognizes encoding correctly (umlauts, special chars)
    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
