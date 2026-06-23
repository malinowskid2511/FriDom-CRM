<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  id?: string
  error?: string
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
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      class="w-full border border-brand-black bg-brand-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-black min-h-11"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </div>
</template>
