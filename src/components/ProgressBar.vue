<template>
  <div class="w-full mb-8">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-semibold text-brand-dark">Paso {{ current }} de {{ total }}</span>
      <span class="text-sm font-semibold text-brand-teal">{{ percentage }}%</span>
    </div>
    <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full bg-gradient-to-r from-blue-500 to-brand-light transition-all duration-700 ease-out"
        :style="{ width: percentage + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  total: number
}>()

const percentage = computed(() => Math.round((props.current / props.total) * 100))
</script>
