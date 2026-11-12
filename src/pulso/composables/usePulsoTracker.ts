import { ref, reactive, onMounted } from 'vue'
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
 * 📡 Composable / SDK Universal de Telemetría para Pulso Analytics
 * Conecta cualquier Quiz o Landing Page al sistema de analítica y CRM en 3 líneas de código.
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

      // 2. Sincronizar contexto con window.pulso
      const p = getPulso()
      if (p && typeof p.setClientAndQuiz === 'function') {
        p.setClientAndQuiz(clientSlug.value, quizKey.value)
        sessionId.value = p.sessionId || ''
      }
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
            dispositivo: typeof navigator !== 'undefined' && /Mobile|Android|iP(hone|od)/.test(navigator.userAgent) ? 'móvil' : 'desktop'
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

  // ---------------------------------------------------------------------------
  // MÉTODOS DE TELEMETRÍA ESTANDARIZADOS
  // ---------------------------------------------------------------------------

  /**
   * 1️⃣ Marcar avance de paso (Paso 1, 2, 3...)
   */
  async function trackStep(stepNumber: number, stepData: Record<string, any> = {}) {
    getPulso()?.step(stepNumber, stepData)

    if (hasSupabaseConfig && leadId.value) {
      try {
        const { error } = await supabase
          .from('leads')
          .update({
            estado: `Paso ${stepNumber}`,
            respuestas: {
              ...stepData,
              etapa: `paso_${stepNumber}`,
              paso: stepNumber,
              quiz: quizKey.value
            }
          })
          .eq('id', leadId.value)

        if (!error) {
          console.log(`📡 [PULSO TRACKER] Paso ${stepNumber} guardado para lead ${leadId.value}`)
        }
      } catch (err) {
        console.warn(`[PULSO TRACKER] Error actualizando paso ${stepNumber}:`, err)
      }
    }
  }

  /**
   * 2️⃣ Marcar quiz completado (usuario ve resultados / diagnóstico)
   */
  async function trackCompleted(payload: CompletedPayload) {
    getPulso()?.completed(payload)

    if (hasSupabaseConfig && leadId.value) {
      try {
        const { error } = await supabase
          .from('leads')
          .update({
            estado: 'Viendo Resultados',
            resultado: payload.diagnosis || 'Test completado exitosamente',
            respuestas: {
              ...(payload.answers || {}),
              score: payload.score,
              etapa: 'completado',
              paso: 4,
              quiz: quizKey.value
            }
          })
          .eq('id', leadId.value)

        if (!error) {
          console.log(`📡 [PULSO TRACKER] Test completado guardado para lead ${leadId.value}`)
        }
      } catch (err) {
        console.warn('[PULSO TRACKER] Error guardando completado:', err)
      }
    }
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

    // Disparar telemetría
    getPulso()?.booking({
      nombre: cleanName,
      telefono: cleanPhone,
      fecha_cita: booking.fecha_cita,
      hora_cita: booking.hora_cita,
      action: 'reserva_confirmada'
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
        }

        if (booking.metadata) {
          updatePayload.respuestas = {
            ...booking.metadata,
            etapa: 'agendado',
            paso: 5,
            sucursal: booking.sucursal || 'Matriz',
            quiz: quizKey.value
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
            respuestas: {
              ...(updatePayload.respuestas || {}),
              client: clientSlug.value,
              client_id: clientSlug.value,
            }
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

    const targetPhone = (opts.phone || '593984381881').replace(/\D/g, '')
    const formattedPhone = targetPhone.startsWith('0') ? '593' + targetPhone.slice(1) : targetPhone
    const textMsg = encodeURIComponent(
      opts.message || `Hola, completé el ${quizName.value} y deseo confirmar mi evaluación visual gratuita.`
    )
    const waUrl = `https://wa.me/${formattedPhone}?text=${textMsg}`

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank')
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
