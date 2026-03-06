/**
 * Supabase Database Types
 * Diese Typen spiegeln das Datenbankschema wider und sollten
 * bei Schemaänderungen aktualisiert werden.
 */

// ============================================
// Enums
// ============================================

export type TransactionType = "income" | "expense";

export type CategoryType = "income" | "expense";

// ============================================
// Database Row Types (wie sie aus der DB kommen)
// ============================================

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    currency: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    type: CategoryType;
    icon: string;
    color: string;
    is_default: boolean;
    created_at: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    category_id: string;
    type: TransactionType;
    amount: number;
    description: string;
    date: string;
    is_recurring: boolean;
    recurring_interval: string | null;
    created_at: string;
    updated_at: string;
}

export interface Budget {
    id: string;
    user_id: string;
    category_id: string;
    amount: number;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

// ============================================
// Insert Types (für neue Einträge)
// ============================================

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at">;

export type CategoryInsert = Omit<Category, "id" | "created_at"> & {
    id?: string;
};

export type TransactionInsert = Omit<
    Transaction,
    "id" | "created_at" | "updated_at"
> & {
    id?: string;
};

export type BudgetInsert = Omit<Budget, "id" | "created_at" | "updated_at"> & {
    id?: string;
};

// ============================================
// Update Types (für Aktualisierungen)
// ============================================

export type ProfileUpdate = Partial<
    Omit<Profile, "id" | "created_at" | "updated_at">
>;

export type CategoryUpdate = Partial<
    Omit<Category, "id" | "user_id" | "created_at">
>;

export type TransactionUpdate = Partial<
    Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
>;

export type BudgetUpdate = Partial<
    Omit<Budget, "id" | "user_id" | "created_at" | "updated_at">
>;

// ============================================
// Joined / Enriched Types
// ============================================

export interface TransactionWithCategory extends Transaction {
    category: Category;
}

export interface BudgetWithCategory extends Budget {
    category: Category;
    spent: number;
}

// ============================================
// Supabase Database Type Map
// ============================================

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: ProfileInsert;
                Update: ProfileUpdate;
            };
            categories: {
                Row: Category;
                Insert: CategoryInsert;
                Update: CategoryUpdate;
            };
            transactions: {
                Row: Transaction;
                Insert: TransactionInsert;
                Update: TransactionUpdate;
            };
            budgets: {
                Row: Budget;
                Insert: BudgetInsert;
                Update: BudgetUpdate;
            };
        };
    };
}
