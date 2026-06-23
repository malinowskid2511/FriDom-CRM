<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      @click.self="$emit('close')"
    >
      <div
        class="w-full max-w-lg bg-brand-white border border-brand-black shadow-xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-between border-b border-brand-black px-6 py-4">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button
            type="button"
            class="p-2 hover:bg-brand-gray min-w-11 min-h-11 flex items-center justify-center"
            aria-label="Zamknij"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>
        <div class="px-6 py-5">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
