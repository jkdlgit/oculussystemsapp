-- ============================================================
-- SUPABASE SCHEMA: Quiz Visual Oculus - Esquemas DEV y PRO
-- ============================================================
-- Pega este script completo en el SQL Editor de tu proyecto Supabase
-- (Dashboard > SQL Editor > New query) y haz clic en RUN.
-- Creará y configurará automáticamente las tablas y permisos en ambos esquemas.
-- ============================================================

-- Crear esquemas si no existen
CREATE SCHEMA IF NOT EXISTS dev;
CREATE SCHEMA IF NOT EXISTS pro;

-- Conceder uso de los esquemas a los roles del API de Supabase
GRANT USAGE ON SCHEMA dev TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA pro TO anon, authenticated, service_role;

-- ============================================================
-- 1. CONFIGURACIÓN PARA EL ESQUEMA: dev
-- ============================================================

-- 1.1 Crear tabla dev.leads
CREATE TABLE IF NOT EXISTS dev.leads (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre        TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  edad          INTEGER NOT NULL,
  respuestas    JSONB NOT NULL DEFAULT '{}'::jsonb,
  resultado     TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  estado        TEXT NOT NULL DEFAULT 'Nuevo',
  owner         TEXT DEFAULT 'publicidad',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Agregar comentarios
COMMENT ON TABLE  dev.leads IS 'Leads generados desde el Quiz Visual Oculus (Desarrollo)';
COMMENT ON COLUMN dev.leads.respuestas IS 'Respuestas del quiz en formato JSON: { sintomas, vision_lejos, vision_cerca, problemas_colores, detalle_colores }';
COMMENT ON COLUMN dev.leads.estado IS 'Estado del lead: Nuevo, Contactado, Agendado, Atendido, Descartado';

-- 1.3 Crear índices
CREATE INDEX IF NOT EXISTS idx_leads_estado_dev ON dev.leads (estado);
CREATE INDEX IF NOT EXISTS idx_leads_created_dev ON dev.leads (created_at DESC);

-- 1.4 Habilitar RLS
ALTER TABLE dev.leads ENABLE ROW LEVEL SECURITY;

-- 1.5 Crear políticas RLS para dev
DROP POLICY IF EXISTS "Permitir insercion anonima de leads dev" ON dev.leads;
CREATE POLICY "Permitir insercion anonima de leads dev"
  ON dev.leads FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura anonima de leads dev" ON dev.leads;
CREATE POLICY "Permitir lectura anonima de leads dev"
  ON dev.leads FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Permitir actualizacion anonima de leads dev" ON dev.leads;
CREATE POLICY "Permitir actualizacion anonima de leads dev"
  ON dev.leads FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Solo autenticados pueden leer leads dev" ON dev.leads;
CREATE POLICY "Solo autenticados pueden leer leads dev"
  ON dev.leads FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Solo autenticados pueden actualizar leads dev" ON dev.leads;
CREATE POLICY "Solo autenticados pueden actualizar leads dev"
  ON dev.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Solo autenticados pueden eliminar leads dev" ON dev.leads;
CREATE POLICY "Solo autenticados pueden eliminar leads dev"
  ON dev.leads FOR DELETE TO authenticated USING (true);

-- 1.6 Conceder permisos sobre tablas y secuencias en dev
GRANT ALL ON ALL TABLES IN SCHEMA dev TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA dev GRANT ALL ON TABLES TO anon, authenticated, service_role;


-- ============================================================
-- 2. CONFIGURACIÓN PARA EL ESQUEMA: pro
-- ============================================================

-- 2.1 Crear tabla pro.leads
CREATE TABLE IF NOT EXISTS pro.leads (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre        TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  edad          INTEGER NOT NULL,
  respuestas    JSONB NOT NULL DEFAULT '{}'::jsonb,
  resultado     TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  estado        TEXT NOT NULL DEFAULT 'Nuevo',
  owner         TEXT DEFAULT 'publicidad',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Agregar comentarios
COMMENT ON TABLE  pro.leads IS 'Leads generados desde el Quiz Visual Oculus (Producción)';
COMMENT ON COLUMN pro.leads.respuestas IS 'Respuestas del quiz en formato JSON: { sintomas, vision_lejos, vision_cerca, problemas_colores, detalle_colores }';
COMMENT ON COLUMN pro.leads.estado IS 'Estado del lead: Nuevo, Contactado, Agendado, Atendido, Descartado';

-- 2.3 Crear índices
CREATE INDEX IF NOT EXISTS idx_leads_estado_pro ON pro.leads (estado);
CREATE INDEX IF NOT EXISTS idx_leads_created_pro ON pro.leads (created_at DESC);

-- 2.4 Habilitar RLS
ALTER TABLE pro.leads ENABLE ROW LEVEL SECURITY;

-- 2.5 Crear políticas RLS para pro
DROP POLICY IF EXISTS "Permitir insercion anonima de leads pro" ON pro.leads;
CREATE POLICY "Permitir insercion anonima de leads pro"
  ON pro.leads FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura anonima de leads pro" ON pro.leads;
CREATE POLICY "Permitir lectura anonima de leads pro"
  ON pro.leads FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Permitir actualizacion anonima de leads pro" ON pro.leads;
CREATE POLICY "Permitir actualizacion anonima de leads pro"
  ON pro.leads FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Solo autenticados pueden leer leads pro" ON pro.leads;
CREATE POLICY "Solo autenticados pueden leer leads pro"
  ON pro.leads FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Solo autenticados pueden actualizar leads pro" ON pro.leads;
CREATE POLICY "Solo autenticados pueden actualizar leads pro"
  ON pro.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Solo autenticados pueden eliminar leads pro" ON pro.leads;
CREATE POLICY "Solo autenticados pueden eliminar leads pro"
  ON pro.leads FOR DELETE TO authenticated USING (true);

-- 2.6 Conceder permisos sobre tablas y secuencias en pro
GRANT ALL ON ALL TABLES IN SCHEMA pro TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pro TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA pro GRANT ALL ON TABLES TO anon, authenticated, service_role;
