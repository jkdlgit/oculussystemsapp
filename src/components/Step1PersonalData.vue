<template>
  <div>
    <h2 class="text-2xl font-bold text-brand-dark mb-2">Datos personales</h2>
    <p class="text-slate-500 mb-8">Usaremos estos datos para contactarte y agendar tu cita.</p>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Nombre -->
      <div>
        <label for="nombre" class="block text-sm font-semibold text-brand-dark mb-2">Nombre completo</label>
        <input
          id="nombre"
          v-model="localNombre"
          type="text"
          class="input-field"
          placeholder="Ej. María Pérez"
          required
        />
        <p v-if="errors.nombre" class="text-red-500 text-sm mt-1">{{ errors.nombre }}</p>
      </div>

      <!-- Teléfono -->
      <div>
        <label for="telefono" class="block text-sm font-semibold text-brand-dark mb-2">Teléfono (WhatsApp)</label>
        <input
          id="telefono"
          v-model="localTelefono"
          type="tel"
          class="input-field"
          placeholder="Ej. 0991234567"
          maxlength="10"
          required
        />
        <p v-if="errors.telefono" class="text-red-500 text-sm mt-1">{{ errors.telefono }}</p>
      </div>

      <!-- Edad -->
      <div>
        <label for="edad" class="block text-sm font-semibold text-brand-dark mb-2">Edad</label>
        <input
          id="edad"
          v-model.number="localEdad"
          type="number"
          class="input-field"
          placeholder="Ej. 35"
          min="1"
          max="120"
          required
        />
        <p v-if="errors.edad" class="text-red-500 text-sm mt-1">{{ errors.edad }}</p>
      </div>

      <button type="submit" class="btn-primary mt-4">
        Continuar →
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const props = defineProps<{
  nombre: string
  telefono: string
  edad: number | null
}>()

const emit = defineEmits<{
  next: [data: { nombre: string; telefono: string; edad: number }]
}>()

const localNombre = ref(props.nombre)
const localTelefono = ref(props.telefono)
const localEdad = ref<number | null>(props.edad)

const errors = reactive({
  nombre: '',
  telefono: '',
  edad: '',
})

function validate(): boolean {
  let valid = true
  errors.nombre = ''
  errors.telefono = ''
  errors.edad = ''

  if (!localNombre.value || localNombre.value.trim().length < 2) {
    errors.nombre = 'Ingresa tu nombre completo (mínimo 2 caracteres).'
    valid = false
  }

  const phoneRegex = /^09\d{8}$/
  if (!phoneRegex.test(localTelefono.value)) {
    errors.telefono = 'Ingresa un número válido de Ecuador (Ej. 0991234567).'
    valid = false
  }

  if (!localEdad.value || localEdad.value < 1 || localEdad.value > 120) {
    errors.edad = 'Ingresa una edad válida (entre 1 y 120).'
    valid = false
  }

  return valid
}

function handleSubmit() {
  if (validate()) {
    emit('next', {
      nombre: localNombre.value.trim(),
      telefono: localTelefono.value,
      edad: localEdad.value!,
    })
  }
}
</script>
