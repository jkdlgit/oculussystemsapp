<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-start p-5 font-sans">
    <main class="w-full max-w-sm space-y-6">

      <!-- ENCABEZADO -->
      <div class="text-center pt-4">
        <p class="text-base font-bold text-emerald-700 uppercase tracking-wide mb-1">
          👓 Óptica Johanna · Guayaquil
        </p>
        <h1 class="text-3xl font-black text-slate-900 leading-tight">
          ¿Tienes que alejar las cosas para leerlas?
        </h1>
        <p class="text-xl text-slate-600 mt-3 leading-snug">
          Tu examen de vista es <strong class="text-emerald-700">gratis</strong>.<br>Sin filas. Sin compromiso.
        </p>
      </div>

      <!-- CUENTA REGRESIVA -->
      <div class="bg-slate-900 rounded-3xl p-5 text-center">
        <p class="text-amber-300 font-bold text-lg mb-3">⏳ Oferta termina en:</p>
        <div class="grid grid-cols-4 gap-2">
          <div class="bg-black rounded-2xl py-3">
            <span class="text-3xl font-black text-white font-mono block">{{ countdown.days }}</span>
            <span class="text-sm text-slate-400 uppercase">Días</span>
          </div>
          <div class="bg-black rounded-2xl py-3">
            <span class="text-3xl font-black text-white font-mono block">{{ countdown.hours }}</span>
            <span class="text-sm text-slate-400 uppercase">Hrs</span>
          </div>
          <div class="bg-black rounded-2xl py-3">
            <span class="text-3xl font-black text-white font-mono block">{{ countdown.minutes }}</span>
            <span class="text-sm text-slate-400 uppercase">Min</span>
          </div>
          <div class="bg-black rounded-2xl py-3">
            <span class="text-3xl font-black text-amber-400 font-mono block">{{ countdown.seconds }}</span>
            <span class="text-sm text-slate-400 uppercase">Seg</span>
          </div>
        </div>
        <p class="text-amber-200 font-bold text-base mt-3">⚠️ Solo 4 cupos gratuitos hoy</p>
      </div>

      <!-- LO QUE RECIBES GRATIS -->
      <div class="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-5 space-y-3">
        <p class="text-lg font-black text-emerald-900 text-center">Lo que recibes HOY gratis:</p>
        <div class="flex items-center justify-between border-b border-emerald-200 pb-3">
          <p class="text-lg font-bold text-slate-900">✅ Examen Computarizado</p>
          <div class="text-right">
            <span class="text-base text-slate-400 line-through block">$35</span>
            <span class="text-xl font-black text-emerald-700">$0</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-lg font-bold text-slate-900">✅ Limpieza de lentes</p>
          <div class="text-right">
            <span class="text-base text-slate-400 line-through block">$15</span>
            <span class="text-xl font-black text-emerald-700">$0</span>
          </div>
        </div>
      </div>

      <!-- BOTÓN PRINCIPAL -->
      <div class="space-y-3">
        <button
          @click="handleBookingClick('cta_principal')"
          class="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebd5a] active:scale-[0.98] text-white rounded-3xl text-xl font-black shadow-xl shadow-green-400/40 transition-all cursor-pointer border-none"
          style="min-height: 72px;"
        >
          <span class="text-3xl">💬</span> Apartar mi cita gratis
        </button>
        <p class="text-center text-base text-slate-500 font-medium">
          🔒 Sin llamadas. Coordinas por WhatsApp.
        </p>
      </div>

      <!-- TESTIMONIO -->
      <div class="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-amber-400 text-xl">⭐⭐⭐⭐⭐</span>
        </div>
        <p class="text-lg text-slate-700 leading-relaxed italic">
          "Pensé que por ser gratis me iban a presionar, pero no. Fui, me atendieron muy bien y mis lentes nuevos me cambiaron la vida."
        </p>
        <p class="text-base font-bold text-slate-900">— Carmen, 53 años · Guayaquil</p>
      </div>

      <!-- BOTÓN SECUNDARIO -->
      <div class="pb-4 text-center space-y-3">
        <button
          @click="handleBookingClick('cta_cierre')"
          class="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebd5a] active:scale-[0.98] text-white rounded-3xl text-xl font-black shadow-xl shadow-green-400/40 transition-all cursor-pointer border-none"
          style="min-height: 72px;"
        >
          <span class="text-3xl">💬</span> Apartar mi cita gratis
        </button>
        <button
          @click="handlePreciosClick"
          class="text-base text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
        >
          Consultar precios
        </button>
        <p class="text-sm text-slate-400">© {{ new Date().getFullYear() }} Óptica Johanna · Guayaquil</p>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { supabase, hasSupabaseConfig } from '@/supabase'
import { usePulsoTracker } from '@/pulso/composables/usePulsoTracker'

// ============================================================
// DATOS FÁCILES DE REEMPLAZAR
// ============================================================
const configVenta = reactive({
  whatsappNumber: '593980753069',
  ciudad: 'Guayaquil',
  diasLimite: 3,
})

// ============================================================
// TELEMETRÍA PULSO ANALYTICS
// ============================================================
const tracker = usePulsoTracker({
  clientSlug: 'opticajohanna',
  quizKey: 'quiz5',
  quizName: 'Quiz 5 · Oferta Examen Computarizado',
})

const selectedTurno = ref<'manana' | 'tarde'>('manana')
const leadId = ref<number | null>(null)

// ============================================================
// RELOJ DE CUENTA REGRESIVA
// ============================================================
const countdown = reactive({
  days: '02',
  hours: '14',
  minutes: '35',
  seconds: '50',
})

let timerInterval: ReturnType<typeof setInterval> | null = null

function initCountdown() {
  const STORAGE_KEY = 'oculus_offer_deadline_quiz5'
  let targetTime = localStorage.getItem(STORAGE_KEY)

  if (!targetTime) {
    const future = Date.now() + configVenta.diasLimite * 24 * 60 * 60 * 1000
    targetTime = future.toString()
    localStorage.setItem(STORAGE_KEY, targetTime)
  }

  const update = () => {
    const diff = parseInt(targetTime!, 10) - Date.now()
    if (diff <= 0) {
      countdown.days = '00'
      countdown.hours = '00'
      countdown.minutes = '00'
      countdown.seconds = '00'
      return
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24))
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const m = Math.floor((diff / (1000 * 60)) % 60)
    const s = Math.floor((diff / 1000) % 60)

    countdown.days = String(d).padStart(2, '0')
    countdown.hours = String(h).padStart(2, '0')
    countdown.minutes = String(m).padStart(2, '0')
    countdown.seconds = String(s).padStart(2, '0')
  }

  update()
  timerInterval = setInterval(update, 1000)
}

onMounted(async () => {
  initCountdown()

  // Inyectar o activar script de Pulso
  const scriptId = 'pulso-tracker-script'
  let script = document.getElementById(scriptId) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = scriptId
    script.src = '/tracker.js?v=0.8'
    script.setAttribute('data-client', 'opticajohanna')
    script.setAttribute('data-quiz', 'quiz5')
    script.setAttribute('data-site', 'opticajohanna/quiz5')
    script.defer = true
    document.head.appendChild(script)
  } else {
    ;(window as any).pulso?.setClientAndQuiz?.('opticajohanna', 'quiz5')
    ;(window as any).pulso?.visit?.()
  }

  ;(window as any).pulso?.step?.(1, { action: 'visita_pagina_venta_quiz5' })
  tracker.trackStep(1, { action: 'visita_pagina_venta_quiz5' })

  if (hasSupabaseConfig) {
    try {
      const res = await supabase.from('leads').insert({
        nombre: 'Visitante Página Venta',
        telefono: '',
        edad: 55,
        estado: 'Viendo Oferta',
        origen: 'quiz5',
        resultado: 'Leyendo oferta examen computarizado sin costo',
        respuestas: { etapa: 'pagina_venta', quiz: 'quiz5', client_id: 'opticajohanna' },
      }).select('id').single()
      if (res.data) leadId.value = res.data.id
    } catch (e) {}
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const whatsappUrlCita = computed(() => {
  const msg = `Hola, vi la oferta de examen visual gratis en Óptica Johanna Guayaquil y quiero apartar mi cita.`
  return `https://wa.me/${configVenta.whatsappNumber}?text=${encodeURIComponent(msg)}`
})

async function handleBookingClick(posicion: string) {
  ;(window as any).pulso?.booking?.({
    action: 'agendar_cita_quiz5',
    posicion,
    turno: selectedTurno.value,
  })

  await tracker.trackBooking({
    nombre: '',
    telefono: '',
    edad: 55,
    metadata: {
      quiz: 'quiz5',
      posicion,
      turno: selectedTurno.value,
    },
  })

  if (hasSupabaseConfig && leadId.value) {
    supabase.from('leads').update({
      estado: 'Agendado',
      estado_cita: 'Nueva',
      respuestas: { turno: selectedTurno.value, etapa: 'agendado_whatsapp', posicion, quiz: 'quiz5' },
    }).eq('id', leadId.value).then(() => {})
  }

  window.open(whatsappUrlCita.value, '_blank')
}

function handlePreciosClick() {
  ;(window as any).pulso?.track?.('click_consultar_precios', { quiz: 'quiz5' })
  const msg = 'Hola, me gustaría consultar la lista de precios de lentes y armazones en Óptica Johanna.'
  const url = `https://wa.me/${configVenta.whatsappNumber}?text=${encodeURIComponent(msg)}`
  window.open(url, '_blank')
}
</script>
