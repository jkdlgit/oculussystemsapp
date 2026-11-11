<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden">
    <!-- Efectos de iluminación de fondo -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>

    <!-- Barra de navegación superior -->
    <header class="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
      <div class="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            👁️
          </div>
          <div>
            <span class="font-bold tracking-tight text-white text-sm">ÓPTICA JOHANNA</span>
            <span class="text-[10px] block font-mono text-cyan-400 -mt-0.5">SISTEMA OCULUS // SALUD VISUAL</span>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono">
          <span class="px-2 py-1 rounded bg-blue-950/80 border border-blue-800/60 text-cyan-300 font-semibold text-[11px]">
            ⚡ QUIZ 3 // FATIGA DIGITAL
          </span>
        </div>
      </div>

      <!-- Barra de progreso lineal si ya inició -->
      <div v-if="currentStep > 0 && currentStep <= 5" class="w-full h-1 bg-slate-800">
        <div 
          class="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500"
          :style="{ width: `${(currentStep / 5) * 100}%` }"
        ></div>
      </div>
    </header>

    <!-- Contenedor central -->
    <main class="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col justify-center relative z-10">
      
      <!-- ============================================================ -->
      <!-- PASO 0: BIENVENIDA & GANCHO PUBLICITARIO -->
      <!-- ============================================================ -->
      <div v-if="currentStep === 0" class="space-y-6 text-center animate-fade-in">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-mono">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>TEST CLÍNICO DE 1 MINUTO</span>
        </div>

        <div class="space-y-3">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            ¿Sientes tus ojos <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">cansados, secos o con ardor</span> frente a pantallas?
          </h1>
          <p class="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            Evalúa tu nivel de exposición a luz azul, detecta fatiga visual acumulada y descubre si necesitas protección visual para tu jornada.
          </p>
        </div>

        <!-- Tarjetas destacadas de beneficios -->
        <div class="grid grid-cols-3 gap-2.5 pt-2 text-left">
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span class="text-xl block mb-1">⏱️</span>
            <p class="text-xs font-bold text-slate-200">Rápido</p>
            <p class="text-[10px] text-slate-500">Solo 3 preguntas</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span class="text-xl block mb-1">🔬</span>
            <p class="text-xs font-bold text-slate-200">Preciso</p>
            <p class="text-[10px] text-slate-500">Basado en optometría</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span class="text-xl block mb-1">🎁</span>
            <p class="text-xs font-bold text-slate-200">Gratis</p>
            <p class="text-[10px] text-slate-500">Cita sin costo</p>
          </div>
        </div>

        <button
          @click="startQuiz"
          class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Comenzar Evaluación Ahora</span>
          <span class="group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <p class="text-[11px] font-mono text-slate-500">
          🔒 Evaluación confidencial avalada por Óptica Johanna
        </p>
      </div>

      <!-- ============================================================ -->
      <!-- PASO 1: HORAS FRENTE A PANTALLA & DISPOSITIVO -->
      <!-- ============================================================ -->
      <div v-else-if="currentStep === 1" class="space-y-6 animate-fade-in">
        <div>
          <span class="text-xs font-mono text-cyan-400 font-semibold uppercase">// PASO 1 DE 3</span>
          <h2 class="text-2xl font-bold text-white mt-1">¿Cuánto tiempo pasas al día frente a pantallas?</h2>
          <p class="text-xs text-slate-400 mt-1">Incluye celular, computadora, tablet y televisión.</p>
        </div>

        <div class="space-y-3">
          <button
            v-for="opt in screenHourOptions"
            :key="opt.value"
            @click="selectHours(opt.value)"
            class="w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer"
            :class="formData.hours === opt.value
              ? 'bg-blue-600/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ opt.icon }}</span>
              <div>
                <p class="text-sm font-bold text-slate-100">{{ opt.label }}</p>
                <p class="text-xs text-slate-400">{{ opt.desc }}</p>
              </div>
            </div>
            <span class="text-cyan-400 group-hover:translate-x-1 transition-transform font-bold">→</span>
          </button>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- PASO 2: SÍNTOMAS FRECUENTES -->
      <!-- ============================================================ -->
      <div v-else-if="currentStep === 2" class="space-y-6 animate-fade-in">
        <div>
          <span class="text-xs font-mono text-cyan-400 font-semibold uppercase">// PASO 2 DE 3</span>
          <h2 class="text-2xl font-bold text-white mt-1">¿Cuáles de estas molestias has sentido?</h2>
          <p class="text-xs text-slate-400 mt-1">Selecciona todas las que apliquen en tu día a día.</p>
        </div>

        <div class="space-y-2.5">
          <div
            v-for="sym in symptomOptions"
            :key="sym.id"
            @click="toggleSymptom(sym.id)"
            class="p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none"
            :class="formData.symptoms.includes(sym.id)
              ? 'bg-blue-600/20 border-cyan-400 text-white shadow-sm'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ sym.icon }}</span>
              <span class="text-xs font-semibold text-slate-200">{{ sym.label }}</span>
            </div>
            <div
              class="w-5 h-5 rounded-md border flex items-center justify-center transition-all text-xs"
              :class="formData.symptoms.includes(sym.id)
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                : 'border-slate-700 bg-slate-950'"
            >
              <span v-if="formData.symptoms.includes(sym.id)">✓</span>
            </div>
          </div>
        </div>

        <button
          @click="submitStep2"
          :disabled="formData.symptoms.length === 0"
          class="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continuar a la Prueba Visual</span>
          <span>→</span>
        </button>
      </div>

      <!-- ============================================================ -->
      <!-- PASO 3: PRUEBA INTERACTIVA DE ENFOQUE DIGITAL -->
      <!-- ============================================================ -->
      <div v-else-if="currentStep === 3" class="space-y-6 animate-fade-in">
        <div>
          <span class="text-xs font-mono text-cyan-400 font-semibold uppercase">// PASO 3 DE 3</span>
          <h2 class="text-2xl font-bold text-white mt-1">Prueba Rápida de Enfoque y Contraste</h2>
          <p class="text-xs text-slate-400 mt-1">Mira fijamente el patrón central a la distancia normal de tu pantalla.</p>
        </div>

        <!-- Cuadro interactivo de prueba visual -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center relative overflow-hidden">
          <div class="w-48 h-32 mx-auto rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center relative p-3">
            <!-- Patrón de barras alternadas de frecuencia visual -->
            <div class="grid grid-cols-8 gap-1.5 w-full h-full items-center">
              <div 
                v-for="n in 8" 
                :key="n"
                class="h-full rounded-sm"
                :class="n % 2 === 0 ? 'bg-cyan-400/90' : 'bg-slate-800'"
              ></div>
            </div>
          </div>

          <p class="text-xs text-slate-300 font-semibold mt-4">
            ¿Notas las barras nítidas o sientes vibración / cansancio al fijar la vista?
          </p>
        </div>

        <div class="space-y-2.5">
          <button
            v-for="resp in focusOptions"
            :key="resp.value"
            @click="submitStep3(resp.value)"
            class="w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 text-slate-300"
          >
            <div class="flex items-center gap-2.5">
              <span>{{ resp.icon }}</span>
              <span class="text-xs font-semibold text-slate-200">{{ resp.label }}</span>
            </div>
            <span class="text-cyan-400 group-hover:translate-x-1 transition-transform font-bold text-sm">→</span>
          </button>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- PASO 4: RESULTADO & DIAGNÓSTICO (COMPLETADO) -->
      <!-- ============================================================ -->
      <div v-else-if="currentStep === 4" class="space-y-6 animate-fade-in">
        <div class="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <span class="badge" :class="diagnosisBadgeClass">
              {{ computedDiagnosis.level }}
            </span>
            <span class="text-xs font-mono text-cyan-400">PUNTUACIÓN: {{ computedDiagnosis.score }}/100</span>
          </div>

          <div>
            <h2 class="text-xl font-bold text-white">{{ computedDiagnosis.title }}</h2>
            <p class="text-xs text-slate-300 mt-2 leading-relaxed">
              {{ computedDiagnosis.description }}
            </p>
          </div>

          <!-- Barra de nivel de fatiga -->
          <div class="space-y-1.5 pt-2">
            <div class="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Nivel de Estrés Visual:</span>
              <span class="font-bold text-slate-200">{{ computedDiagnosis.percentage }}%</span>
            </div>
            <div class="h-2 rounded-full bg-slate-950 overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-1000"
                :class="computedDiagnosis.barColor"
                :style="{ width: `${computedDiagnosis.percentage}%` }"
              ></div>
            </div>
          </div>

          <!-- Recomendación clínica -->
          <div class="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-start gap-3">
            <span class="text-xl">💡</span>
            <div>
              <p class="text-xs font-bold text-cyan-300">Recomendación de Óptica Johanna</p>
              <p class="text-xs text-slate-300 mt-0.5">
                {{ computedDiagnosis.recommendation }}
              </p>
            </div>
          </div>
        </div>

        <button
          @click="goToBooking"
          class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Agendar Examen Visual Gratuito</span>
          <span>📅</span>
        </button>
      </div>

      <!-- ============================================================ -->
      <!-- PASO 5: AGENDAMIENTO & RESERVA EN OCULUS CRM -->
      <!-- ============================================================ -->
      <div v-else-if="currentStep === 5" class="space-y-6 animate-fade-in">
        <div>
          <span class="text-xs font-mono text-emerald-400 font-semibold uppercase">// RESERVA CONFIRMADA EN SISTEMA</span>
          <h2 class="text-2xl font-bold text-white mt-1">Reserva tu cita presencial sin costo</h2>
          <p class="text-xs text-slate-400 mt-1">Completa tus datos para registrar tu cita directamente en Óptica Johanna.</p>
        </div>

        <form @submit.prevent="handleBookingSubmit" class="space-y-4">
          <!-- Nombre Completo -->
          <div>
            <label class="block text-xs font-bold font-mono text-slate-300 mb-1.5 uppercase">
              Nombre Completo *
            </label>
            <input
              v-model="bookingForm.nombre"
              type="text"
              required
              placeholder="Ej. Carlos Mendoza"
              class="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
          </div>

          <!-- Celular WhatsApp con formato Ecuador -->
          <div>
            <label class="block text-xs font-bold font-mono text-slate-300 mb-1.5 uppercase">
              Celular WhatsApp (Ecuador) *
            </label>
            <input
              v-model="bookingForm.telefono"
              type="tel"
              required
              maxlength="16"
              placeholder="Ej. 0991234567 o 08..."
              class="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
            <p class="text-[10px] text-slate-500 mt-1 font-mono">
              Te enviaremos la confirmación y recordatorio a este WhatsApp.
            </p>
          </div>

          <!-- Edad -->
          <div>
            <label class="block text-xs font-bold font-mono text-slate-300 mb-1.5 uppercase">
              Edad (opcional)
            </label>
            <input
              v-model.number="bookingForm.edad"
              type="number"
              min="5"
              max="110"
              placeholder="Ej. 32"
              class="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
          </div>

          <!-- Selección de Fecha de Cita -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold font-mono text-slate-300 mb-1.5 uppercase">
                Fecha de Cita
              </label>
              <input
                v-model="bookingForm.fecha_cita"
                type="date"
                :min="minDateString"
                class="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors font-mono cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-xs font-bold font-mono text-slate-300 mb-1.5 uppercase">
                Horario Preferido
              </label>
              <select
                v-model="bookingForm.hora_cita"
                class="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
              >
                <option value="10:00:00">10:00 AM (Mañana)</option>
                <option value="11:30:00">11:30 AM (Mañana)</option>
                <option value="15:00:00">03:00 PM (Tarde)</option>
                <option value="16:30:00">04:30 PM (Tarde)</option>
                <option value="17:30:00">05:30 PM (Tarde)</option>
              </select>
            </div>
          </div>

          <div v-if="errorMsg" class="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs font-mono">
            ⚠️ {{ errorMsg }}
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60 text-slate-950 font-extrabold text-base shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span v-if="isSubmitting" class="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></span>
            <span>Confirmar Agendamiento en Óptica</span>
            <span v-if="!isSubmitting">✓</span>
          </button>
        </form>
      </div>

      <!-- ============================================================ -->
      <!-- PASO 6: CONFIRMACIÓN EXITOSA & ACCESO OCULUS CRM -->
      <!-- ============================================================ -->
      <div v-else-if="currentStep === 6" class="space-y-6 text-center animate-fade-in">
        <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-glow-green">
          ✓
        </div>

        <div class="space-y-2">
          <span class="badge badge-green text-xs">CITA CONFIRMADA EN OCULUS</span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white">¡Gracias, {{ bookingForm.nombre }}!</h2>
          <p class="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            Tu reserva ha sido ingresada en el sistema de Óptica Johanna para el 
            <strong class="text-cyan-300">{{ bookingForm.fecha_cita }}</strong> a las 
            <strong class="text-cyan-300">{{ formatHour(bookingForm.hora_cita) }}</strong>.
          </p>
        </div>

        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs font-mono space-y-2">
          <div class="flex justify-between text-slate-400">
            <span>PACIENTE:</span>
            <span class="text-slate-100 font-bold">{{ bookingForm.nombre }}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>WHATSAPP:</span>
            <span class="text-slate-100 font-bold">{{ bookingForm.telefono }}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>DIAGNÓSTICO:</span>
            <span class="text-emerald-400 font-bold">{{ computedDiagnosis.level }}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>LEAD ID:</span>
            <span class="text-cyan-400 font-bold">#{{ leadId }}</span>
          </div>
        </div>

        <!-- Botón de Confirmación por WhatsApp -->
        <button
          @click="handleWhatsAppConfirmation"
          class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Abrir WhatsApp de Óptica Johanna</span>
          <span>💬</span>
        </button>

        <!-- Enlace Operativo para Pruebas del Cliente -->
        <div class="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
          <p class="text-[11px] font-mono text-slate-500">
            // ACCESO DIRECTO AL SISTEMA DE RECEPCIÓN / DASHBOARD
          </p>
          <div class="flex items-center justify-center gap-3">
            <RouterLink
              to="/dashboard"
              class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-bold transition-all"
            >
              Ver Cita en /dashboard Oculus →
            </RouterLink>
            <RouterLink
              to="/pulso/opticajohanna/todo"
              class="px-3.5 py-2 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-cyan-300 border border-blue-800 text-xs font-mono font-bold transition-all"
            >
              Ver en Pulso Analytics →
            </RouterLink>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer minimalista -->
    <footer class="w-full py-4 text-center text-xs font-mono text-slate-600 border-t border-slate-900">
      <span>Óptica Johanna · Oculus Health Systems © 2026</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePulsoTracker } from '@/pulso/composables/usePulsoTracker'

// 📡 Instalar el Composable Reutilizable PulsoTracker
const {
  leadId,
  isSubmitting,
  errorMsg,
  trackStep,
  trackCompleted,
  trackBooking,
  trackWhatsApp
} = usePulsoTracker({
  clientSlug: 'opticajohanna',
  quizKey: 'quiz3',
  quizName: 'Quiz 3 (Fatiga Visual y Luz Azul)'
})

const currentStep = ref(0)

const formData = reactive({
  hours: '',
  device: 'Móvil y PC',
  symptoms: [] as string[],
  focusAnswer: ''
})

// Fecha mínima hoy para agendar
const minDateString = computed(() => {
  const d = new Date()
  return d.toISOString().split('T')[0]
})

// Fecha sugerida mañana
const tomorrowString = computed(() => {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return d.toISOString().split('T')[0]
})

const bookingForm = reactive({
  nombre: '',
  telefono: '',
  edad: null as number | null,
  fecha_cita: tomorrowString.value,
  hora_cita: '15:00:00'
})

// Opciones de Horas
const screenHourOptions = [
  { value: 'bajo', label: 'Menos de 4 horas', desc: 'Uso ligero o casual', icon: '📱' },
  { value: 'medio', label: 'Entre 4 y 8 horas', desc: 'Jornada laboral típica', icon: '💻' },
  { value: 'alto', label: 'Más de 8 horas', desc: 'Uso intensivo y continuo', icon: '⚡' },
]

// Opciones de Síntomas
const symptomOptions = [
  { id: 'ardor', label: 'Ardor, picazón o sensación de arenilla', icon: '🔥' },
  { id: 'ojos_rojos', label: 'Ojos rojos o lagrimeo al final del día', icon: '🔴' },
  { id: 'dolor_cabeza', label: 'Dolor de cabeza o pesadez en la frente', icon: '⚡' },
  { id: 'borrosa', label: 'Visión borrosa al alternar de cerca a lejos', icon: '🌫️' },
  { id: 'enfoque', label: 'Dificultad para mantener el enfoque nítido', icon: '🎯' },
]

// Opciones de Prueba de Enfoque
const focusOptions = [
  { value: 'nitido', label: 'Veo las barras nítidas sin problema', icon: '✅' },
  { value: 'fatiga', label: 'Noto ligero parpadeo o me cuesta fijar', icon: '⚠️' },
  { value: 'distorsion', label: 'Veo sombras, barras borrosas o doble', icon: '🔴' },
]

// Cálculo de Diagnóstico
const computedDiagnosis = computed(() => {
  const isHigh = formData.hours === 'alto'
  const isMedium = formData.hours === 'medio'
  const count = formData.symptoms.length
  const focusFail = formData.focusAnswer === 'distorsion' || formData.focusAnswer === 'fatiga'

  if (isHigh || count >= 3 || (isMedium && focusFail)) {
    return {
      level: 'FATIGA VISUAL SEVERA',
      title: 'Estrés Acomodativo y Alta Fatiga Digital',
      score: 85,
      percentage: 85,
      barColor: 'bg-rose-500',
      description: 'Tus ojos están experimentando sobreesfuerzo muscular continuo por exposición a luz azul sin el descanso adecuado.',
      recommendation: 'Recomendamos examen visual con refracción y lunas Blue Defense antirreflejo para bloquear la fatiga.'
    }
  } else if (isMedium || count >= 1) {
    return {
      level: 'FATIGA VISUAL MODERADA',
      title: 'Cansancio Ocular en Etapa Temprana',
      score: 55,
      percentage: 55,
      barColor: 'bg-amber-400',
      description: 'Presentas signos de resequedad ocular y sobreexposición moderada frente a pantallas.',
      recommendation: 'Una evaluación preventiva evitará que la fatiga progrese a cefaleas continuas.'
    }
  } else {
    return {
      level: 'FATIGA LEVE / PREVENTIVA',
      title: 'Exposición Visual Controlada',
      score: 25,
      percentage: 25,
      barColor: 'bg-emerald-400',
      description: 'Tu sistema visual tolera la jornada actual, pero requiere pausas visuales regulares (regla 20-20-20).',
      recommendation: 'Recomendamos un chequeo anual de rutina para confirmar tu graduación exacta.'
    }
  }
})

const diagnosisBadgeClass = computed(() => {
  if (computedDiagnosis.value.score >= 70) return 'badge-rose'
  if (computedDiagnosis.value.score >= 40) return 'badge-amber'
  return 'badge-green'
})

// 1. Iniciar Quiz -> Registra Paso 1
function startQuiz() {
  currentStep.value = 1
  trackStep(1, { action: 'iniciar_quiz3' })
}

// 2. Horas de Pantalla -> Registra Paso 1 con datos
function selectHours(val: string) {
  formData.hours = val
  currentStep.value = 2
  trackStep(1, { horas_pantalla: val, dispositivo: formData.device })
}

// 3. Manejo de Síntomas
function toggleSymptom(id: string) {
  const idx = formData.symptoms.indexOf(id)
  if (idx >= 0) formData.symptoms.splice(idx, 1)
  else formData.symptoms.push(id)
}

function submitStep2() {
  currentStep.value = 3
  trackStep(2, { sintomas: formData.symptoms, total_sintomas: formData.symptoms.length })
}

// 4. Prueba de Enfoque -> Registra Paso 3 y luego Completado
function submitStep3(val: string) {
  formData.focusAnswer = val
  trackStep(3, { resultado_enfoque: val })

  // Pasar a Resultados y registrar COMPLETADO
  currentStep.value = 4
  trackCompleted({
    score: computedDiagnosis.value.score,
    diagnosis: computedDiagnosis.value.level,
    answers: {
      horas: formData.hours,
      sintomas: formData.symptoms,
      enfoque: val
    }
  })
}

// 5. Ir a Formulario de Reserva
function goToBooking() {
  currentStep.value = 5
  trackStep(4, { action: 'ver_formulario_reserva' })
}

// 6. Confirmar Reserva en Oculus CRM
async function handleBookingSubmit() {
  const res = await trackBooking({
    nombre: bookingForm.nombre,
    telefono: bookingForm.telefono,
    edad: bookingForm.edad,
    fecha_cita: bookingForm.fecha_cita,
    hora_cita: bookingForm.hora_cita,
    metadata: {
      diagnostico: computedDiagnosis.value.level,
      score: computedDiagnosis.value.score,
      horas_pantalla: formData.hours,
      sintomas: formData.symptoms
    }
  })

  if (res.success) {
    currentStep.value = 6
  }
}

// 7. Enviar WhatsApp
function handleWhatsAppConfirmation() {
  const msg = `Hola Óptica Johanna, mi nombre es ${bookingForm.nombre}. Acabo de realizar el Test de Fatiga Visual (resultado: ${computedDiagnosis.value.level}) y tengo mi cita agendada para el ${bookingForm.fecha_cita} a las ${formatHour(bookingForm.hora_cita)}. Deseo confirmar mi asistencia.`
  trackWhatsApp({ message: msg, phone: '0984381881' })
}

function formatHour(h: string) {
  if (!h) return ''
  const parts = h.split(':')
  const hour = parseInt(parts[0], 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${formattedHour}:${parts[1]} ${ampm}`
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
