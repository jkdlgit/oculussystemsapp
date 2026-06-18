<template>
  <div class="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
    <!-- Sidebar -->
    <aside :class="['z-20 flex shrink-0 flex-col border-r border-slate-800 bg-slate-900 py-6 transition-all duration-300 ease-in-out', isSidebarExpanded ? 'w-64 items-stretch px-4' : 'w-16 items-center px-2']">
      <div :class="['mb-8 flex items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20', isSidebarExpanded ? 'h-12 w-full gap-3' : 'h-10 w-10 shrink-0']">
        <Activity :size="isSidebarExpanded ? 28 : 24" class="text-white shrink-0" />
        <span v-if="isSidebarExpanded" class="font-bold text-white text-lg tracking-wide">Oculus</span>
      </div>

      <nav class="flex w-full flex-col gap-2">
        <button :class="['group relative flex items-center rounded-xl p-3 transition-all', isSidebarExpanded ? 'justify-start gap-3' : 'justify-center', 'text-slate-400 hover:bg-slate-800 hover:text-white']">
          <LayoutDashboard :size="20" class="shrink-0" />
          <span v-if="isSidebarExpanded" class="font-medium text-sm">Dashboard</span>
        </button>

        <!-- Personas Menu -->
        <div class="flex flex-col">
          <button @click="isPersonasOpen = !isPersonasOpen; if (!isSidebarExpanded) isSidebarExpanded = true" :class="['group relative flex items-center rounded-xl p-3 transition-all', isSidebarExpanded ? 'justify-between' : 'justify-center', isPersonasOpen && isSidebarExpanded ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white']">
            <div class="flex items-center gap-3">
              <Users :size="20" class="shrink-0" />
              <span v-if="isSidebarExpanded" class="font-medium text-sm">Personas</span>
            </div>
            <ChevronDown v-if="isSidebarExpanded" :size="16" :class="{'rotate-180': isPersonasOpen}" class="transition-transform shrink-0" />
          </button>
          
          <!-- Personas Submenu -->
          <div v-if="isSidebarExpanded && isPersonasOpen" class="mt-2 flex flex-col gap-1 pl-10 pr-2 overflow-hidden transition-all">
            <button @click="setView('citas')" :class="['flex items-center gap-2 rounded-lg py-2 px-2 text-sm font-medium transition-colors', currentView === 'citas' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200']">
              <CalendarDays :size="16" class="shrink-0" /> Citas
            </button>
            <button @click="setView('pacientes')" :class="['flex items-center gap-2 rounded-lg py-2 px-2 text-sm font-medium transition-colors', currentView === 'pacientes' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200']">
              <HeartPulse :size="16" class="shrink-0" /> Pacientes
            </button>
            <button @click="setView('leads')" :class="['flex items-center gap-2 rounded-lg py-2 px-2 text-sm font-medium transition-colors', currentView === 'leads' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200']">
              <Target :size="16" class="shrink-0" /> Leads
            </button>
          </div>
        </div>

        <button :class="['group relative flex items-center rounded-xl p-3 transition-all text-slate-400 hover:bg-slate-800 hover:text-white', isSidebarExpanded ? 'justify-start gap-3' : 'justify-center']">
          <Bell :size="20" class="shrink-0" />
          <span v-if="isSidebarExpanded" class="font-medium text-sm">Notificaciones</span>
        </button>
      </nav>

      <div class="mt-auto flex w-full flex-col gap-2">
        <button @click="isSidebarExpanded = !isSidebarExpanded" :class="['flex items-center rounded-xl p-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white', isSidebarExpanded ? 'justify-start gap-3' : 'justify-center']">
          <PanelLeftClose v-if="isSidebarExpanded" :size="20" class="shrink-0" />
          <PanelLeftOpen v-else :size="20" class="shrink-0" />
          <span v-if="isSidebarExpanded" class="font-medium text-sm">Contraer</span>
        </button>
        <button :class="['flex items-center rounded-xl p-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white', isSidebarExpanded ? 'justify-start gap-3' : 'justify-center']">
          <Settings :size="20" class="shrink-0" />
          <span v-if="isSidebarExpanded" class="font-medium text-sm">Configuración</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex min-w-0 flex-1 flex-col">
      <!-- Header -->
      <header class="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="relative max-w-sm flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
            <input
              type="text"
              :placeholder="currentView === 'pacientes' ? 'Buscar paciente...' : currentView === 'leads' ? 'Buscar lead...' : 'Buscar por nombre o teléfono...'"
              v-model="searchQuery"
              class="w-full rounded-lg border border-transparent bg-slate-100 py-2 pl-10 pr-4 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        <div class="ml-4 flex items-center gap-3">
          <button @click="refreshCurrentView" :disabled="loading" class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
            <RefreshCw :size="16" :class="{ 'animate-spin': loading }" class="text-slate-400" /> {{ loading ? 'Cargando...' : 'Actualizar' }}
          </button>
          <div v-if="currentView === 'citas'" class="relative">
            <select
              v-model="sortBy"
              class="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="recent">Ordenar: Más Reciente</option>
              <option value="date">Ordenar: Fecha Cita</option>
              <option value="severity">Ordenar: Estado</option>
            </select>
            <ArrowDownUp
              :size="14"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 lg:p-8 relative">
        <div class="mx-auto max-w-6xl pb-12">

          <!-- Header del area principal -->
          <div class="mb-6 flex items-end justify-between">
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-slate-900">
                <span v-if="currentView === 'citas'">Citas del Día</span>
                <span v-else-if="currentView === 'pacientes'">Pacientes</span>
                <span v-else-if="currentView === 'leads'">Todos los Leads</span>
              </h1>
              <p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                <span v-if="currentView === 'citas'">Solo citas de las últimas 24 horas y futuras</span>
                <span v-else-if="currentView === 'pacientes'">Todos los pacientes registrados</span>
                <span v-else-if="currentView === 'leads'">Historial completo de leads</span>
              </p>
            </div>
          </div>

          <div v-if="!hasConfig" class="mb-6 rounded-lg bg-yellow-50 p-4 border border-yellow-200 text-sm text-yellow-800">
            ⚠️ No hay configuración de Supabase. Mostrando datos de ejemplo.
          </div>
          <div v-if="error" class="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-800">
            ❌ {{ error }}
          </div>

          <!-- VISTA: CITAS -->
          <div v-if="currentView === 'citas'" class="flex flex-col gap-1">
            <template v-if="sortedCitas.length > 0">
              <div
                v-for="cita in sortedCitas"
                :key="cita.id"
                :class="[
                  'mb-3 overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white shadow-sm transition-all duration-200 hover:shadow-md',
                  getSeverityConfig(cita.estado_cita).border
                ]"
              >
                <div
                  class="flex cursor-pointer flex-col items-start gap-4 p-4 lg:flex-row lg:items-center"
                  @click="toggleExpand(cita.id)"
                >
                  <div class="flex flex-1 flex-col gap-2">
                    <div class="flex items-center gap-3">
                      <h3 class="text-lg font-semibold leading-tight text-slate-900">{{ cita.nombre }}</h3>
                      <a :href="`https://wa.me/${cleanPhone(cita.telefono)}`" target="_blank" @click.stop class="rounded border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors">
                        📱 {{ cita.telefono }}
                      </a>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-white shadow-sm">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Edad</span>
                        <span class="text-sm font-bold">{{ cita.edad ?? 'N/A' }}</span>
                      </div>
                      <div :class="['flex items-center gap-1.5 rounded border px-2.5 py-0.5 text-xs font-bold tracking-wide', getSeverityConfig(cita.estado_cita).badge]">
                        <component :is="getSeverityConfig(cita.estado_cita).icon" :size="14" />
                        {{ cita.estado_cita || 'Nueva' }}
                      </div>
                    </div>
                  </div>

                  <div class="grid w-full flex-1 grid-cols-2 gap-4 lg:w-auto lg:grid-cols-4">
                    <div class="flex flex-col">
                      <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Fecha Cita</span>
                      <span class="truncate text-sm font-medium text-slate-700">{{ formatDate(cita.fecha_cita) }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Hora</span>
                      <span class="truncate text-sm text-slate-700">{{ cita.hora_cita || '—' }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Resultado</span>
                      <span class="truncate text-sm text-slate-700">{{ cita.resultado || 'Consulta' }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Origen</span>
                      <span class="truncate text-sm text-slate-700">{{ cita.origen || 'Desconocido' }}</span>
                    </div>
                  </div>

                  <div class="flex w-full shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3 lg:w-auto lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                    <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">E</div>
                      <span class="pr-1 text-xs font-medium text-slate-600">Especialista</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <template v-if="cita.estado_cita === 'Nueva' || !cita.estado_cita">
                        <button @click.stop="openAtender(cita)" class="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-200">
                          <CheckCircle2 :size="14" /> Atender
                        </button>
                        <button @click.stop="cancelarCita(cita)" class="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-200 ml-1">
                          <XCircle :size="14" /> Cancelar
                        </button>
                        <div class="mx-2 h-4 w-px bg-slate-300"></div>
                      </template>
                      <button class="rounded p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" @click.stop>
                        <Eye :size="16" />
                      </button>
                      <button class="rounded p-1.5 text-slate-400 transition-colors hover:text-slate-800">
                        <ChevronUp v-if="expandedId === cita.id" :size="20" />
                        <ChevronDown v-else :size="20" />
                      </button>
                    </div>
                  </div>
                </div>

                <div :class="['grid transition-all duration-300 ease-in-out', expandedId === cita.id ? 'grid-rows-[1fr] border-t border-slate-100 opacity-100' : 'grid-rows-[0fr] opacity-0']">
                  <div class="overflow-hidden bg-slate-50/50">
                    <div class="grid gap-6 p-5 lg:grid-cols-2">
                      <div class="flex flex-col gap-5">
                        <div>
                          <h4 class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <AlertOctagon :size="14" class="text-red-500" /> Síntomas Reportados
                          </h4>
                          <div class="rounded-lg border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-700 shadow-sm">
                            {{ formatSintomas(getSintomas(cita.respuestas)) || 'Ningún síntoma específico reportado.' }}
                          </div>
                        </div>
                        <div>
                          <h4 class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <CheckCircle2 :size="14" class="text-green-500" /> Evaluación
                          </h4>
                          <div class="rounded-lg border border-slate-200 border-l-4 border-l-green-400 bg-white p-3.5 text-sm leading-relaxed text-slate-700 shadow-sm">
                            {{ cita.resultado ? 'Resultado del quiz: ' + cita.resultado : 'Pendiente de evaluación médica en consulta.' }}
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-col gap-5">
                        <div class="flex flex-1 flex-col">
                          <h4 class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Cpu :size="14" class="text-slate-400" /> Metadata de Respuestas
                          </h4>
                          <div class="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-inner">
                            <div class="flex flex-col"><span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Visión de Lejos</span><span class="font-mono text-xs text-indigo-400">{{ cita.respuestas?.vision_lejos || 'N/A' }}</span></div>
                            <div class="flex flex-col"><span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Visión de Cerca</span><span class="font-mono text-xs text-emerald-400">{{ cita.respuestas?.vision_cerca || 'N/A' }}</span></div>
                            <div class="flex flex-col"><span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Problemas Colores</span><span class="font-mono text-xs text-blue-400">{{ cita.respuestas?.problemas_colores || 'N/A' }}</span></div>
                            <div class="flex flex-col"><span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Detalle Colores</span><span class="font-mono text-xs text-amber-400 truncate">{{ cita.respuestas?.detalle_colores || 'N/A' }}</span></div>
                            <div class="col-span-2 flex flex-col"><span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Hora Asignada</span><span class="font-mono text-xs text-slate-300">{{ cita.hora_cita || 'Sin hora' }}</span></div>
                          </div>
                        </div>
                        <div class="flex flex-col">
                          <h4 class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Clock :size="14" class="text-slate-400" /> Registro
                          </h4>
                          <div class="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
                            <div class="relative flex items-start gap-3">
                              <div class="mt-1 flex flex-col items-center"><div class="relative z-10 h-2 w-2 rounded-full bg-indigo-500"></div></div>
                              <span class="mt-0.5 font-mono text-xs text-slate-600">{{ formatDateTime(cita.created_at) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else-if="!loading" class="rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
              <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <CalendarDays :size="24" class="text-slate-400" />
              </div>
              <h3 class="text-lg font-medium text-slate-900">No hay citas para hoy</h3>
              <p class="mt-1 text-sm text-slate-500">Las citas pasadas aparecen en la sección de Leads.</p>
            </div>
            <div v-if="loading" class="py-12 text-center text-slate-500 flex flex-col items-center">
               <RefreshCw class="animate-spin mb-4" :size="32" />
               <p>Cargando citas...</p>
            </div>
          </div>

          <!-- VISTA: PACIENTES -->
          <div v-else-if="currentView === 'pacientes'">
            <div v-if="loading" class="py-12 text-center text-slate-500 flex flex-col items-center">
              <RefreshCw class="animate-spin mb-4" :size="32" /><p>Cargando pacientes...</p>
            </div>
            <div v-else-if="filteredPacientes.length === 0" class="rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
              <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><HeartPulse :size="24" class="text-slate-400" /></div>
              <h3 class="text-lg font-medium text-slate-900">No hay pacientes registrados</h3>
              <p class="mt-1 text-sm text-slate-500">Los pacientes aparecen aquí después de ser atendidos.</p>
            </div>
            <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">#</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Nombre</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Teléfono</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Edad</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Registrado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(pac, idx) in filteredPacientes" :key="pac.id" class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3 text-slate-400 font-mono text-xs">{{ idx + 1 }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">{{ pac.nombre?.charAt(0).toUpperCase() }}</div>
                        <span class="font-semibold text-slate-800">{{ pac.nombre }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <a :href="`https://wa.me/${cleanPhone(pac.telefono || '')}`" target="_blank" class="text-indigo-600 hover:underline font-medium">{{ pac.telefono || '—' }}</a>
                    </td>
                    <td class="px-4 py-3 text-slate-700">{{ pac.edad ? pac.edad + ' años' : '—' }}</td>
                    <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ formatDateTime(pac.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- VISTA: LEADS -->
          <div v-else-if="currentView === 'leads'">
            <div v-if="loading" class="py-12 text-center text-slate-500 flex flex-col items-center">
              <RefreshCw class="animate-spin mb-4" :size="32" /><p>Cargando leads...</p>
            </div>
            <div v-else-if="filteredLeads.length === 0" class="rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
              <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><Target :size="24" class="text-slate-400" /></div>
              <h3 class="text-lg font-medium text-slate-900">No hay leads registrados</h3>
              <p class="mt-1 text-sm text-slate-500">Los leads aparecen aquí cuando agendan una cita desde el quiz.</p>
            </div>
            <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">#</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Nombre</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Teléfono</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fecha Cita</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hora</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Origen</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Registrado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(lead, idx) in filteredLeads" :key="lead.id" class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3 text-slate-400 font-mono text-xs">{{ idx + 1 }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{{ lead.nombre?.charAt(0).toUpperCase() }}</div>
                        <span class="font-semibold text-slate-800">{{ lead.nombre }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <a :href="`https://wa.me/${cleanPhone(lead.telefono || '')}`" target="_blank" class="text-indigo-600 hover:underline font-medium">{{ lead.telefono || '—' }}</a>
                    </td>
                    <td class="px-4 py-3 text-slate-700">{{ formatDate(lead.fecha_cita) }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ lead.hora_cita || '—' }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{{ lead.origen || 'Quiz' }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold',
                        lead.estado_cita === 'Nueva' || !lead.estado_cita ? 'bg-emerald-100 text-emerald-700' :
                        lead.estado_cita === 'Atendida' ? 'bg-slate-100 text-slate-600' :
                        lead.estado_cita === 'NoAsistió' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      ]">{{ lead.estado_cita || 'Nueva' }}</span>
                    </td>
                    <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ formatDateTime(lead.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Modals Overlay -->
    <div v-if="isAtenderModalOpen || isExamenModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      
      <!-- Atender Modal -->
      <div v-if="isAtenderModalOpen && activeCita" class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 class="flex items-center gap-2 text-lg font-bold text-slate-800"><Eye :size="20" class="text-indigo-500"/> Atender Cita</h2>
          <button @click="closeAtender" class="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X :size="20"/></button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <h3 class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3">📋 Datos del Paciente</h3>
            <div class="space-y-2 text-sm text-slate-700">
              <p><span class="font-semibold w-24 inline-block">Nombre:</span> {{ activeCita.nombre }}</p>
              <p><span class="font-semibold w-24 inline-block">Teléfono:</span> {{ activeCita.telefono }}</p>
              <p><span class="font-semibold w-24 inline-block">Edad:</span> {{ activeCita.edad ?? 'N/A' }} años</p>
              <p><span class="font-semibold w-24 inline-block">Origen:</span> {{ activeCita.origen || 'Desconocido' }}</p>
              <p><span class="font-semibold w-24 inline-block">Agendado:</span> {{ formatDate(activeCita.fecha_cita) }} - {{ activeCita.hora_cita || 'Sin hora' }}</p>
            </div>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📋 Respuestas del Quiz</h3>
            <div class="space-y-2 text-sm text-slate-700">
              <p><span class="font-semibold w-36 inline-block">Síntomas:</span> {{ formatSintomas(getSintomas(activeCita.respuestas)) || 'Ninguno' }}</p>
              <p><span class="font-semibold w-36 inline-block">Visión lejos:</span> {{ activeCita.respuestas?.vision_lejos || 'N/A' }}</p>
              <p><span class="font-semibold w-36 inline-block">Visión cerca:</span> {{ activeCita.respuestas?.vision_cerca || 'N/A' }}</p>
              <p><span class="font-semibold w-36 inline-block">Problemas colores:</span> {{ activeCita.respuestas?.problemas_colores || 'N/A' }}</p>
              <p v-if="activeCita.respuestas?.detalle_colores"><span class="font-semibold w-36 inline-block">Detalle colores:</span> {{ activeCita.respuestas.detalle_colores }}</p>
            </div>
          </div>
        </div>
        
        <div class="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button @click="closeAtender" class="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cerrar</button>
          <button @click="openExamen" class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"><ClipboardList :size="16"/> Agregar Examen</button>
        </div>
      </div>

      <!-- Examen Modal -->
      <div v-if="isExamenModalOpen && activeCita" class="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 class="flex items-center gap-2 text-lg font-bold text-slate-800"><ClipboardList :size="20" class="text-indigo-500"/> Agregar Examen Visual</h2>
          <button @click="closeExamen" class="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X :size="20"/></button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <h3 class="font-semibold text-slate-800 mb-6 border-b pb-2">Paciente: <span class="text-indigo-600">{{ activeCita.nombre }}</span></h3>
          
          <form @submit.prevent="guardarExamen" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha del Examen *</label>
                <input type="date" v-model="examenForm.fecha_examen" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Próxima Revisión</label>
                <input type="date" v-model="examenForm.proxima_revision" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"/>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div class="space-y-4">
                <h4 class="font-bold text-sm text-slate-700">Ojo Derecho (OD)</h4>
                <div>
                  <label class="block text-xs text-slate-600 mb-1">Agudeza Visual</label>
                  <input type="text" v-model="examenForm.agudeza_visual_od" placeholder="ej. 20/20" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
                </div>
                <div>
                  <label class="block text-xs text-slate-600 mb-1 font-semibold">Esfera *</label>
                  <input type="number" step="0.25" v-model="examenForm.esfera_od" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
                </div>
                <div>
                  <label class="block text-xs text-slate-600 mb-1">Cilindro</label>
                  <input type="number" step="0.25" v-model="examenForm.cilindro_od" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
                </div>
                <div>
                  <label class="block text-xs text-slate-600 mb-1">Eje (°)</label>
                  <input type="number" v-model="examenForm.eje_od" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
                </div>
              </div>
              
              <div class="space-y-4">
                <h4 class="font-bold text-sm text-slate-700">Ojo Izquierdo (OI)</h4>
                <div>
                  <label class="block text-xs text-slate-600 mb-1">Agudeza Visual</label>
                  <input type="text" v-model="examenForm.agudeza_visual_oi" placeholder="ej. 20/25" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
                </div>
                <div>
                  <label class="block text-xs text-slate-600 mb-1 font-semibold">Esfera *</label>
                  <input type="number" step="0.25" v-model="examenForm.esfera_oi" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
                </div>
                <div>
                  <label class="block text-xs text-slate-600 mb-1">Cilindro</label>
                  <input type="number" step="0.25" v-model="examenForm.cilindro_oi" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
                </div>
                <div>
                  <label class="block text-xs text-slate-600 mb-1">Eje (°)</label>
                  <input type="number" v-model="examenForm.eje_oi" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-xs text-slate-600 mb-1">Adición (Presbicia)</label>
                <input type="number" step="0.25" v-model="examenForm.adicion" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
              </div>
              <div>
                <label class="block text-xs text-slate-600 mb-1">DIP (mm)</label>
                <input type="number" v-model="examenForm.dip" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
              </div>
              <div>
                <label class="block text-xs text-slate-600 mb-1">Presión Ocular (mmHg)</label>
                <input type="number" v-model="examenForm.presion_ocular" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
              </div>
            </div>

            <div>
              <label class="block text-xs text-slate-600 mb-1">Diagnóstico</label>
              <input type="text" v-model="examenForm.diagnostico" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"/>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs text-slate-600 mb-1">Observaciones</label>
                <textarea v-model="examenForm.observaciones" rows="3" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"></textarea>
              </div>
              <div>
                <label class="block text-xs text-slate-600 mb-1">Recomendaciones</label>
                <textarea v-model="examenForm.recomendaciones" rows="3" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 border"></textarea>
              </div>
            </div>

          </form>
        </div>
        
        <div class="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button type="button" @click="closeExamen" class="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
          <button @click="guardarExamen" :disabled="savingExamen" class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors">
            <RefreshCw v-if="savingExamen" class="animate-spin" :size="16"/>
            <Save v-else :size="16"/> 
            {{ savingExamen ? 'Guardando...' : 'Guardar Examen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownUp,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Edit2,
  Eye,
  LayoutDashboard,
  Search,
  Settings,
  Terminal,
  Info,
  RefreshCw,
  X,
  XCircle,
  ClipboardList,
  Save,
  Users,
  CalendarDays,
  HeartPulse,
  Target,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-vue-next'
import { supabase, hasSupabaseConfig } from '@/supabase'

const hasConfig = hasSupabaseConfig

interface Respuestas {
  sintomas?: string[]
  vision_lejos?: string
  vision_cerca?: string
  problemas_colores?: string
  detalle_colores?: string
}

interface Cita {
  id: string | number
  nombre: string
  telefono: string
  edad: number | null
  respuestas: Respuestas | null
  resultado: string | null
  estado: string | null
  fecha_cita: string | null
  hora_cita: string | null
  estado_cita: string | null
  origen: string | null
  created_at: string
}

interface Paciente {
  id: string
  lead_id: string | number | null
  nombre: string
  telefono: string | null
  edad: number | null
  created_at: string
}

const citas = ref<Cita[]>([])
const pacientes = ref<Paciente[]>([])
const todosLosLeads = ref<Cita[]>([])
const loading = ref(false)
const error = ref('')

const searchQuery = ref('')
const sortBy = ref('recent')
const expandedId = ref<string | number | null>(null)

// Navigation & Sidebar State
const currentView = ref<'citas' | 'pacientes' | 'leads'>('citas')
const isSidebarExpanded = ref(true)
const isPersonasOpen = ref(true)

function setView(view: 'citas' | 'pacientes' | 'leads') {
  currentView.value = view
  searchQuery.value = ''
  if (view === 'citas') fetchCitas()
  else if (view === 'pacientes') fetchPacientes()
  else if (view === 'leads') fetchTodosLosLeads()
}

function refreshCurrentView() {
  if (currentView.value === 'citas') fetchCitas()
  else if (currentView.value === 'pacientes') fetchPacientes()
  else if (currentView.value === 'leads') fetchTodosLosLeads()
}

// Modal State
const isAtenderModalOpen = ref(false)
const isExamenModalOpen = ref(false)
const activeCita = ref<Cita | null>(null)
const savingExamen = ref(false)

const createEmptyExamen = () => ({
  fecha_examen: new Date().toISOString().split('T')[0],
  agudeza_visual_od: '',
  agudeza_visual_oi: '',
  esfera_od: null as number | null,
  esfera_oi: null as number | null,
  cilindro_od: null as number | null,
  cilindro_oi: null as number | null,
  eje_od: null as number | null,
  eje_oi: null as number | null,
  adicion: null as number | null,
  dip: null as number | null,
  presion_ocular: null as number | null,
  diagnostico: '',
  observaciones: '',
  recomendaciones: '',
  proxima_revision: ''
})

const examenForm = ref(createEmptyExamen())

const mockData: Cita[] = [
  {
    id: '1',
    nombre: 'María González',
    telefono: '+52 55 1234 5678',
    edad: 34,
    respuestas: { sintomas: ['fatiga', 'dolor_cabeza'], vision_lejos: 'mucho', vision_cerca: 'poco' },
    resultado: 'Miopía leve',
    estado: 'Nuevo',
    fecha_cita: '2026-06-20',
    hora_cita: '10:00:00',
    estado_cita: 'Nueva',
    origen: 'Quiz',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Carlos Ramírez',
    telefono: '+52 55 9876 5432',
    edad: 45,
    respuestas: { sintomas: ['secos', 'sensibilidad'] },
    resultado: 'Ojo seco',
    estado: 'Atendido',
    fecha_cita: '2026-06-18',
    hora_cita: '11:30:00',
    estado_cita: 'Atendida',
    origen: 'Quiz',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    nombre: 'Sofía Martínez',
    telefono: '+52 55 5555 1212',
    edad: 28,
    respuestas: { sintomas: ['ardor'] },
    resultado: null,
    estado: 'Agendado',
    fecha_cita: '2026-06-19',
    hora_cita: '09:00:00',
    estado_cita: 'NoAsistió',
    origen: 'Quiz',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

const getSeverityConfig = (estado_cita: string | null) => {
  const estado = estado_cita || 'Nueva'
  if (estado === 'Nueva') {
    return {
      border: 'border-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Bell,
    }
  } else if (estado === 'NoAsistió') {
    return {
      border: 'border-red-500',
      badge: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertOctagon,
    }
  } else if (estado === 'Atendida') {
    return {
      border: 'border-slate-400',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: CheckCircle2,
    }
  }
  return {
    border: 'border-yellow-400',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Info,
  }
}

const toggleExpand = (id: string | number) => {
  expandedId.value = expandedId.value === id ? null : id
}

function openAtender(cita: Cita) {
  activeCita.value = cita
  isAtenderModalOpen.value = true
}

function closeAtender() {
  isAtenderModalOpen.value = false
  activeCita.value = null
}

function openExamen() {
  isAtenderModalOpen.value = false
  examenForm.value = createEmptyExamen()
  isExamenModalOpen.value = true
}

function closeExamen() {
  isExamenModalOpen.value = false
  activeCita.value = null
}

async function cancelarCita(cita: Cita) {
  const confirmacion = window.confirm("¿Estás seguro de cancelar esta cita? El paciente será marcado como 'No asistió'.")
  if (!confirmacion) return

  loading.value = true
  if (hasConfig) {
    const { error: sbError } = await supabase
      .from('leads')
      .update({ estado_cita: 'NoAsistió' })
      .eq('id', cita.id)
      
    if (sbError) {
      alert(`Error al cancelar: ${sbError.message}`)
    } else {
      const idx = citas.value.findIndex(c => c.id === cita.id)
      if (idx !== -1) citas.value[idx].estado_cita = 'NoAsistió'
    }
  } else {
    const idx = citas.value.findIndex(c => c.id === cita.id)
    if (idx !== -1) citas.value[idx].estado_cita = 'NoAsistió'
  }
  loading.value = false
}

async function guardarExamen() {
  if (examenForm.value.esfera_od === null || examenForm.value.esfera_oi === null) {
    alert("Las esferas (OD y OI) son obligatorias.")
    return
  }

  if (!activeCita.value) return

  savingExamen.value = true
  if (hasConfig) {
    // 1. Insert Paciente
    const { data: pacienteData, error: pacError } = await supabase
      .from('pacientes')
      .insert({
        lead_id: activeCita.value.id,
        nombre: activeCita.value.nombre,
        telefono: activeCita.value.telefono,
        edad: activeCita.value.edad
      })
      .select('id')
      .single()

    if (pacError) {
      alert(`Error al guardar paciente: ${pacError.message}`)
      savingExamen.value = false
      return
    }

    // Prepare data to handle empty strings for dates/numbers
    const examToSave = { ...examenForm.value }
    if (!examToSave.proxima_revision) {
      (examToSave as any).proxima_revision = null
    }

    // 2. Insert Examen
    const { error: examError } = await supabase
      .from('historial_clinico')
      .insert({
        paciente_id: pacienteData.id,
        ...examToSave
      })

    if (examError) {
      alert(`Error al guardar examen: ${examError.message}`)
      savingExamen.value = false
      return
    }

    // 3. Update Lead
    const { error: leadError } = await supabase
      .from('leads')
      .update({ estado_cita: 'Atendida' })
      .eq('id', activeCita.value.id)

    if (leadError) {
      alert(`Error al actualizar estado de la cita: ${leadError.message}`)
      savingExamen.value = false
      return
    }

    // Actualizar UI localmente
    const idx = citas.value.findIndex(c => c.id === activeCita.value!.id)
    if (idx !== -1) citas.value[idx].estado_cita = 'Atendida'
  } else {
    // Modo mock
    const idx = citas.value.findIndex(c => c.id === activeCita.value!.id)
    if (idx !== -1) citas.value[idx].estado_cita = 'Atendida'
  }

  savingExamen.value = false
  closeExamen()
}

const sortedCitas = computed(() => {
  let sorted = [...citas.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    sorted = sorted.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.telefono.toLowerCase().includes(q) ||
      (c.estado_cita || '').toLowerCase().includes(q)
    )
  }

  sorted.sort((a, b) => {
    if (sortBy.value === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy.value === 'date') {
      const da = a.fecha_cita ?? ''
      const db = b.fecha_cita ?? ''
      return da.localeCompare(db)
    }
    if (sortBy.value === 'severity') {
      const order = { 'Nueva': 3, 'NoAsistió': 2, 'Atendida': 1 }
      const va = order[(a.estado_cita || 'Nueva') as keyof typeof order] || 0
      const vb = order[(b.estado_cita || 'Nueva') as keyof typeof order] || 0
      return vb - va
    }
    return 0
  })

  return sorted
})

const filteredPacientes = computed(() => {
  if (!searchQuery.value) return pacientes.value
  const q = searchQuery.value.toLowerCase()
  return pacientes.value.filter(p =>
    p.nombre?.toLowerCase().includes(q) ||
    p.telefono?.toLowerCase().includes(q)
  )
})

const filteredLeads = computed(() => {
  if (!searchQuery.value) return todosLosLeads.value
  const q = searchQuery.value.toLowerCase()
  return todosLosLeads.value.filter(l =>
    l.nombre?.toLowerCase().includes(q) ||
    l.telefono?.toLowerCase().includes(q) ||
    (l.estado_cita || '').toLowerCase().includes(q)
  )
})

async function fetchCitas() {
  loading.value = true
  error.value = ''

  if (!hasConfig) {
    await new Promise(r => setTimeout(r, 600))
    // Filtrar mock: solo leads registrados en las últimas 24h
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    citas.value = mockData.filter(c => new Date(c.created_at) >= hace24h)
    loading.value = false
    return
  }

  try {
    // Solo leads registrados en las últimas 24 horas
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data, error: sbError } = await supabase
      .from('leads')
      .select('id, nombre, telefono, edad, respuestas, resultado, estado, fecha_cita, hora_cita, estado_cita, origen, created_at')
      .gte('created_at', hace24h)
      .order('created_at', { ascending: false })

    if (sbError) {
      error.value = `Error al cargar citas: ${sbError.message}`
      citas.value = []
    } else {
      citas.value = (data as Cita[]) || []
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    error.value = `Error inesperado: ${msg}`
  } finally {
    loading.value = false
  }
}

async function fetchPacientes() {
  loading.value = true
  error.value = ''
  if (!hasConfig) {
    await new Promise(r => setTimeout(r, 400))
    pacientes.value = []
    loading.value = false
    return
  }
  try {
    const { data, error: sbError } = await supabase
      .from('pacientes')
      .select('id, lead_id, nombre, telefono, edad, created_at')
      .order('created_at', { ascending: false })
    if (sbError) {
      error.value = `Error al cargar pacientes: ${sbError.message}`
      pacientes.value = []
    } else {
      pacientes.value = (data as Paciente[]) || []
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    error.value = `Error inesperado: ${msg}`
  } finally {
    loading.value = false
  }
}

async function fetchTodosLosLeads() {
  loading.value = true
  error.value = ''
  if (!hasConfig) {
    await new Promise(r => setTimeout(r, 400))
    todosLosLeads.value = mockData
    loading.value = false
    return
  }
  try {
    const { data, error: sbError } = await supabase
      .from('leads')
      .select('id, nombre, telefono, edad, respuestas, resultado, estado, fecha_cita, hora_cita, estado_cita, origen, created_at')
      .order('created_at', { ascending: false })
    if (sbError) {
      error.value = `Error al cargar leads: ${sbError.message}`
      todosLosLeads.value = []
    } else {
      todosLosLeads.value = (data as Cita[]) || []
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    error.value = `Error inesperado: ${msg}`
  } finally {
    loading.value = false
  }
}

function getSintomas(respuestas: Respuestas | null): string[] {
  return respuestas?.sintomas ?? []
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  const parts = date.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return date
}

function formatDateTime(dt: string): string {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatSintomas(sintomas: string[]): string {
  if (!sintomas || sintomas.length === 0) return ''
  const labels: Record<string, string> = {
    fatiga:       'Fatiga',
    dolor_cabeza: 'Dolor de cabeza',
    ardor:        'Ardor',
    secos:        'Ojos secos',
    lagrimeo:     'Lagrimeo',
    sensibilidad: 'Sensibilidad',
    ninguna:      'Ninguno',
  }
  return sintomas.map(s => labels[s] ?? s).join(', ')
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

onMounted(() => {
  fetchCitas()
})
</script>
