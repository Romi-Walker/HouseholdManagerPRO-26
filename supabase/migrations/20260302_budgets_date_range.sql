-- Migration: Budgets von Monat/Jahr zu Start-/Enddatum
-- =====================================================

-- 1. Neue Spalten hinzufuegen
ALTER TABLE public.budgets ADD COLUMN start_date date;
ALTER TABLE public.budgets ADD COLUMN end_date date;

-- 2. Bestehende Daten migrieren: month/year → erster/letzter Tag des Monats
UPDATE public.budgets
SET
  start_date = make_date(year, month, 1),
  end_date   = (make_date(year, month, 1) + interval '1 month' - interval '1 day')::date;

-- 3. NOT NULL setzen + CHECK constraint
ALTER TABLE public.budgets ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE public.budgets ALTER COLUMN end_date SET NOT NULL;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_date_range_valid CHECK (end_date >= start_date);

-- 4. Alten Unique-Constraint + Spalten droppen
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_user_id_category_id_month_year_key;
ALTER TABLE public.budgets DROP COLUMN month;
ALTER TABLE public.budgets DROP COLUMN year;

-- 5. btree_gist Extension fuer EXCLUDE constraint (Ueberlappungsschutz)
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.budgets ADD CONSTRAINT budgets_no_overlap
  EXCLUDE USING gist (
    user_id WITH =,
    category_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  );
