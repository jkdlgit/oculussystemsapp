-- ============================================================
-- FIX: Agregar políticas RLS para que el rol 'anon' pueda
-- SELECT y UPDATE en leads (dev y pro).
-- 
-- PROBLEMA: El dashboard usa la ANON KEY de Supabase, pero las
-- políticas RLS solo permiten SELECT/UPDATE para 'authenticated'.
-- Esto hace que los UPDATE silenciosamente afecten 0 filas,
-- y las citas vuelvan a verse "verdes" después de recargar.
--
-- EJECUCIÓN: Pega este script en Supabase Dashboard > SQL Editor > Run
-- ============================================================

-- ===== ESQUEMA DEV =====

-- Permitir que anon pueda leer leads (necesario para el dashboard sin auth)
DROP POLICY IF EXISTS "Permitir lectura anonima de leads dev" ON dev.leads;
CREATE POLICY "Permitir lectura anonima de leads dev"
  ON dev.leads FOR SELECT TO anon USING (true);

-- Permitir que anon pueda actualizar leads (necesario para cambiar estado_cita)
DROP POLICY IF EXISTS "Permitir actualizacion anonima de leads dev" ON dev.leads;
CREATE POLICY "Permitir actualizacion anonima de leads dev"
  ON dev.leads FOR UPDATE TO anon USING (true) WITH CHECK (true);


-- ===== ESQUEMA PRO =====

-- Permitir que anon pueda leer leads
DROP POLICY IF EXISTS "Permitir lectura anonima de leads pro" ON pro.leads;
CREATE POLICY "Permitir lectura anonima de leads pro"
  ON pro.leads FOR SELECT TO anon USING (true);

-- Permitir que anon pueda actualizar leads
DROP POLICY IF EXISTS "Permitir actualizacion anonima de leads pro" ON pro.leads;
CREATE POLICY "Permitir actualizacion anonima de leads pro"
  ON pro.leads FOR UPDATE TO anon USING (true) WITH CHECK (true);


-- ===== VERIFICAR =====
-- Después de ejecutar, puedes verificar las políticas con:
-- SELECT * FROM pg_policies WHERE tablename = 'leads';
