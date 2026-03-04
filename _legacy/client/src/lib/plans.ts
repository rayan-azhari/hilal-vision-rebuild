/**
 * Shared plan definitions used by UpgradeModal and SupportPage.
 * Prices and savings labels are the single source of truth here.
 */

export const PLAN_BASE = [
    { id: "monthly" as const, label: "Monthly", price: "$2.99", savings: null as string | null },
    { id: "annual" as const, label: "Annual", price: "$14.99", savings: "Save 58%" },
    { id: "lifetime" as const, label: "Lifetime", price: "$49.99", savings: "Best Value" },
];

export type PlanId = typeof PLAN_BASE[number]["id"];
