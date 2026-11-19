import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase, hasSupabaseConfig } from '@/supabase'

export interface UsePulsoTrackerOptions {
  clientSlug?: string
  quizKey: string
  quizName?: string
  sessionKeyPrefix?: string
}

export interface BookingPayload {
  nombre: string
  telefono: string
  edad?: number | null
  fecha_cita?: string | null
  hora_cita?: string | null
  sucursal?: string
  metadata?: Record<string, any>
}

export interface CompletedPayload {
  score?: string | number
  diagnosis?: string
  answers?: Record<string, any>
}

export interface PulsoTelemetryEvent {
  ts: string
  type: string
  page: string
  label: string
  x: number
  y: number
  step?: number
  answer?: string
  metadata?: Record<string, any>
}

let broadcastChannel: BroadcastChannel | null = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('pulso_analytics_channel')
  } catch (e) { /* noop */ }
}

function broadcastEvent(event: any, session?: any, visitor?: any) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'PULSO_EVENT',
        payload: { event, session, visitor }
      })
    } catch (e) {}
  }
}

// Helper para acceso seguro a window.pulso
function getPulso() {
  if (typeof window !== 'undefined' && (window as any).pulso) {
    return (window as any).pulso
  }
  return null
}

/**
 * 📱 Normalizador y Validador flexible de celulares de Ecuador
 * Admite: 09XXXXXXXX, 08XXXXXXXX, 5939XXXXXXXX, 5938XXXXXXXX, formato internacional +593
 */
export function normalizeEcuadorianPhone(raw: string): { isValid: boolean; normalized: string; error?: string } {
  if (!raw || !raw.trim()) {
    return { isValid: false, normalized: '', error: 'El teléfono celular es obligatorio.' }
  }

  const clean = raw.trim()
  const digits = clean.replace(/\D/g, '')

  let phone = ''

  if (digits.startsWith('593')) {
    const after593 = digits.slice(3)
    if (after593.length === 9) {
      phone = '0' + after593
    } else if (after593.length === 10 && after593.startsWith('0')) {
      phone = after593
    }
  } else if (digits.length === 9 && (digits.startsWith('8') || digits.startsWith('9'))) {
    phone = '0' + digits
  } else if (digits.length === 10 && (digits.startsWith('08') || digits.startsWith('09'))) {
    phone = digits
  } else if (digits.length === 10 && digits.startsWith('0')) {
    phone = digits
  }

  if (phone && /^0[89]\d{8}$/.test(phone)) {
    return { isValid: true, normalized: phone }
  }

  if (phone && /^0\d{9}$/.test(phone)) {
    return { isValid: true, normalized: phone }
  }

  return {
    isValid: false,
    normalized: raw,
    error: 'Ingresa un número celular válido de Ecuador de 10 dígitos (Ej. 09... o 08...).',
  }
}

/**
 * 📡 Composable / SDK Universal de Telemetría para Pulso Analytics & Oculus CRM
 * Graba con fidelidad matemática:
 * - Clics y coordenadas exactas (x%, y%)
 * - Avances de pasos y respuestas clínicas acumuladas
 * - Profundidad de scroll
 * - Tiempos entre acciones
 * - Diagnóstico y citas agendadas
 */
export function usePulsoTracker(options: UsePulsoTrackerOptions) {
  let route: any = null
  try {
    route = useRoute()
  } catch (e) {
    // Si se ejecuta fuera de Vue Router
  }

  // Resolver Client y Quiz
  const clientSlug = ref(
    options.clientSlug ||
    (route?.params?.clientSlug as string) ||
    'opticajohanna'
  )
  const quizKey = ref(options.quizKey)
  const quizName = ref(options.quizName || options.quizKey)

  const leadId = ref<number | null>(null)
  const sessionId = ref<string>('')
  const isSubmitting = ref(false)
  const errorMsg = ref('')

  // Respuestas clínicas acumuladas (para no sobrescribir entre pasos)
  const accumulatedAnswers = reactive<Record<string, any>>({})

  // Buffer de eventos atómicos reales para Replay exacto
  const eventsBuffer: PulsoTelemetryEvent[] = []

  // Control de scroll alcanzado
  const scrollMilestones = new Set<number>()

  // Capturar parámetros de URL para pauta publicitaria
  const utmParams = reactive({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: ''
  })
  const owner = ref('publicidad')

  // Clave única de sesión en la pestaña para evitar duplicar visitas si recargan
  const sessionVisitKey = `${options.sessionKeyPrefix || '_pulso_visit_'}${clientSlug.value}_${quizKey.value}`
  const eventsStorageKey = `_pulso_events_${clientSlug.value}_${quizKey.value}`
  const answersStorageKey = `_pulso_ans_${clientSlug.value}_${quizKey.value}`

  function saveLocalState() {
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(eventsStorageKey, JSON.stringify(eventsBuffer.slice(-50)))
        sessionStorage.setItem(answersStorageKey, JSON.stringify(accumulatedAnswers))
      } catch (e) {}
    }
  }

  function pushEvent(event: PulsoTelemetryEvent) {
    eventsBuffer.push(event)
    saveLocalState()
  }

  // Sincronizar buffer de eventos a Supabase de forma segura
  async function flushEventsToSupabase(extraState?: { estado?: string; resultado?: string }) {
    if (!hasSupabaseConfig || !leadId.value) return
    try {
      const payload: Record<string, any> = {
        respuestas: {
          ...accumulatedAnswers,
          quiz: quizKey.value,
          client: clientSlug.value,
          client_id: clientSlug.value,
          events: eventsBuffer.slice(-50)
        }
      }
      if (extraState?.estado) payload.estado = extraState.estado
      if (extraState?.resultado) payload.resultado = extraState.resultado

      await supabase.from('leads').update(payload).eq('id', leadId.value)
    } catch (err) {
      console.warn('📡 [PULSO TRACKER] Error sincronizando telemetría:', err)
    }
  }

  // Listener global de clics para capturar cualquier interacción del usuario
  function handleDocumentClick(ev: MouseEvent) {
    if (typeof window === 'undefined') return
    const target = ev.target as HTMLElement | null
    if (!target) return

    const x = Math.round((ev.clientX / window.innerWidth) * 100)
    const y = Math.round((ev.clientY / window.innerHeight) * 100)

    let rawLabel = (target.innerText || target.getAttribute('aria-label') || target.tagName || '').trim()
    if (rawLabel.length > 50) rawLabel = rawLabel.substring(0, 47) + '...'
    if (!rawLabel) rawLabel = 'Interacción en pantalla'

    pushEvent({
      ts: new Date().toISOString(),
      type: 'click',
      page: window.location.pathname || `/${quizKey.value}`,
      label: rawLabel,
      x,
      y
    })
  }

  // Listener de scroll para registrar lectura
  let scrollTimeout: any = null
  function handleDocumentScroll() {
    if (typeof window === 'undefined') return
    if (scrollTimeout) return
    scrollTimeout = setTimeout(() => {
      scrollTimeout = null
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const scrollPct = Math.round((window.scrollY / docHeight) * 100)

      for (const mark of [25, 50, 75, 90]) {
        if (scrollPct >= mark && !scrollMilestones.has(mark)) {
          scrollMilestones.add(mark)
          pushEvent({
            ts: new Date().toISOString(),
            type: 'scroll',
            page: window.location.pathname || `/${quizKey.value}`,
            label: `Scroll ${mark}% de página`,
            x: 50,
            y: Math.min(95, mark),
            metadata: { scroll: mark }
          })
        }
      }
    }, 400)
  }

  // Listener de salida o cambio de visibilidad para guardar telemetría final
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      flushEventsToSupabase()
    }
  }

  onMounted(async () => {
    // 1. Extraer UTMs de la URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      utmParams.source = urlParams.get('utm_source') || ''
      utmParams.medium = urlParams.get('utm_medium') || ''
      utmParams.campaign = urlParams.get('utm_campaign') || ''
      utmParams.term = urlParams.get('utm_term') || ''
      utmParams.content = urlParams.get('utm_content') || ''

      const ownerParam = urlParams.get('owner')
      if (ownerParam === 'especialista') {
        owner.value = 'especialista'
      }

      // Sincronizar contexto con window.pulso
      const p = getPulso()
      if (p && typeof p.setClientAndQuiz === 'function') {
        p.setClientAndQuiz(clientSlug.value, quizKey.value)
        sessionId.value = p.sessionId || ''
      }

      // Restaurar respuestas y eventos locales si la página recargó
      try {
        const savedAns = sessionStorage.getItem(answersStorageKey)
        if (savedAns) Object.assign(accumulatedAnswers, JSON.parse(savedAns))
        const savedEvents = sessionStorage.getItem(eventsStorageKey)
        if (savedEvents) {
          const list = JSON.parse(savedEvents)
          if (Array.isArray(list)) eventsBuffer.push(...list)
        }
      } catch (e) {}

      // Escuchar clics, scrolls y visibilidad
      document.addEventListener('click', handleDocumentClick, { passive: true })
      window.addEventListener('scroll', handleDocumentScroll, { passive: true })
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // 2. Registrar evento de Visita inicial si el buffer está vacío
    if (eventsBuffer.length === 0) {
      pushEvent({
        ts: new Date().toISOString(),
        type: 'visita',
        page: typeof window !== 'undefined' ? (window.location.pathname || `/${quizKey.value}`) : `/${quizKey.value}`,
        label: `Ingreso a ${quizName.value}`,
        x: 50,
        y: 15,
        metadata: {
          device: typeof navigator !== 'undefined' && /Mobile|Android|iP(hone|od)/.test(navigator.userAgent) ? 'móvil' : 'desktop',
          source: utmParams.source || 'directo'
        }
      })
    }

    // 3. Revisar si la visita ya fue registrada en esta pestaña
    const cachedLeadId = sessionStorage.getItem(sessionVisitKey)
    if (cachedLeadId) {
      leadId.value = Number(cachedLeadId)
      return
    }

    // 4. Registrar visita inmediata en Supabase (leads)
    if (hasSupabaseConfig && !leadId.value) {
      try {
        const siteOrigin = `${clientSlug.value}_${quizKey.value}`
        const payload = {
          nombre: 'Visita Anónima',
          telefono: 'Sin registrar',
          edad: 0,
          origen: siteOrigin,
          utm_source: utmParams.source || null,
          utm_medium: utmParams.medium || null,
          utm_campaign: utmParams.campaign || null,
          owner: owner.value,
          estado: 'Visita',
          respuestas: {
            quiz: quizKey.value,
            client: clientSlug.value,
            client_id: clientSlug.value,
            city: typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('city') || new URLSearchParams(window.location.search).get('ciudad') || 'Guayaquil') : 'Guayaquil',
            dispositivo: typeof navigator !== 'undefined' && /Mobile|Android|iP(hone|od)/.test(navigator.userAgent) ? 'móvil' : 'desktop',
            events: eventsBuffer.slice(-20)
          }
        }

        const { data, error } = await supabase
          .from('leads')
          .insert(payload)
          .select('id')
          .single()

        if (!error && data) {
          leadId.value = data.id
          sessionStorage.setItem(sessionVisitKey, String(data.id))
          console.log(`📡 [PULSO TRACKER] Visita registrada en Supabase [${clientSlug.value}/${quizKey.value}] — Lead ID:`, data.id)
        }
      } catch (err) {
        console.warn('📡 [PULSO TRACKER] Error registrando visita inicial:', err)
      }
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      document.removeEventListener('click', handleDocumentClick)
      window.removeEventListener('scroll', handleDocumentScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })

  // ---------------------------------------------------------------------------
  // MÉTODOS DE TELEMETRÍA ESTANDARIZADOS
  // ---------------------------------------------------------------------------

  /**
   * 1️⃣ Marcar avance de paso (Paso 1, 2, 3...)
   */
  async function trackStep(stepNumber: number, stepData: Record<string, any> = {}, clickEvent?: MouseEvent) {
    getPulso()?.step(stepNumber, stepData)

    Object.assign(accumulatedAnswers, stepData)

    const coords = clickEvent ? {
      x: Math.round((clickEvent.clientX / window.innerWidth) * 100),
      y: Math.round((clickEvent.clientY / window.innerHeight) * 100),
    } : { x: 50, y: 50 }

    const questionKey = Object.keys(stepData)[0] || `step_${stepNumber}`
    const answerVal = String(stepData[questionKey] || '')

    pushEvent({
      ts: new Date().toISOString(),
      type: 'quiz_step',
      page: typeof window !== 'undefined' ? (window.location.pathname || `/${quizKey.value}`) : `/${quizKey.value}`,
      label: `Paso ${stepNumber}: ${answerVal || questionKey}`,
      x: coords.x,
      y: coords.y,
      step: stepNumber,
      answer: answerVal,
      metadata: { step: stepNumber, ...stepData, ...coords }
    })

    broadcastEvent({
      id: Date.now(),
      business_id: 'optica',
      session_id: sessionId.value,
      visitor_id: `v_${clientSlug.value}`,
      ts: new Date().toISOString(),
      type: 'quiz_step',
      page: `/${quizKey.value}`,
      label: `Paso ${stepNumber}: ${answerVal || questionKey}`,
      metadata: { step: stepNumber, ...stepData, ...coords },
    }, {
      id: sessionId.value,
      clicks: eventsBuffer.length,
      scroll_avg: Math.min(100, 30 + stepNumber * 20),
    })

    await flushEventsToSupabase({ estado: `Paso ${stepNumber}` })
  }

  /**
   * 2️⃣ Marcar quiz completado (usuario ve resultados / diagnóstico)
   */
  async function trackCompleted(payload: CompletedPayload) {
    getPulso()?.completed(payload)

    if (payload.answers) {
      Object.assign(accumulatedAnswers, payload.answers)
    }

    pushEvent({
      ts: new Date().toISOString(),
      type: 'quiz_complete',
      page: '/resultado',
      label: `Diagnóstico: ${payload.diagnosis || 'Completado'}`,
      x: 50,
      y: 45,
      step: 4,
      metadata: { score: payload.score, diagnosis: payload.diagnosis }
    })

    broadcastEvent({
      id: Date.now(),
      business_id: 'optica',
      session_id: sessionId.value,
      visitor_id: `v_${clientSlug.value}`,
      ts: new Date().toISOString(),
      type: 'quiz_complete',
      page: '/resultado',
      label: `Diagnóstico: ${payload.diagnosis || 'Completado'}`,
      metadata: { score: payload.score, diagnosis: payload.diagnosis },
    }, {
      id: sessionId.value,
      quiz_completed: true,
      form_started: true,
    })

    await flushEventsToSupabase({
      estado: 'Viendo Resultados',
      resultado: payload.diagnosis || 'Test completado exitosamente'
    })
  }

  /**
   * 3️⃣ Marcar reserva / agendamiento (deposita directamente en el sistema Oculus)
   */
  async function trackBooking(booking: BookingPayload): Promise<{ success: boolean; leadId: number | null; error?: string }> {
    isSubmitting.value = true
    errorMsg.value = ''

    // Validar nombre
    if (!booking.nombre || booking.nombre.trim().length < 2) {
      isSubmitting.value = false
      errorMsg.value = 'Por favor ingresa tu nombre completo.'
      return { success: false, leadId: leadId.value, error: errorMsg.value }
    }

    // Validar y normalizar celular
    const phoneRes = normalizeEcuadorianPhone(booking.telefono)
    if (!phoneRes.isValid) {
      isSubmitting.value = false
      errorMsg.value = phoneRes.error || 'Ingresa un número celular válido de Ecuador.'
      return { success: false, leadId: leadId.value, error: errorMsg.value }
    }

    const cleanName = booking.nombre.trim()
    const cleanPhone = phoneRes.normalized
    const cleanAge = booking.edad ? Number(booking.edad) : 0

    if (booking.metadata) {
      Object.assign(accumulatedAnswers, booking.metadata)
    }

    pushEvent({
      ts: new Date().toISOString(),
      type: 'booking',
      page: '/agendar',
      label: `Cita Agendada: ${cleanName}`,
      x: 50,
      y: 80,
      metadata: { fecha: booking.fecha_cita, hora: booking.hora_cita, sucursal: booking.sucursal }
    })

    // Disparar telemetría
    getPulso()?.booking({
      nombre: cleanName,
      telefono: cleanPhone,
      fecha_cita: booking.fecha_cita,
      hora_cita: booking.hora_cita,
      action: 'reserva_confirmada'
    })

    broadcastEvent({
      id: Date.now(),
      business_id: 'optica',
      session_id: sessionId.value,
      visitor_id: `v_${clientSlug.value}`,
      ts: new Date().toISOString(),
      type: 'booking',
      page: '/agendar',
      label: `Cita Agendada: ${cleanName}`,
      metadata: { fecha: booking.fecha_cita, hora: booking.hora_cita, sucursal: booking.sucursal },
    }, {
      id: sessionId.value,
      booked: true,
      form_submitted: true,
      lead_captured: true,
    })

    if (hasSupabaseConfig) {
      try {
        const updatePayload: Record<string, any> = {
          nombre: cleanName,
          telefono: cleanPhone,
          edad: cleanAge,
          estado: 'Agendado',
          estado_cita: 'Nueva',
          fecha_cita: booking.fecha_cita || null,
          hora_cita: booking.hora_cita || null,
          respuestas: {
            ...accumulatedAnswers,
            client: clientSlug.value,
            client_id: clientSlug.value,
            sucursal: booking.sucursal || 'Matriz Guayaquil',
            quiz: quizKey.value,
            events: eventsBuffer.slice(-50)
          }
        }

        if (leadId.value) {
          const { error } = await supabase
            .from('leads')
            .update(updatePayload)
            .eq('id', leadId.value)

          if (error) throw error
        } else {
          // Si no había lead previo, insertar uno nuevo
          const insertPayload = {
            ...updatePayload,
            origen: `${clientSlug.value}_${quizKey.value}`,
            utm_source: utmParams.source || null,
            utm_medium: utmParams.medium || null,
            utm_campaign: utmParams.campaign || null,
            owner: owner.value,
          }
          const { data: newLead, error } = await supabase
            .from('leads')
            .insert(insertPayload)
            .select('id')
            .single()

          if (error) throw error
          if (newLead) {
            leadId.value = newLead.id
            sessionStorage.setItem(sessionVisitKey, String(newLead.id))
          }
        }

        console.log(`📡 [PULSO TRACKER] Cita agendada con éxito en Oculus CRM. Lead ID: ${leadId.value}`)
        isSubmitting.value = false
        return { success: true, leadId: leadId.value }
      } catch (err: any) {
        console.error('[PULSO TRACKER] Error guardando reserva en CRM:', err)
        isSubmitting.value = false
        errorMsg.value = 'Hubo un error al guardar la reserva. Por favor intenta de nuevo.'
        return { success: false, leadId: leadId.value, error: errorMsg.value }
      }
    }

    isSubmitting.value = false
    return { success: true, leadId: leadId.value }
  }

  /**
   * 4️⃣ Disparar telemetría y redirección de WhatsApp
   */
  function trackWhatsApp(opts: { phone?: string; message?: string } = {}) {
    getPulso()?.booking({
      action: 'whatsapp_confirmacion',
      phone: opts.phone || '0984381881'
    })

    pushEvent({
      ts: new Date().toISOString(),
      type: 'booking',
      page: '/whatsapp',
      label: 'Contacto WhatsApp iniciado',
      x: 50,
      y: 85,
      metadata: { action: 'whatsapp_redirect' }
    })

    flushEventsToSupabase()

    const targetPhone = (opts.phone || '593984381881').replace(/\D/g, '')
    const formattedPhone = targetPhone.startsWith('0') ? '593' + targetPhone.slice(1) : targetPhone
    const textMsg = encodeURIComponent(
      opts.message || `Hola, completé el ${quizName.value} y deseo confirmar mi evaluación visual gratuita.`
    )
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/${formattedPhone}?text=${textMsg}`, '_blank')
    }
  }

  return {
    clientSlug,
    quizKey,
    quizName,
    leadId,
    sessionId,
    isSubmitting,
    errorMsg,
    utmParams,
    owner,
    trackStep,
    trackCompleted,
    trackBooking,
    trackWhatsApp,
    normalizePhone: normalizeEcuadorianPhone
  }
}
