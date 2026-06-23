<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    size: 'md',
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="btn-press inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
    :class="{
      'px-6 py-2.5 text-sm': size === 'md',
      'px-4 py-2 text-xs': size === 'sm',
      'px-8 py-3 text-base': size === 'lg',
      'bg-brand-black text-brand-white hover:bg-brand-black/90': variant === 'primary',
      'border border-brand-black text-brand-black bg-transparent hover:bg-brand-black hover:text-brand-white':
        variant === 'secondary',
      'border border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white':
        variant === 'danger',
      'text-brand-black bg-transparent hover:bg-brand-gray': variant === 'ghost',
    }"
  >
    <slot />
  </button>
</template>
