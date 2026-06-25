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
      </div>
      
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Teléfono (WhatsApp) *</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+593</span>
          <input 
            v-model="form.telefono" 
            type="tel" 
            required 
            placeholder="987654321"
            class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-16 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Edad</label>
        <input 
          v-model.number="form.edad" 
          type="number" 
          min="5" 
          max="100"
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

const emit = defineEmits(['submit'])

const form = reactive({
  nombre: '',
  telefono: '',
  edad: null as number | null
})

const isSubmitting = ref(false)
const errorMsg = ref('')

async function submitForm() {
  if (!form.nombre || !form.telefono) {
    errorMsg.value = 'Por favor completa los campos requeridos.'
    return
  }

  isSubmitting.value = true
  errorMsg.value = ''

  if (hasSupabaseConfig && props.leadId) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          nombre: form.nombre,
          telefono: form.telefono,
          edad: form.edad,
          estado: 'Agendado',
          estado_cita: 'Nueva',
          respuestas: { visionCheck_score: props.score }
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
  emit('submit')
}
</script>
