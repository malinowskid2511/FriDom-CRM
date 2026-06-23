<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  id?: string
  required?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-600">*</span>
    </label>
    <select
      :id="id"
      :value="modelValue"
      :required="required"
      class="w-full border border-brand-black bg-brand-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-black min-h-11"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <slot />
    </select>
  </div>
</template>
