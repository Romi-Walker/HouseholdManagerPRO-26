"use client";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface OverviewChartsProps {
    data: any;
}

export function OverviewCharts({ data }: OverviewChartsProps) {
    const hasData = data?.categoryWiseExpenses?.length > 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Ausgaben nach Kategorie</CardTitle>
                    <CardDescription>
                        Deine Ausgabenverteilung im gewählten Zeitraum.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryWiseExpenses}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categoryWiseExpenses.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => formatCurrency(Number(value))}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Keine Ausgabendaten vorhanden.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Budget-Status</CardTitle>
                    <CardDescription>
                        Gesamtauslastung deiner gesetzten Limits.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Gesamtbudget ({formatCurrency(data?.totalBudget || 0)})</span>
                            <span className="font-bold">{data?.budgetUsage || 0}%</span>
                        </div>
                        <Progress value={data?.budgetUsage || 0} className="h-2" />
                    </div>

                    <div className="pt-2">
                        <h4 className="text-sm font-medium mb-4">Zusammenfassung</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Einnahmen</span>
                                <span className="text-green-600 font-medium">+{formatCurrency(data?.income || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Ausgaben</span>
                                <span className="text-red-600 font-medium">-{formatCurrency(data?.expenses || 0)}</span>
                            </div>
                            <div className="border-t pt-4 flex items-center justify-between font-bold">
                                <span>Netto Cashflow</span>
                                <span className={(data?.income - data?.expenses) >= 0 ? "text-green-600" : "text-red-600"}>
                                    {formatCurrency(data?.income - data?.expenses)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
