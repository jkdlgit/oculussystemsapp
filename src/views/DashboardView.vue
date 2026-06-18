<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">👁️</span>
        <span class="brand-name">VERITAS</span>
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item active">
          <span class="nav-icon">📅</span>
          <span class="nav-label">Citas</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <div class="specialist-badge">
          <span class="specialist-avatar">👤</span>
          <span class="specialist-name">Especialista</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="dash-header">
        <div class="header-left">
          <h1 class="page-title">Citas</h1>
          <p class="page-subtitle">Gestión de agenda del especialista</p>
        </div>
        <div class="header-right">
          <div class="stats-pill">
            <span class="stats-icon">🟢</span>
            <span class="stats-text">
              <strong>{{ nuevas }}</strong> nuevas
            </span>
          </div>
          <button class="btn-refresh" @click="fetchCitas" :disabled="loading" title="Actualizar">
            <span :class="{ 'spin': loading }">🔄</span>
          </button>
        </div>
      </header>

      <!-- Alerts / Estados -->
      <div v-if="!hasConfig" class="alert alert-warning">
        ⚠️ No hay configuración de Supabase. Mostrando datos de ejemplo.
      </div>
      <div v-if="error && hasConfig" class="alert alert-error">
        ❌ {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Cargando citas...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && citas.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3 class="empty-title">Sin citas registradas</h3>
        <p class="empty-desc">Aún no hay ninguna agenda creada. Cuando los pacientes completen el formulario, aparecerán aquí.</p>
      </div>

      <!-- Table -->
      <div v-else class="table-container">
        <table class="citas-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Teléfono</th>
              <th>Edad</th>
              <th>Fecha Agendada</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Síntomas</th>
              <th>Registrado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cita in citas" :key="cita.id" :class="rowClass(cita.estado)">
              <td class="td-name">
                <div class="patient-cell">
                  <div class="patient-avatar">{{ cita.nombre.charAt(0).toUpperCase() }}</div>
                  <span>{{ cita.nombre }}</span>
                </div>
              </td>
              <td>
                <a :href="`https://wa.me/${cleanPhone(cita.telefono)}`" target="_blank" class="phone-link">
                  📱 {{ cita.telefono }}
                </a>
              </td>
              <td class="td-center">{{ cita.edad ?? '—' }}</td>
              <td class="td-center">{{ formatDate(cita.fecha_cita) }}</td>
              <td class="td-center">{{ cita.hora_cita || '—' }}</td>
              <td class="td-center">
                <span class="status-badge" :class="statusClass(cita.estado)">
                  {{ statusLabel(cita.estado) }}
                </span>
              </td>
              <td class="td-sintomas">
                <span v-if="cita.sintomas && cita.sintomas.length" class="sintomas-list">
                  {{ formatSintomas(cita.sintomas) }}
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="td-center text-muted">{{ formatDateTime(cita.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <footer class="dash-footer">
        <p>© {{ new Date().getFullYear() }} Oculus Systems — Panel del Especialista</p>
        <p class="footer-count" v-if="citas.length">{{ citas.length }} cita(s) cargadas</p>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase, hasSupabaseConfig } from '@/supabase'

const hasConfig = hasSupabaseConfig

interface Cita {
  id: string
  nombre: string
  telefono: string
  edad: number | null
  fecha_cita: string | null
  hora_cita: string | null
  estado: string | null
  sintomas: string[] | null
  created_at: string
}

const citas = ref<Cita[]>([])
const loading = ref(false)
const error = ref('')

// Mock data for when Supabase is not configured
const mockData: Cita[] = [
  {
    id: '1',
    nombre: 'María González',
    telefono: '+52 55 1234 5678',
    edad: 34,
    fecha_cita: '2026-06-20',
    hora_cita: '10:00',
    estado: 'nueva',
    sintomas: ['fatiga', 'dolor_cabeza'],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Carlos Ramírez',
    telefono: '+52 55 9876 5432',
    edad: 45,
    fecha_cita: '2026-06-21',
    hora_cita: '11:30',
    estado: 'atendida',
    sintomas: ['secos', 'sensibilidad'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    nombre: 'Sofía Martínez',
    telefono: '+52 55 5555 1212',
    edad: 28,
    fecha_cita: '2026-06-18',
    hora_cita: '09:00',
    estado: 'no_asistio',
    sintomas: ['ardor'],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

const nuevas = computed(() => citas.value.filter(c => c.estado === 'nueva').length)

async function fetchCitas() {
  loading.value = true
  error.value = ''
  console.log('[Dashboard] Iniciando carga de citas...')

  if (!hasConfig) {
    console.warn('[Dashboard] Sin configuración Supabase — usando datos mock')
    await new Promise(r => setTimeout(r, 600))
    citas.value = sortCitas(mockData)
    loading.value = false
    return
  }

  try {
    console.log('[Dashboard] Consultando tabla "leads" en Supabase...')
    const { data, error: sbError } = await supabase
      .from('leads')
      .select('id, nombre, telefono, edad, fecha_cita, hora_cita, estado, sintomas, created_at')
      .order('created_at', { ascending: false })

    if (sbError) {
      console.error('[Dashboard] Error de Supabase:', sbError.message)
      error.value = `Error al cargar citas: ${sbError.message}`
      citas.value = []
    } else {
      console.log(`[Dashboard] Se cargaron ${data?.length ?? 0} citas.`, data)
      citas.value = sortCitas((data as Cita[]) || [])
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    console.error('[Dashboard] Excepción inesperada:', msg)
    error.value = `Error inesperado: ${msg}`
  } finally {
    loading.value = false
  }
}

/** Ordena: Nuevas → Atendidas → No asistió */
function sortCitas(list: Cita[]): Cita[] {
  const order: Record<string, number> = { nueva: 0, atendida: 1, no_asistio: 2 }
  return [...list].sort((a, b) => {
    const ea = order[a.estado ?? ''] ?? 9
    const eb = order[b.estado ?? ''] ?? 9
    if (ea !== eb) return ea - eb
    // Secondary sort: fecha_cita asc
    const da = a.fecha_cita ?? ''
    const db = b.fecha_cita ?? ''
    return da.localeCompare(db)
  })
}

function statusClass(estado: string | null): string {
  const map: Record<string, string> = {
    nueva: 'status-nueva',
    atendida: 'status-atendida',
    no_asistio: 'status-no-asistio',
  }
  return map[estado ?? ''] ?? 'status-default'
}

function statusLabel(estado: string | null): string {
  const map: Record<string, string> = {
    nueva: '🟢 Nueva',
    atendida: '✅ Atendida',
    no_asistio: '❌ No asistió',
  }
  return map[estado ?? ''] ?? estado ?? 'Desconocido'
}

function rowClass(estado: string | null): string {
  const map: Record<string, string> = {
    nueva: 'row-nueva',
    atendida: 'row-atendida',
    no_asistio: 'row-no-asistio',
  }
  return map[estado ?? ''] ?? ''
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function formatDateTime(dt: string): string {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatSintomas(sintomas: string[]): string {
  const labels: Record<string, string> = {
    fatiga: 'Fatiga',
    dolor_cabeza: 'Dolor de cabeza',
    ardor: 'Ardor',
    secos: 'Ojos secos',
    lagrimeo: 'Lagrimeo',
    sensibilidad: 'Sensibilidad',
    ninguna: 'Ninguno',
  }
  return sintomas.map(s => labels[s] ?? s).join(', ')
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

onMounted(() => {
  console.log('[Dashboard] Vista montada — cargando citas')
  fetchCitas()
})
</script>

<style scoped>
/* ===== LAYOUT ===== */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #0f172a;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-right: 1px solid rgba(99, 179, 237, 0.1);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 28px 20px 24px;
  border-bottom: 1px solid rgba(99, 179, 237, 0.1);
}

.brand-icon {
  font-size: 1.6rem;
  filter: drop-shadow(0 0 8px rgba(99, 179, 237, 0.6));
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #63b3ed, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
}

.nav-item:hover {
  background: rgba(99, 179, 237, 0.1);
  color: #e2e8f0;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(99, 179, 237, 0.2), rgba(167, 139, 250, 0.15));
  color: #63b3ed;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(99, 179, 237, 0.3);
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(99, 179, 237, 0.1);
}

.specialist-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.specialist-avatar {
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  background: rgba(99, 179, 237, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.specialist-name {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0;
}

/* ===== HEADER ===== */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: rgba(30, 41, 59, 0.8);
  border-bottom: 1px solid rgba(99, 179, 237, 0.1);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #e2e8f0;
  margin: 0 0 2px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(99, 179, 237, 0.1);
  border: 1px solid rgba(99, 179, 237, 0.25);
  border-radius: 999px;
  color: #63b3ed;
  font-size: 0.85rem;
}

.btn-refresh {
  background: rgba(99, 179, 237, 0.1);
  border: 1px solid rgba(99, 179, 237, 0.25);
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  color: #63b3ed;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(99, 179, 237, 0.2);
  transform: scale(1.05);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== ALERTS ===== */
.alert {
  margin: 16px 32px 0;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.alert-warning {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.alert-error {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
}

/* ===== LOADING ===== */
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px;
  color: #64748b;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(99, 179, 237, 0.2);
  border-top-color: #63b3ed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 0.9rem;
  color: #64748b;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  filter: grayscale(0.3);
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 8px;
}

.empty-desc {
  font-size: 0.85rem;
  color: #64748b;
  max-width: 400px;
  line-height: 1.6;
}

/* ===== TABLE ===== */
.table-container {
  flex: 1;
  padding: 24px 32px;
  overflow-x: auto;
}

.citas-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  color: #cbd5e1;
}

.citas-table thead tr {
  background: rgba(30, 41, 59, 0.9);
}

.citas-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  border-bottom: 2px solid rgba(99, 179, 237, 0.15);
  white-space: nowrap;
}

.citas-table td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(99, 179, 237, 0.06);
  vertical-align: middle;
}

.citas-table tbody tr {
  transition: background 0.15s ease;
}

.citas-table tbody tr:hover {
  background: rgba(99, 179, 237, 0.05);
}

/* Row highlight por estado */
.row-nueva td:first-child {
  border-left: 3px solid #10b981;
}

.row-atendida td:first-child {
  border-left: 3px solid #3b82f6;
}

.row-no-asistio td:first-child {
  border-left: 3px solid #ef4444;
}

.td-center {
  text-align: center;
}

.td-name {
  font-weight: 600;
  color: #e2e8f0;
}

/* Patient cell */
.patient-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.patient-avatar {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #63b3ed, #a78bfa);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: #0f172a;
  flex-shrink: 0;
}

/* Phone link */
.phone-link {
  color: #63b3ed;
  text-decoration: none;
  font-size: 0.82rem;
  transition: color 0.2s;
  white-space: nowrap;
}

.phone-link:hover {
  color: #a78bfa;
  text-decoration: underline;
}

/* Status badge */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-nueva {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-atendida {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-no-asistio {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-default {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.td-sintomas {
  max-width: 200px;
  font-size: 0.8rem;
  color: #94a3b8;
}

.text-muted {
  color: #475569;
}

/* ===== FOOTER ===== */
.dash-footer {
  padding: 16px 32px;
  border-top: 1px solid rgba(99, 179, 237, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #475569;
}

.footer-count {
  color: #64748b;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
    min-width: 60px;
  }

  .brand-name,
  .nav-label,
  .specialist-name {
    display: none;
  }

  .sidebar-brand {
    justify-content: center;
    padding: 20px 0;
  }

  .nav-item {
    justify-content: center;
    padding: 12px;
  }

  .specialist-badge {
    justify-content: center;
  }

  .specialist-avatar {
    margin: 0 auto;
  }

  .dash-header {
    padding: 16px 20px;
  }

  .table-container {
    padding: 16px 20px;
  }

  .dash-footer {
    padding: 12px 20px;
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
}
</style>
