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
            <button @click="setView('pedidos')" :class="['flex items-center gap-2 rounded-lg py-2 px-2 text-sm font-medium transition-colors', currentView === 'pedidos' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200']">
              <ShoppingCart :size="16" class="shrink-0" /> Pedidos
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
              :placeholder="currentView === 'pacientes' ? 'Buscar paciente...' : currentView === 'leads' ? 'Buscar lead...' : currentView === 'pedidos' ? 'Buscar pedido o paciente...' : 'Buscar por nombre o teléfono...'"
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
        <div class="mx-auto w-full max-w-[1600px] pb-12">

          <!-- Header del area principal -->
          <div class="mb-6 flex items-end justify-between">
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-slate-900">
                <span v-if="currentView === 'citas'">Citas Pendientes</span>
                <span v-else-if="currentView === 'pacientes'">Pacientes</span>
                <span v-else-if="currentView === 'leads'">Todos los Leads</span>
                <span v-else-if="currentView === 'pedidos'">Pedidos Registrados</span>
              </h1>
              <p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                <span v-if="currentView === 'citas'">Solo citas de las últimas 24 horas y futuras</span>
                <span v-else-if="currentView === 'pacientes'">Todos los pacientes registrados</span>
                <span v-else-if="currentView === 'leads'">Historial completo de leads</span>
                <span v-else-if="currentView === 'pedidos'">Historial de pedidos y ventas</span>
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
                  getSeverityConfig(cita.estado_cita).border,
                  cita.estado_cita === 'Atendida' ? 'opacity-50 grayscale' : ''
                ]"
              >
                <div
                  class="flex cursor-pointer flex-col items-start gap-4 p-5 lg:flex-row lg:items-center"
                  @click="toggleExpand(cita.id)"
                >
                  <div class="flex flex-1 flex-col gap-3 w-full">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <h3 class="text-xl font-bold leading-tight text-slate-900">{{ cita.nombre }}</h3>
                        <a :href="`https://wa.me/${cleanPhone(cita.telefono)}`" target="_blank" @click.stop class="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                          <MessageCircle :size="16" class="text-emerald-600" />
                          {{ cita.telefono }}
                        </a>
                      </div>
                      
                      <div class="flex items-center gap-3">
                        <span v-if="cita.owner" :class="[
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          cita.owner === 'publicidad' ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                        ]">{{ cita.owner }}</span>
                        <div class="flex flex-col items-end">
                          <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Reserva generada</span>
                          <span class="text-sm font-bold text-slate-700">{{ formatDateTime(cita.created_at) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-white shadow-sm">
                          <span class="text-xs font-semibold uppercase tracking-wider text-slate-300">Edad</span>
                          <span class="text-base font-bold">{{ cita.edad ?? 'N/A' }}</span>
                        </div>
                        <div :class="['flex items-center gap-2 rounded-lg border px-3 py-1 text-sm font-bold tracking-wide', getSeverityConfig(cita.estado_cita).badge]">
                          <component :is="getSeverityConfig(cita.estado_cita).icon" :size="16" />
                          {{ cita.estado_cita || 'Nueva' }}
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <template v-if="cita.estado_cita === 'Nueva' || !cita.estado_cita">
                          <button @click.stop="openAtender(cita)" class="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-200 shadow-sm">
                            <CheckCircle2 :size="18" /> Atender
                          </button>
                          <button @click.stop="cancelarCita(cita)" class="flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-200 shadow-sm ml-1">
                            <XCircle :size="18" /> Cancelar
                          </button>
                          <div class="mx-3 h-6 w-px bg-slate-300"></div>
                        </template>
                        <button class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" @click.stop>
                          <Eye :size="20" />
                        </button>
                        <button class="rounded-lg p-2 text-slate-400 transition-colors hover:text-slate-800 hover:bg-slate-100">
                          <ChevronUp v-if="expandedId === cita.id" :size="24" />
                          <ChevronDown v-else :size="24" />
                        </button>
                      </div>
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
              <div class="overflow-x-auto w-full">
                <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">#</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Cédula</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Nombre</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Teléfono</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Edad</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Owner</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Registrado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(pac, idx) in filteredPacientes" :key="pac.id" class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3 text-slate-400 font-mono text-xs">{{ idx + 1 }}</td>
                    <td class="px-4 py-3 font-mono text-sm font-semibold text-slate-700">{{ pac.cedula || '—' }}</td>
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
                    <td class="px-4 py-3">
                      <span v-if="pac.owner" :class="[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        pac.owner === 'publicidad' ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                      ]">{{ pac.owner }}</span>
                      <span v-else class="text-slate-400 text-xs">—</span>
                    </td>
                    <td class="px-4 py-3 text-slate-500 font-mono text-xs">
                      <div class="flex items-center justify-between">
                        {{ formatDateTime(pac.created_at) }}
                        <button v-if="pac.pedidos && pac.pedidos.length > 0" @click="verPedidosPaciente(pac)" class="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded px-2 py-1 font-bold border border-indigo-200 transition-colors">Ver pedidos</button>
                        <button v-else @click="hacerPedidoParaPaciente(pac)" class="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded px-2 py-1 font-bold border border-emerald-200 transition-colors">Hacer pedido</button>
                        <button v-if="pac.historial_clinico && pac.historial_clinico.length > 0" @click="abrirExamenesPaciente(pac.id, pac.nombre)" class="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 rounded px-2 py-1 font-bold border border-purple-200 transition-colors flex items-center gap-1"><FlaskConical :size="11" /> Ver Exámenes ({{ pac.historial_clinico.length }})</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
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
            <div v-else class="flex flex-col gap-3">
              <!-- Controles de paginación superiores -->
              <div class="flex items-center justify-between">
                <p class="text-sm text-slate-500">
                  Mostrando <span class="font-semibold text-slate-700">{{ leadsPageStart + 1 }}–{{ Math.min(leadsPageStart + leadsPageSize, filteredLeads.length) }}</span> de <span class="font-semibold text-slate-700">{{ filteredLeads.length }}</span> leads
                </p>
                <div class="flex items-center gap-2">
                  <button @click="leadsPage--" :disabled="leadsPage === 0" class="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronDown :size="14" class="rotate-90" /> Anterior
                  </button>
                  <span class="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">Pág. {{ leadsPage + 1 }} / {{ leadsTotalPages }}</span>
                  <button @click="leadsPage++" :disabled="leadsPage >= leadsTotalPages - 1" class="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    Siguiente <ChevronDown :size="14" class="-rotate-90" />
                  </button>
                </div>
              </div>
              <!-- Tabla -->
              <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div class="overflow-x-auto w-full">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">#</th>
                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Nombre</th>
                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Teléfono</th>
                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fecha Cita</th>
                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hora</th>
                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Origen</th>
                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Owner</th>
                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Registrado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="(lead, idx) in pagedLeads" :key="lead.id" class="hover:bg-slate-50 transition-colors">
                      <td class="px-4 py-3 text-slate-400 font-mono text-xs">{{ leadsPageStart + idx + 1 }}</td>
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
                        <span v-if="lead.owner" :class="[
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          lead.owner === 'publicidad' ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                        ]">{{ lead.owner }}</span>
                        <span v-else class="text-slate-400 text-xs">—</span>
                      </td>
                      <td class="px-4 py-3">
                        <span :class="[
                          'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold min-w-[72px] text-center',
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
              <!-- Controles de paginación inferiores -->
              <div class="flex items-center justify-end gap-2">
                <button @click="leadsPage--" :disabled="leadsPage === 0" class="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronDown :size="14" class="rotate-90" /> Anterior
                </button>
                <span class="text-xs text-slate-500">Pág. {{ leadsPage + 1 }} / {{ leadsTotalPages }}</span>
                <button @click="leadsPage++" :disabled="leadsPage >= leadsTotalPages - 1" class="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Siguiente <ChevronDown :size="14" class="-rotate-90" />
                </button>
              </div>
            </div>
          </div>

          <!-- VISTA: PEDIDOS -->
          <div v-else-if="currentView === 'pedidos'">
            <div v-if="loading" class="py-12 text-center text-slate-500 flex flex-col items-center">
              <RefreshCw class="animate-spin mb-4" :size="32" /><p>Cargando pedidos...</p>
            </div>
            <div v-else-if="filteredPedidos.length === 0" class="rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
              <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><ShoppingCart :size="24" class="text-slate-400" /></div>
              <h3 class="text-lg font-medium text-slate-900">No hay pedidos registrados</h3>
              <p class="mt-1 text-sm text-slate-500">Los pedidos aparecerán aquí cuando generes ventas.</p>
            </div>
            <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div class="overflow-x-auto w-full">
                <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Pedido</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Paciente</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Owner</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Armazón</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Total</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Faltante</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Pago</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Entrega</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fecha</th>
                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="ped in filteredPedidos" :key="ped.id" class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3 font-mono text-xs font-bold text-slate-600">{{ ped.numero_pedido }}</td>
                    <td class="px-4 py-3 font-semibold text-slate-800">{{ ped.pacientes?.nombre || 'Desconocido' }}</td>
                    <td class="px-4 py-3">
                      <span v-if="ped.owner" :class="[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        ped.owner === 'publicidad' ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                      ]">{{ ped.owner }}</span>
                      <span v-else class="text-slate-400 text-xs">—</span>
                    </td>
                    <td class="px-4 py-3 text-slate-600">{{ ped.marca_armazon }} {{ ped.modelo_armazon }}</td>
                    <td class="px-4 py-3 font-mono font-bold text-emerald-600">${{ ped.total }}</td>
                    <td class="px-4 py-3 font-mono font-bold text-red-500">
                      ${{ (Number(ped.total) - Number(ped.monto_pagado || 0)).toFixed(2) }}
                    </td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] uppercase tracking-wide font-bold leading-none min-w-[90px] text-center',
                        ped.estado_pago === 'Pagado total' ? 'bg-emerald-100 text-emerald-700' :
                        ped.estado_pago === 'Pagado parcial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      ]">{{ ped.estado_pago }}</span>
                    </td>
                    <td class="px-4 py-3 text-slate-600 text-xs">{{ ped.tipo_entrega }}</td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] uppercase tracking-wide font-bold leading-none min-w-[90px] text-center',
                        ped.estado_pedido === 'Entregado' ? 'bg-slate-100 text-slate-600' :
                        ped.estado_pedido === 'Listo para entregar' ? 'bg-emerald-100 text-emerald-700' :
                        ped.estado_pedido === 'En tránsito' ? 'bg-blue-100 text-blue-700' :
                        ped.estado_pedido === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      ]">{{ ped.estado_pedido }}</span>
                    </td>
                    <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ formatDate(ped.fecha_pedido) }}</td>
                    <td class="px-4 py-3 flex gap-2">
                      <button @click="openEditarPedido(ped)" class="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded px-2.5 py-1 font-bold border border-indigo-200 transition-colors flex items-center gap-1">
                        <Edit2 :size="12" /> Ver / Modificar
                      </button>
                      <button v-if="ped.pacientes?.historial_clinico && ped.pacientes.historial_clinico.length > 0" @click="abrirExamenesPaciente(ped.pacientes.id, ped.pacientes.nombre)" class="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 rounded px-2.5 py-1 font-bold border border-purple-200 transition-colors flex items-center gap-1">
                        <FlaskConical :size="12" /> Ver Exámenes
                      </button>
                      <button v-if="ped.estado_pedido !== 'Entregado' && ped.estado_pedido !== 'Cancelado'" @click="openEntregarPedido(ped)" class="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded px-2.5 py-1 font-bold border border-emerald-200 transition-colors flex items-center gap-1">
                        <CheckCircle2 :size="12" /> Entregar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Modals Overlay -->
    <div v-if="isAtenderModalOpen || isExamenModalOpen || isCancelModalOpen || isPedidoModalOpen || isEntregarModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      
      <!-- Atender Modal -->
      <div v-if="isAtenderModalOpen && activeCita" class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 class="flex items-center gap-2 text-xl font-bold text-slate-800"><Eye :size="24" class="text-indigo-500"/> Atender Cita</h2>
          <button @click="closeAtender" class="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X :size="24"/></button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <h3 class="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4">📋 Datos del Paciente</h3>
            <div class="space-y-3 text-base text-slate-700">
              <p><span class="font-semibold w-28 inline-block">Nombre:</span> {{ activeCita.nombre }}</p>
              <p><span class="font-semibold w-28 inline-block">Teléfono:</span> {{ activeCita.telefono }}</p>
              <p><span class="font-semibold w-28 inline-block">Edad:</span> {{ activeCita.edad ?? 'N/A' }} años</p>
              <p><span class="font-semibold w-28 inline-block">Origen:</span> {{ activeCita.origen || 'Desconocido' }}</p>
              <p class="flex items-center gap-2"><span class="font-semibold w-28 inline-block">Owner:</span>
                <span v-if="activeCita.owner" :class="[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  activeCita.owner === 'publicidad' ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                ]">{{ activeCita.owner }}</span>
                <span v-else class="text-slate-400 text-sm">—</span>
              </p>
              <p><span class="font-semibold w-28 inline-block">Agendado:</span> {{ formatDate(activeCita.fecha_cita) }} - {{ activeCita.hora_cita || 'Sin hora' }}</p>
            </div>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">📋 Respuestas del Quiz</h3>
            <div class="space-y-3 text-base text-slate-700">
              <p><span class="font-semibold w-40 inline-block">Síntomas:</span> {{ formatSintomas(getSintomas(activeCita.respuestas)) || 'Ninguno' }}</p>
              <p><span class="font-semibold w-40 inline-block">Visión lejos:</span> {{ activeCita.respuestas?.vision_lejos || 'N/A' }}</p>
              <p><span class="font-semibold w-40 inline-block">Visión cerca:</span> {{ activeCita.respuestas?.vision_cerca || 'N/A' }}</p>
              <p><span class="font-semibold w-40 inline-block">Problemas colores:</span> {{ activeCita.respuestas?.problemas_colores || 'N/A' }}</p>
              <p v-if="activeCita.respuestas?.detalle_colores"><span class="font-semibold w-40 inline-block">Detalle colores:</span> {{ activeCita.respuestas.detalle_colores }}</p>
            </div>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h3 class="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle :size="16"/> Registro de Paciente
            </h3>
            <p class="text-sm text-amber-700 mb-3">Para continuar y agregar el examen, debe ingresar la cédula o ID del paciente.</p>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Cédula del Paciente *</label>
              <input type="text" v-model="cedulaInput" placeholder="Ej. 0912345678" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2.5 px-3 border"/>
            </div>
          </div>
        </div>
        
        <div class="border-t border-slate-100 bg-slate-50 px-6 py-4 flex flex-wrap justify-end gap-3">
          <button @click="closeAtender" class="rounded-lg px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cerrar</button>
          <button @click="openExamen" :disabled="!cedulaInput.trim() || activeCita?.estado_cita === 'Atendida'" :class="['flex items-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors', (cedulaInput.trim() && activeCita?.estado_cita !== 'Atendida') ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-400 cursor-not-allowed']"><ClipboardList :size="20"/> Agregar Examen</button>
          <button @click="openPedido" :disabled="!cedulaInput.trim()" :class="['flex items-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors', cedulaInput.trim() ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400 cursor-not-allowed']"><ShoppingCart :size="20"/> Generar Pedido</button>
        </div>
      </div>

      <!-- Examen Modal -->
      <div v-if="isExamenModalOpen && activeCita" class="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 class="flex items-center gap-2 text-xl font-bold text-slate-800"><ClipboardList :size="24" class="text-indigo-500"/> Agregar Examen Visual</h2>
          <button @click="closeExamen" class="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X :size="24"/></button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <div class="flex items-center justify-between mb-6 border-b pb-4">
            <h3 class="text-lg font-semibold text-slate-800">Paciente: <span class="text-indigo-600">{{ activeCita.nombre }}</span></h3>
            <div class="text-right">
              <span class="block text-xs font-bold uppercase tracking-wider text-slate-400">Fecha del Examen</span>
              <span class="text-base font-bold text-slate-700">{{ formatDateTime(new Date().toISOString()).split(',')[0] }}</span>
            </div>
          </div>
          
          <form @submit.prevent="guardarExamen" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div class="space-y-4">
                <h4 class="font-bold text-base text-slate-800">Ojo Derecho (OD)</h4>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Agudeza Visual</label>
                  <input type="text" v-model="examenForm.agudeza_visual_od" placeholder="ej. 20/20" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1 font-semibold">Esfera *</label>
                  <input type="number" step="0.25" v-model="examenForm.esfera_od" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Cilindro</label>
                  <input type="number" step="0.25" v-model="examenForm.cilindro_od" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Eje (°)</label>
                  <input type="number" v-model="examenForm.eje_od" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
                </div>
              </div>
              
              <div class="space-y-4">
                <h4 class="font-bold text-base text-slate-800">Ojo Izquierdo (OI)</h4>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Agudeza Visual</label>
                  <input type="text" v-model="examenForm.agudeza_visual_oi" placeholder="ej. 20/25" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1 font-semibold">Esfera *</label>
                  <input type="number" step="0.25" v-model="examenForm.esfera_oi" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Cilindro</label>
                  <input type="number" step="0.25" v-model="examenForm.cilindro_oi" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
                </div>
                <div>
                  <label class="block text-sm text-slate-600 mb-1">Eje (°)</label>
                  <input type="number" v-model="examenForm.eje_oi" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm text-slate-600 mb-1">Adición (Presbicia)</label>
                <input type="number" step="0.25" v-model="examenForm.adicion" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
              </div>
              <div>
                <label class="block text-sm text-slate-600 mb-1">DIP (mm)</label>
                <input type="number" v-model="examenForm.dip" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
              </div>
              <div>
                <label class="block text-sm text-slate-600 mb-1">Presión Ocular (mmHg)</label>
                <input type="number" v-model="examenForm.presion_ocular" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
              </div>
            </div>

            <div>
              <label class="block text-sm text-slate-600 mb-1">Diagnóstico</label>
              <input type="text" v-model="examenForm.diagnostico" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm text-slate-600 mb-1">Observaciones</label>
                <textarea v-model="examenForm.observaciones" rows="3" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"></textarea>
              </div>
              <div>
                <label class="block text-sm text-slate-600 mb-1">Recomendaciones</label>
                <textarea v-model="examenForm.recomendaciones" rows="3" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"></textarea>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">Próxima Revisión (Opcional)</label>
              <input type="date" v-model="examenForm.proxima_revision" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3 border"/>
            </div>

          </form>
        </div>
        
        <div class="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button type="button" @click="closeExamen" class="rounded-lg px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
          <button @click="guardarExamen" :disabled="savingExamen" class="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors">
            <RefreshCw v-if="savingExamen" class="animate-spin" :size="20"/>
            <Save v-else :size="20"/> 
            {{ savingExamen ? 'Guardando...' : 'Guardar Examen' }}
          </button>
        </div>
      </div>

      <!-- Cancel Modal -->
      <div v-if="isCancelModalOpen && citaToCancel" class="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
        <div class="flex items-center justify-between border-b border-red-100 bg-red-50 px-6 py-4">
          <h2 class="flex items-center gap-2 text-xl font-bold text-red-800"><AlertTriangle :size="24"/> Cancelar Cita</h2>
          <button @click="closeCancelModal" class="rounded-full p-2 text-red-400 hover:bg-red-200 hover:text-red-600"><X :size="24"/></button>
        </div>
        <div class="p-6">
          <p class="text-lg text-slate-700">¿Estás seguro de cancelar la cita de <span class="font-bold">{{ citaToCancel.nombre }}</span>?</p>
          <p class="mt-3 text-base text-slate-500">El paciente será marcado como 'No asistió'. Esta acción no se puede deshacer.</p>
        </div>
        <div class="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button @click="closeCancelModal" class="rounded-lg px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Atrás</button>
          <button @click="confirmCancelarCita" :disabled="loading" class="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-red-700 transition-colors">
            <RefreshCw v-if="loading" class="animate-spin" :size="20" />
            <XCircle v-else :size="20" />
            {{ loading ? 'Cancelando...' : 'Confirmar Cancelación' }}
          </button>
        </div>
      </div>

      <div v-if="isPedidoModalOpen && (activeCita || editingPedidoId)" class="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 class="flex items-center gap-2 text-xl font-bold text-slate-800">
            <ShoppingCart :size="24" class="text-emerald-500"/>
            {{ editingPedidoId ? 'Modificar Pedido' : 'Generar Pedido' }}
          </h2>
          <button @click="closePedido" class="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X :size="24"/></button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <fieldset :disabled="isOriginalPedidoEntregado" class="space-y-6">
          <!-- DATOS DEL CLIENTE -->
          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <h3 class="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4">📋 Datos del Cliente</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-base text-slate-700">
              <p><span class="font-semibold block text-sm text-indigo-600">Nombre</span> {{ activeCita?.nombre || clienteDetallesEdicion.nombre }}</p>
              <p><span class="font-semibold block text-sm text-indigo-600">Teléfono</span> {{ activeCita?.telefono || clienteDetallesEdicion.telefono || '—' }}</p>
              <p><span class="font-semibold block text-sm text-indigo-600">Edad</span> {{ activeCita?.edad ?? (clienteDetallesEdicion.edad !== null ? clienteDetallesEdicion.edad : '—') }} {{ (activeCita?.edad || clienteDetallesEdicion.edad) !== null ? 'años' : '' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- ARMAZÓN -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">🕶️ Armazón</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Marca *</label>
                  <input type="text" v-model="formPedido.marca_armazon" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"/>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Modelo *</label>
                  <input type="text" v-model="formPedido.modelo_armazon" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"/>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Color</label>
                  <input type="text" v-model="formPedido.color_armazon" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"/>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Precio ($) *</label>
                  <input type="number" step="0.01" v-model="formPedido.precio_armazon" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"/>
                </div>
              </div>
            </div>

            <!-- MICAS -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">💎 Micas</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Tipo de mica *</label>
                  <select v-model="formPedido.tipo_mica" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border bg-white">
                    <option disabled value="">Seleccionar...</option>
                    <option v-for="op in micaOptions" :key="op" :value="op">{{ op }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Tratamientos</label>
                  <div class="grid grid-cols-2 gap-2">
                    <label v-for="trat in tratamientoOptions" :key="trat" class="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" :value="trat" v-model="formPedido.tratamientos" class="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"/>
                      {{ trat }}
                    </label>
                  </div>
                </div>
                <div class="pt-2">
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Precio Micas ($) *</label>
                  <input type="number" step="0.01" v-model="formPedido.precio_micas" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"/>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- ENTREGA Y PAGO -->
            <div class="space-y-6">
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">📦 Entrega</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Tipo de entrega *</label>
                    <select v-model="formPedido.tipo_entrega" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border bg-white">
                      <option v-for="op in entregaOptions" :key="op" :value="op">{{ op }}</option>
                    </select>
                  </div>
                  <div v-if="formPedido.tipo_entrega === 'Encargo'">
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Fecha prometida *</label>
                    <input type="date" v-model="formPedido.fecha_entrega_prometida" :required="formPedido.tipo_entrega === 'Encargo'" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"/>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Observaciones</label>
                    <textarea v-model="formPedido.observaciones" rows="2" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"></textarea>
                  </div>
                  <div v-if="editingPedidoId" class="pt-2">
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Estado del Pedido *</label>
                    <select v-model="formPedido.estado_pedido" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border bg-white">
                      <option value="En fabricación">En fabricación</option>
                      <option value="En tránsito">En tránsito</option>
                      <option value="Listo para entregar">Listo para entregar</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">💳 Pago</h3>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Método *</label>
                      <select v-model="formPedido.metodo_pago" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border bg-white">
                        <option v-for="op in pagoOptions" :key="op" :value="op">{{ op }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Estado *</label>
                      <select v-model="formPedido.estado_pago" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border bg-white">
                        <option v-for="op in estadoPagoOptions" :key="op" :value="op">{{ op }}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Monto Pagado / Abono ($) *</label>
                    <input type="number" step="0.01" v-model="formPedido.monto_pagado" :readonly="formPedido.estado_pago === 'Pagado total' || formPedido.estado_pago === 'Pendiente'" :class="{'bg-slate-100': formPedido.estado_pago === 'Pagado total' || formPedido.estado_pago === 'Pendiente'}" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"/>
                  </div>
                </div>
              </div>
            </div>

            <!-- TOTALES -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col h-full">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">💰 Totales</h3>
              
              <div class="flex-1 space-y-4">
                <div class="flex justify-between items-center text-lg">
                  <span class="text-slate-300">Subtotal Armazón</span>
                  <span class="font-mono">${{ (Number(formPedido.precio_armazon) || 0).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center text-lg">
                  <span class="text-slate-300">Subtotal Micas</span>
                  <span class="font-mono">${{ (Number(formPedido.precio_micas) || 0).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center text-lg pt-4 border-t border-slate-800">
                  <span class="text-slate-300">Subtotal</span>
                  <span class="font-mono">${{ subtotalPedido.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center text-lg">
                  <span class="text-slate-300 flex items-center gap-2">Descuento <input type="number" step="0.01" v-model="formPedido.descuento" class="w-20 bg-slate-800 border-slate-700 rounded px-2 py-1 text-right text-base"/></span>
                  <span class="font-mono text-red-400">-${{ (Number(formPedido.descuento) || 0).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center text-lg">
                  <span class="text-slate-300">IVA (12%)</span>
                  <span class="font-mono">${{ ivaPedido.toFixed(2) }}</span>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t border-slate-700">
                <div class="flex justify-between items-end">
                  <span class="text-xl font-bold text-slate-300">TOTAL</span>
                  <span class="text-4xl font-bold font-mono text-emerald-400">${{ totalPedido.toFixed(2) }}</span>
                </div>
                <div v-if="saldoPendiente > 0" class="flex justify-between items-end mt-2 text-amber-400">
                  <span class="text-sm font-bold">Saldo Pendiente</span>
                  <span class="text-lg font-bold font-mono">${{ saldoPendiente.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
          </fieldset>
        </div>
        
        <div class="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end items-center gap-3">
          <div v-if="isOriginalPedidoEntregado" class="flex items-center gap-2 text-slate-500 bg-slate-100 px-4 py-2.5 rounded-lg text-sm font-bold border border-slate-200">
            <CheckCircle2 class="text-emerald-500" :size="18" /> Pedido Entregado (Lectura)
          </div>
          <button type="button" @click="closePedido" class="rounded-lg px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-200 transition-colors">{{ isOriginalPedidoEntregado ? 'Cerrar' : 'Cancelar' }}</button>
          <button v-if="!isOriginalPedidoEntregado" @click="guardarPedido" :disabled="savingPedido" class="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors">
            <RefreshCw v-if="savingPedido" class="animate-spin" :size="20"/>
            <Save v-else :size="20"/> 
            {{ savingPedido ? 'Guardando...' : 'Guardar Pedido' }}
          </button>
        </div>
      </div>

      <!-- Entregar Modal -->
      <div v-if="isEntregarModalOpen && activeEntregaPedido" class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 class="flex items-center gap-2 text-xl font-bold text-slate-800"><CheckCircle2 :size="24" class="text-emerald-500"/> Entregar Pedido</h2>
          <button @click="closeEntregarPedido" class="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X :size="24"/></button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <h3 class="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4">📦 Resumen del Pedido</h3>
            <div class="space-y-3 text-base text-slate-700">
              <p><span class="font-semibold w-28 inline-block">Pedido:</span> {{ activeEntregaPedido.numero_pedido }}</p>
              <p><span class="font-semibold w-28 inline-block">Paciente:</span> {{ activeEntregaPedido.pacientes?.nombre || 'Desconocido' }}</p>
              <p><span class="font-semibold w-28 inline-block">Armazón:</span> {{ activeEntregaPedido.marca_armazon }} {{ activeEntregaPedido.modelo_armazon }}</p>
            </div>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">💰 Resumen de Pagos</h3>
            <div class="space-y-3 text-base text-slate-700">
              <p><span class="font-semibold w-32 inline-block">Total:</span> <span class="font-bold text-indigo-600">${{ Number(activeEntregaPedido.total).toFixed(2) }}</span></p>
              <p><span class="font-semibold w-32 inline-block">Abonado:</span> <span class="font-bold text-emerald-600">${{ Number(activeEntregaPedido.monto_pagado || 0).toFixed(2) }}</span></p>
              <p class="pt-2 border-t border-slate-200"><span class="font-semibold w-32 inline-block">Saldo Pendiente:</span> <span class="font-bold text-red-500">${{ (Number(activeEntregaPedido.total) - Number(activeEntregaPedido.monto_pagado || 0)).toFixed(2) }}</span></p>
            </div>
          </div>
          <div v-if="(Number(activeEntregaPedido.total) - Number(activeEntregaPedido.monto_pagado || 0)) > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h3 class="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3">Cobro de Saldo</h3>
            <p class="text-sm text-amber-700 mb-4">Para entregar el pedido, debe registrar el cobro de la totalidad del saldo pendiente.</p>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Monto a cobrar ahora ($) *</label>
                <input type="number" step="0.01" v-model="entregaMontoPagar" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2.5 px-3 border"/>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Método de Pago *</label>
                <select v-model="entregaMetodoPago" class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2.5 px-3 border">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta (Débito/Crédito)</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>
          </div>
          <div v-else class="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <CheckCircle2 :size="32" class="text-emerald-500 mx-auto mb-2" />
            <h3 class="font-bold text-emerald-800 mb-1">Pedido pagado en su totalidad</h3>
            <p class="text-sm text-emerald-700">Puede proceder con la entrega del producto.</p>
          </div>
        </div>
        <div class="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button @click="closeEntregarPedido" class="rounded-lg px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
          <button @click="confirmarEntrega" :disabled="savingEntrega" class="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors">
            <span v-if="savingEntrega" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <template v-else>
              <CheckCircle2 :size="20"/> Confirmar Entrega
            </template>
          </button>
        </div>
      </div>

    </div>

    <!-- ===== MODAL: LISTA DE EXÁMENES ===== -->
    <div v-if="isExamenesListModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4">
          <h2 class="flex items-center gap-2 text-xl font-bold text-slate-800">
            <FlaskConical :size="24" class="text-purple-500" />
            Exámenes de {{ examenDetallePacienteNombre }}
          </h2>
          <button @click="cerrarListaExamenes" class="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X :size="24" /></button>
        </div>
        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="loadingExamenes" class="flex justify-center items-center py-12">
            <RefreshCw class="animate-spin text-purple-500" :size="32" />
          </div>
          <div v-else-if="examenesPacienteList.length === 0" class="text-center py-16">
            <FlaskConical :size="40" class="text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500 font-medium">No hay exámenes registrados para este paciente.</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="exam in examenesPacienteList"
              :key="exam.id"
              class="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4 hover:border-purple-200 hover:bg-purple-50 transition-colors"
            >
              <div class="flex-1">
                <p class="font-bold text-slate-800 text-base">{{ exam.fecha_examen }}</p>
                <p class="text-sm text-slate-500 mt-0.5">
                  <span class="font-semibold">Diagnóstico:</span> {{ exam.diagnostico || '—' }}
                </p>
                <p class="text-xs text-slate-400 mt-1">
                  OD: {{ exam.esfera_od !== null ? (exam.esfera_od >= 0 ? '+' : '') + exam.esfera_od : '—' }}
                  &nbsp;|&nbsp;
                  OI: {{ exam.esfera_oi !== null ? (exam.esfera_oi >= 0 ? '+' : '') + exam.esfera_oi : '—' }}
                </p>
              </div>
              <button @click="verDetalleExamen(exam)" class="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm font-bold shadow-sm transition-colors">
                <Eye :size="15" /> Ver / Editar
              </button>
            </div>
          </div>
        </div>
        <div class="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end">
          <button @click="cerrarListaExamenes" class="rounded-lg px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: DETALLE/EDICIÓN DE EXAMEN ===== -->
    <div v-if="isExamenDetalleModalOpen && examenDetalleActivo" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4">
          <div>
            <h2 class="flex items-center gap-2 text-xl font-bold text-slate-800">
              <FlaskConical :size="22" class="text-purple-500" /> Examen Visual
            </h2>
            <p class="text-sm text-slate-500 mt-0.5">{{ examenDetallePacienteNombre }} — {{ examenDetalleActivo.fecha_examen }}</p>
          </div>
          <button @click="cerrarDetalleExamen" class="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X :size="24" /></button>
        </div>
        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- OD / OI -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Ojo Derecho -->
            <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
              <h4 class="font-bold text-indigo-800 text-sm uppercase tracking-wider">Ojo Derecho (OD)</h4>
              <div>
                <label class="block text-xs text-slate-500 mb-1">Agudeza Visual</label>
                <input type="text" v-model="examenDetalleActivo.agudeza_visual_od" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-3 border focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Esfera</label>
                  <input type="number" step="0.25" v-model="examenDetalleActivo.esfera_od" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-2 border" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Cilindro</label>
                  <input type="number" step="0.25" v-model="examenDetalleActivo.cilindro_od" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-2 border" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Eje (°)</label>
                  <input type="number" v-model="examenDetalleActivo.eje_od" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-2 border" />
                </div>
              </div>
            </div>
            <!-- Ojo Izquierdo -->
            <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
              <h4 class="font-bold text-emerald-800 text-sm uppercase tracking-wider">Ojo Izquierdo (OI)</h4>
              <div>
                <label class="block text-xs text-slate-500 mb-1">Agudeza Visual</label>
                <input type="text" v-model="examenDetalleActivo.agudeza_visual_oi" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-3 border focus:border-emerald-500 focus:ring-emerald-500" />
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Esfera</label>
                  <input type="number" step="0.25" v-model="examenDetalleActivo.esfera_oi" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-2 border" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Cilindro</label>
                  <input type="number" step="0.25" v-model="examenDetalleActivo.cilindro_oi" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-2 border" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Eje (°)</label>
                  <input type="number" v-model="examenDetalleActivo.eje_oi" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-2 border" />
                </div>
              </div>
            </div>
          </div>
          <!-- Métricas adicionales -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-slate-500 mb-1">Adición</label>
              <input type="number" step="0.25" v-model="examenDetalleActivo.adicion" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-3 border" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">DIP (mm)</label>
              <input type="number" v-model="examenDetalleActivo.dip" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-3 border" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">Presión Ocular (mmHg)</label>
              <input type="number" v-model="examenDetalleActivo.presion_ocular" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-3 border" />
            </div>
          </div>
          <!-- Textos -->
          <div>
            <label class="block text-xs text-slate-500 mb-1">Diagnóstico</label>
            <input type="text" v-model="examenDetalleActivo.diagnostico" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-3 border" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-500 mb-1">Observaciones</label>
              <textarea v-model="examenDetalleActivo.observaciones" rows="3" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-3 border resize-none"></textarea>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">Recomendaciones</label>
              <textarea v-model="examenDetalleActivo.recomendaciones" rows="3" class="w-full rounded-lg border-slate-300 shadow-sm text-sm py-2 px-3 border resize-none"></textarea>
            </div>
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Próxima Revisión</label>
            <input type="date" v-model="examenDetalleActivo.proxima_revision" class="rounded-lg border-slate-300 shadow-sm text-sm py-2 px-3 border" />
          </div>
        </div>
        <!-- Footer -->
        <div class="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button @click="cerrarDetalleExamen" class="rounded-lg px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
          <button @click="guardarCambiosExamen" :disabled="savingExamenDetalle" class="flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors disabled:opacity-60">
            <span v-if="savingExamenDetalle" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <Save v-else :size="18" />
            {{ savingExamenDetalle ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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
  MessageCircle,
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
  PanelLeftOpen,
  ShoppingCart,
  FlaskConical
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
  owner: string | null
  created_at: string
}

interface Paciente {
  id: string
  lead_id: string | number | null
  cedula: string | null
  nombre: string
  telefono: string | null
  edad: number | null
  owner: string | null
  created_at: string
  pedidos?: { id: string }[]
  historial_clinico?: { id: string }[]
}

interface ExamenClinico {
  id: string | number
  paciente_id: string | number
  fecha_examen: string
  agudeza_visual_od: string | null
  agudeza_visual_oi: string | null
  esfera_od: number | null
  esfera_oi: number | null
  cilindro_od: number | null
  cilindro_oi: number | null
  eje_od: number | null
  eje_oi: number | null
  adicion: number | null
  dip: number | null
  presion_ocular: number | null
  diagnostico: string | null
  observaciones: string | null
  recomendaciones: string | null
  proxima_revision: string | null
}

interface PedidoListado {
  id: string
  numero_pedido: string
  paciente_id?: string | number
  pacientes?: { id: string; nombre: string; historial_clinico?: { id: string }[] }
  marca_armazon: string
  modelo_armazon: string
  total: number
  monto_pagado?: number
  estado_pago: string
  tipo_entrega: string
  estado_pedido: string
  fecha_pedido: string
  owner: string | null
}

const citas = ref<Cita[]>([])
const pacientes = ref<Paciente[]>([])
const todosLosLeads = ref<Cita[]>([])
const pedidosList = ref<PedidoListado[]>([])
const loading = ref(false)
const error = ref('')

const searchQuery = ref('')
const sortBy = ref('recent')
const expandedId = ref<string | number | null>(null)

// Cancel Modal State
const isCancelModalOpen = ref(false)
const citaToCancel = ref<Cita | null>(null)

// Cedula Input
const cedulaInput = ref('')

// Navigation & Sidebar State
const currentView = ref<'citas' | 'pacientes' | 'leads' | 'pedidos'>('citas')
const isSidebarExpanded = ref(true)
const isPersonasOpen = ref(true)

function setView(view: 'citas' | 'pacientes' | 'leads' | 'pedidos', initialSearch = '') {
  currentView.value = view
  searchQuery.value = initialSearch
  if (view === 'citas') fetchCitas()
  else if (view === 'pacientes') fetchPacientes()
  else if (view === 'leads') fetchTodosLosLeads()
  else if (view === 'pedidos') fetchPedidos()
}

function refreshCurrentView() {
  if (currentView.value === 'citas') fetchCitas()
  else if (currentView.value === 'pacientes') fetchPacientes()
  else if (currentView.value === 'leads') fetchTodosLosLeads()
  else if (currentView.value === 'pedidos') fetchPedidos()
}

function verPedidosPaciente(pac: Paciente) {
  setView('pedidos', pac.nombre)
}

function hacerPedidoParaPaciente(pac: any) {
  activeCita.value = {
    id: pac.lead_id,
    nombre: pac.nombre,
    telefono: pac.telefono,
    edad: pac.edad
  } as any
  cedulaInput.value = pac.cedula
  openPedido()
}

async function abrirExamenesPaciente(pacienteId: string | number, pacienteNombre: string) {
  loadingExamenes.value = true
  isExamenesListModalOpen.value = true
  examenDetallePacienteNombre.value = pacienteNombre
  examenesPacienteList.value = []

  if (hasConfig) {
    const { data, error: sbError } = await supabase
      .from('historial_clinico')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('fecha_examen', { ascending: false })

    if (!sbError && data) {
      examenesPacienteList.value = data as ExamenClinico[]
    }
  }
  loadingExamenes.value = false
}

function verDetalleExamen(examen: ExamenClinico) {
  examenDetalleActivo.value = { ...examen }
  isExamenDetalleModalOpen.value = true
}

function cerrarDetalleExamen() {
  isExamenDetalleModalOpen.value = false
  examenDetalleActivo.value = null
}

function cerrarListaExamenes() {
  isExamenesListModalOpen.value = false
  examenesPacienteList.value = []
  examenDetalleActivo.value = null
  isExamenDetalleModalOpen.value = false
}

async function guardarCambiosExamen() {
  if (!examenDetalleActivo.value || !hasConfig) return
  savingExamenDetalle.value = true
  const { id, paciente_id, ...campos } = examenDetalleActivo.value
  const { error: sbError } = await supabase
    .from('historial_clinico')
    .update(campos)
    .eq('id', id)

  if (sbError) {
    alert(`Error al guardar: ${sbError.message}`)
  } else {
    // Actualizar en la lista local
    const idx = examenesPacienteList.value.findIndex(e => e.id === id)
    if (idx !== -1) examenesPacienteList.value[idx] = { ...examenDetalleActivo.value! }
    cerrarDetalleExamen()
  }
  savingExamenDetalle.value = false
}

// Modal State
const isAtenderModalOpen = ref(false)
const isExamenModalOpen = ref(false)
const isPedidoModalOpen = ref(false)
const isEntregarModalOpen = ref(false)
const activeEntregaPedido = ref<any>(null)
const entregaMontoPagar = ref<number>(0)
const entregaMetodoPago = ref('Efectivo')
const savingEntrega = ref(false)

// Examenes Modal State
const isExamenesListModalOpen = ref(false)
const isExamenDetalleModalOpen = ref(false)
const examenesPacienteList = ref<ExamenClinico[]>([])
const examenDetalleActivo = ref<ExamenClinico | null>(null)
const examenDetallePacienteNombre = ref('')
const loadingExamenes = ref(false)
const savingExamenDetalle = ref(false)

function openEntregarPedido(ped: any) {
  activeEntregaPedido.value = ped
  const pendiente = Number(ped.total) - Number(ped.monto_pagado || 0)
  entregaMontoPagar.value = pendiente > 0 ? pendiente : 0
  entregaMetodoPago.value = ped.metodo_pago || 'Efectivo'
  isEntregarModalOpen.value = true
}

function closeEntregarPedido() {
  isEntregarModalOpen.value = false
  activeEntregaPedido.value = null
  entregaMontoPagar.value = 0
}

async function confirmarEntrega() {
  if (!activeEntregaPedido.value) return
  
  const ped = activeEntregaPedido.value
  const pendienteOriginal = Number(ped.total) - Number(ped.monto_pagado || 0)
  
  if (pendienteOriginal > 0 && entregaMontoPagar.value < pendienteOriginal) {
    alert(`Debe cobrar la totalidad del saldo pendiente ($${pendienteOriginal.toFixed(2)}) para poder entregar el pedido.`)
    return
  }
  
  savingEntrega.value = true
  
  const nuevoPagado = Number(ped.monto_pagado || 0) + Number(entregaMontoPagar.value || 0)
  const payload = {
    estado_pedido: 'Entregado',
    monto_pagado: nuevoPagado,
    estado_pago: nuevoPagado >= Number(ped.total) ? 'Pagado total' : 'Pagado parcial',
    metodo_pago: entregaMetodoPago.value
  }
  
  if (hasConfig) {
    const { error } = await supabase
      .from('pedidos')
      .update(payload)
      .eq('id', ped.id)
      
    if (error) {
      alert(`Error al entregar pedido: ${error.message}`)
    } else {
      fetchPedidos()
      closeEntregarPedido()
    }
  } else {
    // mock
    const idx = pedidosList.value.findIndex((p: any) => p.id === ped.id)
    if (idx !== -1) {
      pedidosList.value[idx] = { ...pedidosList.value[idx], ...payload }
    }
    closeEntregarPedido()
  }
  savingEntrega.value = false
}

const activeCita = ref<Cita | null>(null)
const savingExamen = ref(false)
const savingPedido = ref(false)

const micaOptions = ['Policarbonato', 'Índice alto', 'Antirreflejo', 'Filtro azul', 'Fotocromático', 'Progresivo', 'Bifocal']
const tratamientoOptions = ['Antirrayas', 'Antirreflejo', 'Filtro UV', 'Hidrofóbico', 'Oleofóbico']
const entregaOptions = ['Inmediata', 'Encargo']
const pagoOptions = ['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Yappy', 'Transferencia']
const estadoPagoOptions = ['Pagado total', 'Pagado parcial', 'Pendiente']

const createEmptyPedido = () => ({
  marca_armazon: '',
  modelo_armazon: '',
  color_armazon: '',
  precio_armazon: 0,
  tipo_mica: '',
  tratamientos: [] as string[],
  precio_micas: 0,
  descuento: 0,
  tipo_entrega: 'Inmediata',
  fecha_entrega_prometida: '',
  metodo_pago: 'Efectivo',
  estado_pago: 'Pagado total',
  monto_pagado: 0,
  observaciones: '',
  estado_pedido: 'En fabricación'
})

const formPedido = ref(createEmptyPedido())
const editingPedidoId = ref<string | number | null>(null)
const clienteDetallesEdicion = ref({ nombre: '', telefono: '', edad: null as number | null })
const isOriginalPedidoEntregado = ref(false)

const subtotalPedido = computed(() => (Number(formPedido.value.precio_armazon) || 0) + (Number(formPedido.value.precio_micas) || 0))
const totalMenosDescuento = computed(() => {
  const s = subtotalPedido.value - (Number(formPedido.value.descuento) || 0)
  return s > 0 ? s : 0
})
const ivaPedido = computed(() => totalMenosDescuento.value * 0.12)
const totalPedido = computed(() => totalMenosDescuento.value + ivaPedido.value)
const saldoPendiente = computed(() => totalPedido.value - (Number(formPedido.value.monto_pagado) || 0))

watch(() => formPedido.value.estado_pago, (newVal) => {
  if (newVal === 'Pagado total') {
    formPedido.value.monto_pagado = Number(totalPedido.value.toFixed(2))
  } else if (newVal === 'Pendiente') {
    formPedido.value.monto_pagado = 0
  }
})

watch(totalPedido, (newTotal) => {
   if (formPedido.value.estado_pago === 'Pagado total') {
      formPedido.value.monto_pagado = Number(newTotal.toFixed(2))
   }
})

function openPedido() {
  isAtenderModalOpen.value = false
  formPedido.value = createEmptyPedido()
  isPedidoModalOpen.value = true
}

function closePedido() {
  isPedidoModalOpen.value = false
  activeCita.value = null
  editingPedidoId.value = null
  clienteDetallesEdicion.value = { nombre: '', telefono: '', edad: null }
  isOriginalPedidoEntregado.value = false
}

async function openEditarPedido(ped: any) {
  editingPedidoId.value = ped.id
  
  if (hasConfig) {
    loading.value = true
    try {
      const { data, error: sbError } = await supabase
        .from('pedidos')
        .select('*, pacientes(*)')
        .eq('id', ped.id)
        .single()
        
      if (sbError) {
        alert(`Error al cargar los detalles del pedido: ${sbError.message}`)
        editingPedidoId.value = null
        return
      }
      
      if (data) {
        formPedido.value = {
          marca_armazon: data.marca_armazon || '',
          modelo_armazon: data.modelo_armazon || '',
          color_armazon: data.color_armazon || '',
          precio_armazon: Number(data.precio_armazon) || 0,
          tipo_mica: data.tipo_mica || '',
          tratamientos: Array.isArray(data.tratamientos) ? data.tratamientos : [],
          precio_micas: Number(data.precio_micas) || 0,
          descuento: Number(data.descuento) || 0,
          tipo_entrega: data.tipo_entrega || 'Inmediata',
          fecha_entrega_prometida: data.fecha_entrega_prometida || '',
          metodo_pago: data.metodo_pago || 'Efectivo',
          estado_pago: data.estado_pago || 'Pagado total',
          monto_pagado: Number(data.monto_pagado) || 0,
          observaciones: data.observaciones || '',
          estado_pedido: data.estado_pedido || 'En fabricación'
        }
        clienteDetallesEdicion.value = {
          nombre: data.pacientes?.nombre || 'Desconocido',
          telefono: data.pacientes?.telefono || '',
          edad: data.pacientes?.edad || null
        }
        isOriginalPedidoEntregado.value = (data.estado_pedido === 'Entregado')
        isPedidoModalOpen.value = true
      }
    } catch (e) {
      alert(`Error inesperado: ${e instanceof Error ? e.message : 'Error desconocido'}`)
      editingPedidoId.value = null
    } finally {
      loading.value = false
    }
  } else {
    // Mock mode
    formPedido.value = {
      marca_armazon: ped.marca_armazon || '',
      modelo_armazon: ped.modelo_armazon || '',
      color_armazon: '',
      precio_armazon: 100,
      tipo_mica: ped.tipo_mica || 'Policarbonato',
      tratamientos: [],
      precio_micas: 50,
      descuento: 0,
      tipo_entrega: ped.tipo_entrega || 'Inmediata',
      fecha_entrega_prometida: '',
      metodo_pago: 'Efectivo',
      estado_pago: ped.estado_pago || 'Pagado total',
      monto_pagado: ped.monto_pagado || ped.total || 0,
      observaciones: '',
      estado_pedido: ped.estado_pedido || 'En fabricación'
    }
    clienteDetallesEdicion.value = {
      nombre: ped.pacientes?.nombre || 'Desconocido',
      telefono: '',
      edad: null
    }
    isOriginalPedidoEntregado.value = (ped.estado_pedido === 'Entregado')
    isPedidoModalOpen.value = true
  }
}

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
    owner: 'publicidad',
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
    owner: 'especialista',
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
    owner: 'publicidad',
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
  cedulaInput.value = ''
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
  // Return to Atender modal instead of closing everything
  isAtenderModalOpen.value = true
}

function cancelarCita(cita: Cita) {
  citaToCancel.value = cita
  isCancelModalOpen.value = true
}

function closeCancelModal() {
  isCancelModalOpen.value = false
  citaToCancel.value = null
}

async function confirmCancelarCita() {
  if (!citaToCancel.value) return
  const cita = citaToCancel.value

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
  closeCancelModal()
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
        cedula: cedulaInput.value,
        nombre: activeCita.value.nombre,
        telefono: activeCita.value.telefono,
        edad: activeCita.value.edad,
        owner: activeCita.value.owner || 'publicidad'
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

    // 3. Update Lead estado_cita = Atendida
    const { data: updatedLeads, error: leadError } = await supabase
      .from('leads')
      .update({ estado_cita: 'Atendida' })
      .eq('id', activeCita.value.id)
      .select('id, estado_cita')

    if (leadError) {
      alert(`Error al actualizar estado de la cita: ${leadError.message}`)
      savingExamen.value = false
      return
    }

    if (!updatedLeads || updatedLeads.length === 0) {
      alert('Advertencia: el examen fue guardado pero no se pudo actualizar el estado de la cita (posible restricción de permisos en la base de datos). Contacte al administrador.')
    }

    // Actualizar UI localmente (optimista)
    const idx = citas.value.findIndex(c => c.id === activeCita.value!.id)
    if (idx !== -1) citas.value[idx].estado_cita = 'Atendida'
    if (activeCita.value) activeCita.value.estado_cita = 'Atendida'

    // Re-fetch desde Supabase para confirmar el estado real en DB
    fetchCitas()
  } else {
    // Modo mock
    const idx = citas.value.findIndex(c => c.id === activeCita.value!.id)
    if (idx !== -1) citas.value[idx].estado_cita = 'Atendida'
    if (activeCita.value) activeCita.value.estado_cita = 'Atendida'
  }

  savingExamen.value = false
  // Cerrar examen y volver al modal Atender
  isExamenModalOpen.value = false
  isAtenderModalOpen.value = true
}

async function guardarPedido() {
  if (!editingPedidoId.value && !activeCita.value) return
  if (!formPedido.value.marca_armazon || !formPedido.value.modelo_armazon || formPedido.value.precio_armazon === null || formPedido.value.precio_armazon === 0) {
    alert("Marca, modelo y precio del armazón son obligatorios.")
    return
  }
  if (!formPedido.value.tipo_mica || formPedido.value.precio_micas === null) {
    alert("Tipo de mica y precio son obligatorios.")
    return
  }
  if (formPedido.value.tipo_entrega === 'Encargo' && !formPedido.value.fecha_entrega_prometida) {
    alert("La fecha prometida es obligatoria para pedidos por encargo.")
    return
  }

  savingPedido.value = true
  if (hasConfig) {
    if (editingPedidoId.value) {
      // --- MODO EDICIÓN ---
      const updatePayload = {
        tipo_entrega: formPedido.value.tipo_entrega,
        fecha_entrega_prometida: formPedido.value.tipo_entrega === 'Encargo' ? formPedido.value.fecha_entrega_prometida : null,
        fecha_entrega_real: formPedido.value.tipo_entrega === 'Inmediata' ? new Date().toISOString().split('T')[0] : null,
        marca_armazon: formPedido.value.marca_armazon,
        modelo_armazon: formPedido.value.modelo_armazon,
        color_armazon: formPedido.value.color_armazon,
        precio_armazon: formPedido.value.precio_armazon,
        tipo_mica: formPedido.value.tipo_mica,
        tratamientos: formPedido.value.tratamientos,
        precio_micas: formPedido.value.precio_micas,
        subtotal: subtotalPedido.value,
        descuento: formPedido.value.descuento,
        iva: ivaPedido.value,
        total: totalPedido.value,
        metodo_pago: formPedido.value.metodo_pago,
        estado_pago: formPedido.value.estado_pago,
        monto_pagado: formPedido.value.monto_pagado,
        estado_pedido: formPedido.value.estado_pedido,
        observaciones: formPedido.value.observaciones
      }

      const { error: updateError } = await supabase
        .from('pedidos')
        .update(updatePayload)
        .eq('id', editingPedidoId.value)

      if (updateError) {
        alert(`Error al actualizar el pedido: ${updateError.message}`)
        savingPedido.value = false
        return
      }

      fetchPedidos()
    } else {
      // --- MODO CREACIÓN ---
      // 1. Ensure Paciente exists or create it
      let pacienteId = null
      const { data: existingPacientes, error: searchError } = await supabase
        .from('pacientes')
        .select('id')
        .eq('cedula', cedulaInput.value)
        .limit(1)

      if (existingPacientes && existingPacientes.length > 0) {
        pacienteId = existingPacientes[0].id
      } else {
        const { data: newPaciente, error: pacError } = await supabase
          .from('pacientes')
          .insert({
            lead_id: activeCita.value!.id,
            cedula: cedulaInput.value,
            nombre: activeCita.value!.nombre,
            telefono: activeCita.value!.telefono,
            edad: activeCita.value!.edad,
            owner: activeCita.value!.owner || 'publicidad'
          })
          .select('id')
          .single()
        
        if (pacError) {
          alert(`Error al crear paciente: ${pacError.message}`)
          savingPedido.value = false
          return
        }
        pacienteId = newPaciente.id
      }

      // 2. Insert Pedido
      const pedidoPayload = {
        paciente_id: pacienteId,
        lead_id: activeCita.value!.id,
        owner: activeCita.value!.owner || 'publicidad',
        numero_pedido: `PED-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        fecha_pedido: new Date().toISOString().split('T')[0],
        tipo_entrega: formPedido.value.tipo_entrega,
        fecha_entrega_prometida: formPedido.value.tipo_entrega === 'Encargo' ? formPedido.value.fecha_entrega_prometida : null,
        fecha_entrega_real: formPedido.value.tipo_entrega === 'Inmediata' ? new Date().toISOString().split('T')[0] : null,
        marca_armazon: formPedido.value.marca_armazon,
        modelo_armazon: formPedido.value.modelo_armazon,
        color_armazon: formPedido.value.color_armazon,
        precio_armazon: formPedido.value.precio_armazon,
        tipo_mica: formPedido.value.tipo_mica,
        tratamientos: formPedido.value.tratamientos,
        precio_micas: formPedido.value.precio_micas,
        subtotal: subtotalPedido.value,
        descuento: formPedido.value.descuento,
        iva: ivaPedido.value,
        total: totalPedido.value,
        metodo_pago: formPedido.value.metodo_pago,
        estado_pago: formPedido.value.estado_pago,
        monto_pagado: formPedido.value.monto_pagado,
        estado_pedido: formPedido.value.tipo_entrega === 'Inmediata' ? 'Entregado' : 'En fabricación',
        observaciones: formPedido.value.observaciones
      }

      const { error: pedidoError } = await supabase
        .from('pedidos')
        .insert(pedidoPayload)

      if (pedidoError) {
        alert(`Error al guardar el pedido: ${pedidoError.message}`)
        savingPedido.value = false
        return
      }

      // 3. Update Lead status to 'Atendida' if it isn't already
      if (activeCita.value!.estado_cita !== 'Atendida') {
        const { data: updatedLead, error: leadError } = await supabase
          .from('leads')
          .update({ estado_cita: 'Atendida' })
          .eq('id', activeCita.value!.id)
          .select('id, estado_cita')

        if (!leadError) {
          const idx = citas.value.findIndex(c => c.id === activeCita.value!.id)
          if (idx !== -1) citas.value[idx].estado_cita = 'Atendida'
          if (activeCita.value) activeCita.value.estado_cita = 'Atendida'

          if (!updatedLead || updatedLead.length === 0) {
            console.warn('UPDATE de estado_cita no afectó filas — revisar RLS en tabla leads')
          }
        }
      }
      // Re-fetch citas para reflejar el estado real de la DB
      fetchCitas()
    }
  } else {
    // Mock mode
    if (editingPedidoId.value) {
      const idx = pedidosList.value.findIndex(p => p.id === editingPedidoId.value)
      if (idx !== -1) {
        pedidosList.value[idx] = {
          ...pedidosList.value[idx],
          marca_armazon: formPedido.value.marca_armazon,
          modelo_armazon: formPedido.value.modelo_armazon,
          total: totalPedido.value,
          monto_pagado: formPedido.value.monto_pagado,
          estado_pago: formPedido.value.estado_pago,
          tipo_entrega: formPedido.value.tipo_entrega,
          estado_pedido: formPedido.value.estado_pedido || 'En fabricación'
        }
      }
    } else {
      const idx = citas.value.findIndex(c => c.id === activeCita.value!.id)
      if (idx !== -1) citas.value[idx].estado_cita = 'Atendida'
      if (activeCita.value) activeCita.value.estado_cita = 'Atendida'
    }
  }

  savingPedido.value = false
  closePedido()
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
    p.telefono?.toLowerCase().includes(q) ||
    p.cedula?.toLowerCase().includes(q)
  )
})

const filteredLeads = computed(() => {
  const list = [...todosLosLeads.value].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter(l =>
    l.nombre?.toLowerCase().includes(q) ||
    l.telefono?.toLowerCase().includes(q) ||
    (l.estado_cita || '').toLowerCase().includes(q)
  )
})

// Leads pagination
const leadsPageSize = 25
const leadsPage = ref(0)
const leadsTotalPages = computed(() => Math.max(1, Math.ceil(filteredLeads.value.length / leadsPageSize)))
const leadsPageStart = computed(() => leadsPage.value * leadsPageSize)
const pagedLeads = computed(() => filteredLeads.value.slice(leadsPageStart.value, leadsPageStart.value + leadsPageSize))

// Reset page when search changes
watch(searchQuery, () => { leadsPage.value = 0 })

const filteredPedidos = computed(() => {
  if (!searchQuery.value) return pedidosList.value
  const q = searchQuery.value.toLowerCase()
  return pedidosList.value.filter(p =>
    p.numero_pedido?.toLowerCase().includes(q) ||
    p.pacientes?.nombre?.toLowerCase().includes(q) ||
    p.estado_pedido?.toLowerCase().includes(q)
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
      .select('id, nombre, telefono, edad, respuestas, resultado, estado, fecha_cita, hora_cita, estado_cita, origen, owner, created_at')
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
      .select('id, lead_id, owner, cedula, nombre, telefono, edad, created_at, pedidos(id), historial_clinico(id)')
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
      .select('id, nombre, telefono, edad, respuestas, resultado, estado, fecha_cita, hora_cita, estado_cita, origen, owner, created_at')
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

async function fetchPedidos() {
  loading.value = true
  error.value = ''
  if (!hasConfig) {
    await new Promise(r => setTimeout(r, 400))
    pedidosList.value = []
    loading.value = false
    return
  }
  try {
    const { data, error: sbError } = await supabase
      .from('pedidos')
      .select('id, numero_pedido, paciente_id, owner, pacientes(id, nombre, historial_clinico(id)), marca_armazon, modelo_armazon, total, monto_pagado, estado_pago, tipo_entrega, estado_pedido, fecha_pedido')
      .order('fecha_pedido', { ascending: false })
      .order('created_at', { ascending: false })
    if (sbError) {
      error.value = `Error al cargar pedidos: ${sbError.message}`
      pedidosList.value = []
    } else {
      pedidosList.value = (data as any) || []
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
