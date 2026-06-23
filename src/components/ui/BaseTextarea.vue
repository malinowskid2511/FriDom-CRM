<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  rows?: number
  id?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-medium">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows ?? 4"
      class="w-full border border-brand-black bg-brand-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-black resize-y"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>
