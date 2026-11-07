<template>
  <div>
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800 mb-2">Reserva tu cita gratuita</h2>
      <p class="text-slate-500 text-sm">Déjanos tus datos para agendar tu evaluación presencial sin costo.</p>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Nombre Completo *</label>
        <input 
          v-model="form.nombre" 
          type="text" 
          required 
          placeholder="Ej. Juan Pérez"
          class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
        <p v-if="errors.nombre" class="text-red-500 text-xs mt-1">{{ errors.nombre }}</p>
      </div>
      
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Teléfono (WhatsApp) *</label>
        <input 
          v-model="form.telefono" 
          type="tel" 
          required 
          placeholder="Ej. 0991234567 o 08..."
          maxlength="16"
          class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
        <p v-if="errors.telefono" class="text-red-500 text-xs mt-1">{{ errors.telefono }}</p>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Edad</label>
        <input 
          v-model.number="form.edad" 
          type="number" 
          min="1" 
          max="120"
          placeholder="Ej. 35"
          class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
      </div>

      <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
        {{ errorMsg }}
      </div>

      <button 
        type="submit" 
        :disabled="isSubmitting"
        class="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 mt-6 flex items-center justify-center gap-2 disabled:opacity-70"
      >
        <span v-if="isSubmitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        <span>Confirmar Agendamiento</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { supabase, hasSupabaseConfig } from '@/supabase'

const props = defineProps<{
  leadId: number | null
  score: string
}>()

const emit = defineEmits<{
  submit: [data: { nombre: string; telefono: string; edad: number }]
}>()

const form = reactive({
  nombre: '',
  telefono: '',
  edad: null as number | null
})

const errors = reactive({
  nombre: '',
  telefono: '',
})

const isSubmitting = ref(false)
const errorMsg = ref('')

function normalizeEcuadorianPhone(raw: string): { isValid: boolean; normalized: string; error?: string } {
  if (!raw || !raw.trim()) {
    return { isValid: false, normalized: '', error: 'El teléfono es obligatorio.' }
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

async function submitForm() {
  errors.nombre = ''
  errors.telefono = ''
  errorMsg.value = ''

  if (!form.nombre || form.nombre.trim().length < 2) {
    errors.nombre = 'Por favor ingresa tu nombre completo.'
    return
  }

  const phoneRes = normalizeEcuadorianPhone(form.telefono)
  if (!phoneRes.isValid) {
    errors.telefono = phoneRes.error || 'Ingresa un celular válido de Ecuador.'
    return
  }

  form.telefono = phoneRes.normalized
  isSubmitting.value = true

  const finalData = {
    nombre: form.nombre.trim(),
    telefono: phoneRes.normalized,
    edad: form.edad || 0
  }

  if (hasSupabaseConfig && props.leadId) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          nombre: finalData.nombre,
          telefono: finalData.telefono,
          edad: finalData.edad,
          estado: 'Agendado',
          estado_cita: 'Nueva',
          resultado: 'Agudeza visual estimada: ' + props.score,
          respuestas: { visionCheck_score: props.score, etapa: 'agendado', paso: 4 }
        })
        .eq('id', props.leadId)

      if (error) throw error
    } catch (err: any) {
      console.error('Error actualizando lead:', err)
      errorMsg.value = 'Hubo un error al guardar. Por favor intenta de nuevo.'
      isSubmitting.value = false
      return
    }
  }

  isSubmitting.value = false
  emit('submit', finalData)
}
</script>
