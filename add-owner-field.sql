-- ============================================================
-- SQL MIGRATION: Agregar columna 'owner' para Leads y Pacientes
-- ============================================================
-- Pega este script en tu editor SQL de Supabase (SQL Editor > New Query) y haz clic en RUN.
-- Agregará de forma segura el campo 'owner' en minúsculas en ambos esquemas (dev, pro y public).

-- 1. Agregar columna 'owner' a la tabla 'leads'
ALTER TABLE IF EXISTS public.leads ADD COLUMN IF NOT EXISTS owner TEXT DEFAULT 'publicidad';
ALTER TABLE IF EXISTS dev.leads ADD COLUMN IF NOT EXISTS owner TEXT DEFAULT 'publicidad';
ALTER TABLE IF EXISTS pro.leads ADD COLUMN IF NOT EXISTS owner TEXT DEFAULT 'publicidad';

-- 2. Agregar columna 'owner' a la tabla 'pacientes'
ALTER TABLE IF EXISTS public.pacientes ADD COLUMN IF NOT EXISTS owner TEXT DEFAULT 'publicidad';
ALTER TABLE IF EXISTS dev.pacientes ADD COLUMN IF NOT EXISTS owner TEXT DEFAULT 'publicidad';
ALTER TABLE IF EXISTS pro.pacientes ADD COLUMN IF NOT EXISTS owner TEXT DEFAULT 'publicidad';

-- 3. Documentar la columna en Supabase
COMMENT ON COLUMN public.leads.owner IS 'Indica si el lead llegó por publicidad o registrado por especialista (valores: publicidad, especialista)';
COMMENT ON COLUMN dev.leads.owner IS 'Indica si el lead llegó por publicidad o registrado por especialista (valores: publicidad, especialista)';
COMMENT ON COLUMN pro.leads.owner IS 'Indica si el lead llegó por publicidad o registrado por especialista (valores: publicidad, especialista)';

COMMENT ON COLUMN public.pacientes.owner IS 'Indica si el paciente llegó por publicidad o heredado del lead (valores: publicidad, especialista)';
COMMENT ON COLUMN dev.pacientes.owner IS 'Indica si el paciente llegó por publicidad o heredado del lead (valores: publicidad, especialista)';
COMMENT ON COLUMN pro.pacientes.owner IS 'Indica si el paciente llegó por publicidad o heredado del lead (valores: publicidad, especialista)';
