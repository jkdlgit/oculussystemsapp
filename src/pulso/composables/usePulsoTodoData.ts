// src/pulso/composables/usePulsoTodoData.ts
// Motor analítico consolidado para la pestaña TODO (Multi-Quiz por Cliente)

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { supabase, hasSupabaseConfig } from '@/supabase'
import { MOCK_CLIENTS } from '@/pulso/mock'
import { FUNNEL_THRESHOLDS, getFunnelStepColor } from '@/pulso/config/thresholds'
import type {
  Client,
  KpiData,
  TodoKpiComparison,
  TodoFunnelStep,
  QuizRankingRow,
  HeatmapCell,
  DailyVisit,
  Lead,
  Event
} from '@/pulso/types'

export function usePulsoTodoData(clientSlugParam: string) {
  const clientSlug = ref(clientSlugParam || 'opticajohanna')
  const selectedRangeDays = ref<number | null>(8) // 8 días por defecto
  const loading = ref(false)

  // Cliente activo
  const currentClient = computed<Client>(() => {
    return MOCK_CLIENTS.find(c => c.slug === clientSlug.value) || MOCK_CLIENTS[0]
  })

  // Lista de quizzes configurados para este cliente
  const clientQuizzes = computed(() => {
    return currentClient.value.quizzes || []
  })

  // Leads crudos agrupados por quiz
  const rawLeadsByQuiz = ref<Record<string, Lead[]>>({})
  const rawEvents = ref<Event[]>([])
  const rawPacientes = ref<any[]>([])
  const rawPedidos = ref<any[]>([])

  // Función auxiliar para determinar si una fecha cae en un rango [start, end]
  function isInRange(dateStr?: string, startDate?: Date, endDate?: Date): boolean {
    if (!dateStr) return false
    const d = new Date(dateStr).getTime()
    if (isNaN(d)) return false
    if (startDate && d < startDate.getTime()) return false
    if (endDate && d > endDate.getTime()) return false
    return true
  }

  // Definición de ventanas temporales: Actual vs Previo de igual duración
  const dateWindows = computed(() => {
    const now = new Date()
    if (!selectedRangeDays.value) {
      // Todo el historial sin límite
      return {
        currentStart: undefined,
        currentEnd: now,
        prevStart: undefined,
        prevEnd: undefined,
        days: 0,
      }
    }

    const days = selectedRangeDays.value
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const prevEnd = new Date(currentStart.getTime())
    const prevStart = new Date(prevEnd.getTime() - days * 24 * 60 * 60 * 1000)

    return {
      currentStart,
      currentEnd: now,
      prevStart,
      prevEnd,
      days,
    }
  })

  // Cargar datos desde Supabase
  async function loadData() {
    try {
      loading.value = true

      // 1. Consultar leads en Supabase
      if (hasSupabaseConfig) {
        try {
          const isDefaultPro = import.meta.env.VITE_SUPABASE_SCHEMA === 'pro'
          let queryLeads = supabase.from('leads').select('*').order('created_at', { ascending: false })

          if (clientSlug.value === 'opticajohanna' || clientSlug.value === 'oculus') {
            queryLeads = queryLeads.or('origen.eq.Quiz,origen.eq.quiz1,origen.eq.opticajohanna_quiz1,origen.eq.quiz2,origen.eq.opticajohanna_quiz2,origen.eq.visioncheck1,origen.eq.opticajohanna_visioncheck1,origen.is.null')
          } else {
            const quizFilters = clientQuizzes.value.map(q => `origen.eq.${clientSlug.value}_${q.quiz_key}`).join(',')
            queryLeads = queryLeads.or(`${quizFilters},origen.eq.${clientSlug.value}`)
          }

          const { data: leadsData } = await queryLeads
          let allLeadsRows: any[] = leadsData ? [...leadsData] : []

          if ((clientSlug.value === 'opticajohanna' || clientSlug.value === 'oculus') && !isDefaultPro) {
            try {
              const { data: proLeadsData } = await supabase
                .schema('pro')
                .from('leads')
                .select('*')
                .or('origen.eq.Quiz,origen.eq.quiz1,origen.eq.opticajohanna_quiz1,origen.eq.quiz2,origen.eq.opticajohanna_quiz2,origen.eq.visioncheck1,origen.eq.opticajohanna_visioncheck1,origen.is.null')
                .order('created_at', { ascending: false })

              if (proLeadsData) {
                const knownIds = new Set(allLeadsRows.map(l => `${l.origen || ''}_${l.id}`))
                const knownPhones = new Set(allLeadsRows.filter(l => l.telefono && l.telefono !== 'Sin registrar').map(l => l.telefono))
                proLeadsData.forEach((pl: any) => {
                  const isAnon = pl.telefono === 'Sin registrar' || pl.nombre === 'Visita Anónima'
                  if (isAnon) {
                    if (!knownIds.has(`${pl.origen || ''}_${pl.id}`)) allLeadsRows.push(pl)
                  } else {
                    if (!knownPhones.has(pl.telefono)) allLeadsRows.push(pl)
                  }
                })
              }
            } catch (e) {}
          }

          // Agrupar leads por quiz
          const grouped: Record<string, Lead[]> = {}
          clientQuizzes.value.forEach(q => {
            grouped[q.quiz_key] = []
          })

          allLeadsRows.forEach((d: any) => {
            const rawOrigin = (d.origen || '').toLowerCase()
            let assignedQuiz = 'quiz1'

            if (rawOrigin.includes('quiz2') || rawOrigin.includes('visioncheck')) {
              assignedQuiz = 'quiz2'
            } else if (rawOrigin.includes('quiz3')) {
              assignedQuiz = 'quiz3'
            } else {
              assignedQuiz = 'quiz1'
            }

            if (!grouped[assignedQuiz]) grouped[assignedQuiz] = []
            grouped[assignedQuiz].push({
              id: d.id,
              site_id: d.origen || assignedQuiz,
              client_id: clientSlug.value,
              quiz_id: assignedQuiz,
              nombre: d.nombre,
              telefono: d.telefono,
              edad: d.edad,
              email: d.email || '',
              respuestas: d.respuestas,
              resultado: d.resultado,
              estado: d.estado || 'Nuevo',
              estado_cita: d.estado_cita,
              fecha_cita: d.fecha_cita,
              hora_cita: d.hora_cita,
              utm_source: d.utm_source || 'directo',
              created_at: d.created_at,
            })
          })

          rawLeadsByQuiz.value = grouped
        } catch (e) {}

        // 2. Consultar Pacientes y Pedidos para el CRM local (con deduplicación estricta por ID)
        if (currentClient.value.has_local_crm) {
          try {
            const isDefaultPro = import.meta.env.VITE_SUPABASE_SCHEMA === 'pro'
            const [pacRes, pedRes] = await Promise.all([
              supabase.from('pacientes').select('id, lead_id, created_at'),
              supabase.from('pedidos').select('id, paciente_id, total, estado_pago, estado_pedido, fecha_entrega_real, created_at'),
            ])

            let pacRows = pacRes.data ? [...pacRes.data] : []
            let pedRows = pedRes.data ? [...pedRes.data] : []

            if (!isDefaultPro) {
              try {
                const [pacProRes, pedProRes] = await Promise.all([
                  supabase.schema('pro').from('pacientes').select('id, lead_id, created_at'),
                  supabase.schema('pro').from('pedidos').select('id, paciente_id, total, estado_pago, estado_pedido, fecha_entrega_real, created_at'),
                ])
                if (pacProRes.data) pacRows.push(...pacProRes.data)
                if (pedProRes.data) pedRows.push(...pedProRes.data)
              } catch (e) {}
            }

            // Deduplicar estrictamente por id
            const pacMap = new Map<string, any>()
            pacRows.forEach(p => {
              if (p?.id && !pacMap.has(String(p.id))) pacMap.set(String(p.id), p)
            })
            rawPacientes.value = Array.from(pacMap.values())

            const pedMap = new Map<string, any>()
            pedRows.forEach(p => {
              if (p?.id && !pedMap.has(String(p.id))) pedMap.set(String(p.id), p)
            })
            rawPedidos.value = Array.from(pedMap.values())
          } catch (e) {
            console.warn('[PULSO TODO] Error consultando pacientes/pedidos:', e)
          }
        }
      }
    } catch (err) {
      console.error('[PULSO TODO] Error sincronizando datos:', err)
    } finally {
      loading.value = false
    }
  }

  // Función matemática para calcular las 9 métricas de un subconjunto de leads
  function calculateKpiForLeads(
    leadsSubset: Lead[],
    startDate?: Date,
    endDate?: Date
  ): { kpi: KpiData; pastReservasCount: number } {
    // Filtrar leads por ventana temporal
    const filteredLeads = leadsSubset.filter(l => isInRange(l.created_at, startDate, endDate))

    const visitas = filteredLeads.length
    const paso1 = filteredLeads.filter(l => l.telefono !== 'Sin registrar' && l.estado !== 'Visita').length

    const paso2 = filteredLeads.filter(l => {
      const resp = (l.respuestas as any) || {}
      return (
        (resp.paso && resp.paso >= 2) ||
        (resp.sintomas && resp.sintomas.length > 0) ||
        resp.visionCheck_score ||
        l.estado === 'Paso 2' ||
        l.estado === 'Paso 3' ||
        l.estado === 'Viendo Resultados' ||
        l.estado === 'Completado' ||
        l.estado === 'Agendado' ||
        l.estado === 'Atendido'
      )
    }).length

    const paso3 = filteredLeads.filter(l => {
      const resp = (l.respuestas as any) || {}
      return (
        (resp.paso && resp.paso >= 3) ||
        resp.vision_lejos ||
        resp.vision_cerca ||
        (resp.visionCheck_score && l.estado === 'Agendado') ||
        l.estado === 'Paso 3' ||
        l.estado === 'Viendo Resultados' ||
        l.estado === 'Completado' ||
        l.estado === 'Agendado' ||
        l.estado === 'Atendido'
      )
    }).length

    const completados = filteredLeads.filter(l => {
      const resp = (l.respuestas as any) || {}
      return (
        (resp.paso && resp.paso >= 4) ||
        resp.problemas_colores ||
        resp.visionCheck_score ||
        l.estado === 'Viendo Resultados' ||
        l.estado === 'Completado' ||
        l.estado === 'Agendado' ||
        l.estado === 'Atendido'
      )
    }).length

    // Reservas: Agendado o Atendido, o con fecha de cita o estado_cita distinto de 'Nueva'
    const reservasLeads = filteredLeads.filter(l =>
      l.estado === 'Agendado' ||
      l.estado === 'Atendido' ||
      !!l.fecha_cita ||
      (l.estado_cita && l.estado_cita !== 'Nueva')
    )
    const reservas = reservasLeads.length

    // Reservas PASADAS (para cálculo estricto de asistencia al local: una cita futura no es inasistencia)
    const nowTime = new Date().getTime()
    const pastReservasLeads = reservasLeads.filter(l => {
      if (l.estado_cita === 'Atendida' || l.estado === 'Atendido') return true
      if (l.fecha_cita) {
        const appointmentTime = new Date(`${l.fecha_cita}T${l.hora_cita || '23:59:59'}`).getTime()
        return appointmentTime <= nowTime
      }
      return true
    })
    const pastReservasCount = pastReservasLeads.length

    let llegaron = 0
    let ventasCount = 0
    let ingresosTotal = 0

    if (currentClient.value.has_local_crm) {
      // 1. Llegaron al local: estado_cita === 'Atendida'
      llegaron = filteredLeads.filter(l => l.estado_cita === 'Atendida').length

      // 2. Pacientes vinculados a estos leads
      const leadIds = new Set(filteredLeads.map(l => l.id))
      const matchingPacientes = rawPacientes.value.filter(p => p.lead_id && leadIds.has(p.lead_id))
      const matchingPacienteIds = new Set(matchingPacientes.map(p => p.id))

      // 3. Pedidos pagados vinculados a esos pacientes
      const uniquePagosMap = new Map<string, any>()
      rawPedidos.value
        .filter(p => matchingPacienteIds.has(p.paciente_id) && p.estado_pago === 'Pagado total')
        .forEach(p => {
          if (!uniquePagosMap.has(String(p.id))) uniquePagosMap.set(String(p.id), p)
        })

      const uniquePagos = Array.from(uniquePagosMap.values())
      ventasCount = uniquePagos.length
      ingresosTotal = uniquePagos.reduce((acc, p) => acc + (Number(p.total) || 0), 0)
    }

    return {
      kpi: {
        visitas,
        paso1,
        paso2,
        paso3,
        completados,
        reservas,
        llegaron,
        ventasCount,
        ingresosTotal,
        activeNow: Math.max(1, visitas > 0 ? 1 : 0),
      },
      pastReservasCount,
    }
  }

  // Todos los leads del cliente combinados
  const allClientLeads = computed<Lead[]>(() => {
    return Object.values(rawLeadsByQuiz.value).flat()
  })

  // Métricas del Período Actual y Previo
  const currentMetrics = computed(() => {
    const { currentStart, currentEnd } = dateWindows.value
    return calculateKpiForLeads(allClientLeads.value, currentStart, currentEnd)
  })

  const prevMetrics = computed(() => {
    const { prevStart, prevEnd } = dateWindows.value
    if (!prevStart || !prevEnd) return null
    return calculateKpiForLeads(allClientLeads.value, prevStart, prevEnd)
  })

  // 1. TARJETAS TOTALES CON VARIACIÓN COMPARATIVA
  const kpi = computed<KpiData>(() => currentMetrics.value.kpi)

  const kpiComparison = computed<TodoKpiComparison>(() => {
    const cur = currentMetrics.value.kpi
    const prev = prevMetrics.value?.kpi
    const res: any = {}

    const keys: (keyof KpiData)[] = [
      'visitas',
      'paso1',
      'paso2',
      'paso3',
      'completados',
      'reservas',
      'llegaron',
      'ventasCount',
      'ingresosTotal',
      'activeNow',
    ]

    keys.forEach(k => {
      const v = cur[k]
      const pv = prev ? prev[k] : 0

      let diffPct: number | null = null
      let diffLabel = ''
      let isPositive = false
      let isNegative = false
      let isNew = false
      let color = '#94a3b8'

      const days = dateWindows.value.days
      const suffix = days > 0 ? ` vs. los ${days} días previos` : ''

      if (days === 0) {
        diffLabel = 'Histórico acumulado'
        color = '#38bdf8'
      } else if (!prev || pv === 0) {
        if (v > 0) {
          isNew = true
          diffLabel = 'nuevo'
          color = '#10b981'
        } else {
          diffLabel = `= 0%${suffix}`
          color = '#94a3b8'
        }
      } else {
        diffPct = Math.round(((v - pv) / pv) * 100)
        if (diffPct > 0) {
          isPositive = true
          diffLabel = `▲ +${diffPct}%${suffix}`
          color = '#10b981'
        } else if (diffPct < 0) {
          isNegative = true
          diffLabel = `▼ ${diffPct}%${suffix}`
          color = '#ef4444'
        } else {
          diffLabel = `= 0%${suffix}`
          color = '#94a3b8'
        }
      }

      res[k] = {
        value: v,
        prevValue: pv,
        diffPct,
        diffLabel,
        isPositive,
        isNegative,
        isNew,
        color,
      }
    })

    return res as TodoKpiComparison
  })

  // 2. EMBUDO TOTAL INTELIGENTE (Degradado Continuo + Reglas de Control)
  const todoFunnel = computed<TodoFunnelStep[]>(() => {
    const k = currentMetrics.value.kpi
    const pastReservas = currentMetrics.value.pastReservasCount
    const v = k.visitas

    const calcVisitsPct = (count: number) => (v > 0 ? (count / v) * 100 : 0)

    // Etapa 0: Visitas (Siempre celeste)
    const steps: TodoFunnelStep[] = [
      {
        key: 'visitas',
        label: 'Visitas',
        count: v,
        pctStep: 100,
        pctVisits: 100,
        color: '#38bdf8', // Celeste de entrada fijo
        symbol: '●',
        statusLabel: 'Entrada',
        isInsuficientData: false,
        minPersons: 0,
        previousCount: v,
      },
    ]

    // Etapa 1: Visita -> Paso 1
    const p1Th = FUNNEL_THRESHOLDS.paso1
    const p1Pct = v > 0 ? (k.paso1 / v) * 100 : 0
    const p1Col = getFunnelStepColor(p1Pct, p1Th, v)
    steps.push({
      key: 'paso1',
      label: 'Paso 1 (Datos / Inicio)',
      count: k.paso1,
      pctStep: p1Pct,
      pctVisits: calcVisitsPct(k.paso1),
      color: p1Col.color,
      symbol: p1Col.symbol,
      statusLabel: p1Col.statusLabel,
      isInsuficientData: p1Col.isInsuficientData,
      minPersons: p1Th.minPersons,
      previousCount: v,
    })

    // Etapa 2: Paso 1 -> Paso 2
    const p2Th = FUNNEL_THRESHOLDS.paso2
    const p2Pct = k.paso1 > 0 ? (k.paso2 / k.paso1) * 100 : 0
    const p2Col = getFunnelStepColor(p2Pct, p2Th, k.paso1)
    steps.push({
      key: 'paso2',
      label: 'Paso 2 (Evaluación)',
      count: k.paso2,
      pctStep: p2Pct,
      pctVisits: calcVisitsPct(k.paso2),
      color: p2Col.color,
      symbol: p2Col.symbol,
      statusLabel: p2Col.statusLabel,
      isInsuficientData: p2Col.isInsuficientData,
      minPersons: p2Th.minPersons,
      previousCount: k.paso1,
    })

    // Etapa 3: Paso 2 -> Paso 3
    const p3Th = FUNNEL_THRESHOLDS.paso3
    const p3Pct = k.paso2 > 0 ? (k.paso3 / k.paso2) * 100 : 0
    const p3Col = getFunnelStepColor(p3Pct, p3Th, k.paso2)
    steps.push({
      key: 'paso3',
      label: 'Paso 3 (Diagnóstico)',
      count: k.paso3,
      pctStep: p3Pct,
      pctVisits: calcVisitsPct(k.paso3),
      color: p3Col.color,
      symbol: p3Col.symbol,
      statusLabel: p3Col.statusLabel,
      isInsuficientData: p3Col.isInsuficientData,
      minPersons: p3Th.minPersons,
      previousCount: k.paso2,
    })

    // Etapa 4: Paso 3 -> Completados
    const compTh = FUNNEL_THRESHOLDS.completados
    const compPct = k.paso3 > 0 ? (k.completados / k.paso3) * 100 : 0
    const compCol = getFunnelStepColor(compPct, compTh, k.paso3)
    steps.push({
      key: 'completados',
      label: 'Completados (Test Finalizado)',
      count: k.completados,
      pctStep: compPct,
      pctVisits: calcVisitsPct(k.completados),
      color: compCol.color,
      symbol: compCol.symbol,
      statusLabel: compCol.statusLabel,
      isInsuficientData: compCol.isInsuficientData,
      minPersons: compTh.minPersons,
      previousCount: k.paso3,
    })

    // Etapa 5: Completados -> Reservas
    const resTh = FUNNEL_THRESHOLDS.reservas
    const resPct = k.completados > 0 ? (k.reservas / k.completados) * 100 : 0
    const resCol = getFunnelStepColor(resPct, resTh, k.completados)
    steps.push({
      key: 'reservas',
      label: 'Reservas (Cita / WhatsApp)',
      count: k.reservas,
      pctStep: resPct,
      pctVisits: calcVisitsPct(k.reservas),
      color: resCol.color,
      symbol: resCol.symbol,
      statusLabel: resCol.statusLabel,
      isInsuficientData: resCol.isInsuficientData,
      minPersons: resTh.minPersons,
      previousCount: k.completados,
    })

    // Etapa 6: Reservas -> Llegaron al Local (Evaluando solo reservas pasadas)
    const llegTh = FUNNEL_THRESHOLDS.llegaron
    const llegPct = pastReservas > 0 ? (k.llegaron / pastReservas) * 100 : 0
    const llegCol = getFunnelStepColor(llegPct, llegTh, pastReservas)
    steps.push({
      key: 'llegaron',
      label: 'Llegaron al Local',
      count: k.llegaron,
      pctStep: llegPct,
      pctVisits: calcVisitsPct(k.llegaron),
      color: llegCol.color,
      symbol: llegCol.symbol,
      statusLabel: llegCol.statusLabel,
      isInsuficientData: llegCol.isInsuficientData,
      minPersons: llegTh.minPersons,
      previousCount: pastReservas,
    })

    // Etapa 7: Llegaron -> Ventas Concretadas
    const ventTh = FUNNEL_THRESHOLDS.ventas
    const ventPct = k.llegaron > 0 ? (k.ventasCount / k.llegaron) * 100 : 0
    const ventCol = getFunnelStepColor(ventPct, ventTh, k.llegaron)
    steps.push({
      key: 'ventas',
      label: 'Ventas Concretadas',
      count: k.ventasCount,
      pctStep: ventPct,
      pctVisits: calcVisitsPct(k.ventasCount),
      color: ventCol.color,
      symbol: ventCol.symbol,
      statusLabel: ventCol.statusLabel,
      isInsuficientData: ventCol.isInsuficientData,
      minPersons: ventTh.minPersons,
      previousCount: k.llegaron,
    })

    return steps
  })

  // 3. RANKING DE QUIZZES (Tabla comparativa)
  const quizRanking = computed<{ rows: QuizRankingRow[]; totalRow: QuizRankingRow }>(() => {
    const { currentStart, currentEnd } = dateWindows.value
    const rows: QuizRankingRow[] = []

    clientQuizzes.value.forEach(q => {
      const qLeads = rawLeadsByQuiz.value[q.quiz_key] || []
      const { kpi: qKpi } = calculateKpiForLeads(qLeads, currentStart, currentEnd)

      const tasaGlobal = qKpi.visitas > 0 ? (qKpi.ventasCount / qKpi.visitas) * 100 : 0

      rows.push({
        quizKey: q.quiz_key,
        quizName: q.name,
        emoji: q.quiz_key === 'quiz2' ? '🧪' : '👁️',
        visitas: qKpi.visitas,
        completados: qKpi.completados,
        reservas: qKpi.reservas,
        llegaron: qKpi.llegaron,
        ventas: qKpi.ventasCount,
        ingresos: qKpi.ingresosTotal,
        tasaGlobal,
      })
    })

    const totKpi = currentMetrics.value.kpi
    const totalTasa = totKpi.visitas > 0 ? (totKpi.ventasCount / totKpi.visitas) * 100 : 0

    const totalRow: QuizRankingRow = {
      quizKey: 'todo',
      quizName: 'Total Consolidado',
      emoji: '🌐',
      visitas: totKpi.visitas,
      completados: totKpi.completados,
      reservas: totKpi.reservas,
      llegaron: totKpi.llegaron,
      ventas: totKpi.ventasCount,
      ingresos: totKpi.ingresosTotal,
      tasaGlobal: totalTasa,
    }

    return { rows, totalRow }
  })

  // 4. EVOLUCIÓN DIARIA Y FUENTES (Consolidadas)
  const dailyData = computed<DailyVisit[]>(() => {
    const days: Record<string, { visitas: number; completados: number; reservas: number }> = {}
    const { currentStart, currentEnd } = dateWindows.value
    const filteredLeads = allClientLeads.value.filter(l => isInRange(l.created_at, currentStart, currentEnd))

    filteredLeads.forEach(l => {
      const d = new Date(l.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })
      if (!days[d]) days[d] = { visitas: 0, completados: 0, reservas: 0 }
      days[d].visitas += 1
      if (l.estado === 'Viendo Resultados' || l.estado === 'Completado' || l.estado === 'Agendado' || l.estado === 'Atendido') {
        days[d].completados += 1
      }
      if (l.estado === 'Agendado' || l.estado === 'Atendido' || l.estado_cita) {
        days[d].reservas += 1
      }
    })

    return Object.entries(days).map(([date, counts]) => ({
      date,
      visitas: counts.visitas,
      completados: counts.completados,
      reservas: counts.reservas,
    }))
  })

  const sources = computed(() => {
    const sourceMap: Record<string, number> = {}
    const { currentStart, currentEnd } = dateWindows.value
    const filteredLeads = allClientLeads.value.filter(l => isInRange(l.created_at, currentStart, currentEnd))

    filteredLeads.forEach(l => {
      const s = (l.utm_source || 'directo').toLowerCase()
      sourceMap[s] = (sourceMap[s] || 0) + 1
    })

    const total = Object.values(sourceMap).reduce((a, b) => a + b, 0)
    const palette = ['#38bdf8', '#10b981', '#f59e0b', '#6366f1', '#ec4899']
    let pIdx = 0

    return Object.entries(sourceMap).map(([label, count]) => ({
      label: label.toUpperCase(),
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      color: palette[pIdx++ % palette.length],
    }))
  })

  // ---------------------------------------------------------------------------
  // ETAPA 2: MAPA DE CALOR 7x24 (Día x Hora) — Hora local Ecuador UTC-5
  // ---------------------------------------------------------------------------

  // Días de la semana en español (0=Lunes ... 6=Domingo)
  const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  // Convierte una fecha ISO a hora local Ecuador (UTC-5) sin librerías externas
  function toEcuadorHour(dateStr: string): { dayIndex: number; hour: number } | null {
    if (!dateStr) return null
    const utcMs = new Date(dateStr).getTime()
    if (isNaN(utcMs)) return null
    // Ecuador = UTC-5 → restar 5 horas
    const ecMs = utcMs - 5 * 60 * 60 * 1000
    const ecDate = new Date(ecMs)
    // getUTCDay(): 0=Domingo ... 6=Sábado → convertir a 0=Lunes ... 6=Domingo
    const rawDay = ecDate.getUTCDay() // 0=Dom,1=Lun,...,6=Sáb
    const dayIndex = rawDay === 0 ? 6 : rawDay - 1 // 0=Lun...6=Dom
    const hour = ecDate.getUTCHours()
    return { dayIndex, hour }
  }

  // Mapa de calor: HeatmapCell[dayIndex 0-6][hour 0-23]
  const heatmapData = computed<HeatmapCell[][]>(() => {
    // Inicializar matriz 7 días × 24 horas
    const matrix: HeatmapCell[][] = Array.from({ length: 7 }, (_, dayIndex) =>
      Array.from({ length: 24 }, (_, hour) => ({
        dayIndex,
        hour,
        visitas: 0,
        completados: 0,
        reservas: 0,
        llegaron: 0,
        ventas: 0,
        tasa: 0,
      }))
    )

    const { currentStart, currentEnd } = dateWindows.value
    const filteredLeads = allClientLeads.value.filter(l =>
      isInRange(l.created_at, currentStart, currentEnd)
    )

    // Mínimo 4 semanas (28 días) para estadísticas horarias confiables
    const daysSelected = selectedRangeDays.value || 365
    const lowDataWarning = daysSelected < 28

    filteredLeads.forEach(l => {
      const ec = toEcuadorHour(l.created_at || '')
      if (!ec) return
      const { dayIndex, hour } = ec
      const cell = matrix[dayIndex][hour]
      cell.visitas += 1

      const resp = (l.respuestas as any) || {}
      const isCompleted =
        (resp.paso && resp.paso >= 4) ||
        resp.visionCheck_score ||
        l.estado === 'Viendo Resultados' ||
        l.estado === 'Completado' ||
        l.estado === 'Agendado' ||
        l.estado === 'Atendido'
      if (isCompleted) cell.completados += 1

      const isReserva =
        l.estado === 'Agendado' ||
        l.estado === 'Atendido' ||
        !!l.fecha_cita ||
        (l.estado_cita && l.estado_cita !== 'Nueva')
      if (isReserva) cell.reservas += 1

      if (l.estado_cita === 'Atendida') cell.llegaron += 1
    })

    // Enriquecer con pedidos/ventas por hora de creación del lead vinculado
    if (currentClient.value.has_local_crm) {
      const leadMap = new Map<string, Lead>()
      filteredLeads.forEach(l => { if (l.id) leadMap.set(String(l.id), l) })

      const pacientesFiltered = rawPacientes.value.filter(p => p.lead_id && leadMap.has(String(p.lead_id)))
      const pacienteIdToLead = new Map<string, Lead>()
      pacientesFiltered.forEach(p => {
        const lead = leadMap.get(String(p.lead_id))
        if (lead) pacienteIdToLead.set(String(p.id), lead)
      })

      rawPedidos.value
        .filter(p => p.estado_pago === 'Pagado total' && pacienteIdToLead.has(String(p.paciente_id)))
        .forEach(p => {
          const lead = pacienteIdToLead.get(String(p.paciente_id))
          if (!lead) return
          const ec = toEcuadorHour(lead.created_at || '')
          if (!ec) return
          matrix[ec.dayIndex][ec.hour].ventas += 1
        })
    }

    // Calcular tasa (% visitas→reservas) para modo calidad
    matrix.forEach(day => {
      day.forEach(cell => {
        cell.tasa = cell.visitas > 0 ? Math.round((cell.reservas / cell.visitas) * 100) : 0
      })
    })

    return matrix
  })

  const heatmapLowDataWarning = computed(() => {
    const days = selectedRangeDays.value || 365
    return days < 28
  })

  const heatmapWeekdays = WEEKDAYS

  // ---------------------------------------------------------------------------
  // Polling automático cada 2s
  let pollInterval: ReturnType<typeof setInterval>

  onMounted(() => {
    loadData()
    pollInterval = setInterval(loadData, 2000)
  })

  onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval)
  })

  return {
    clientSlug,
    currentClient,
    clientQuizzes,
    selectedRangeDays,
    dateWindows,
    kpi,
    kpiComparison,
    todoFunnel,
    quizRanking,
    dailyData,
    sources,
    heatmapData,
    heatmapLowDataWarning,
    heatmapWeekdays,
    loading,
    refreshData: loadData,
  }
}
