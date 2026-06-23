<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: File | null
    accept?: string
    hint?: string
    validate?: (file: File) => string | null
  }>(),
  {
    accept: '*/*',
    hint: 'Maks. 10 MB',
  },
)

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const dragOver = ref(false)
const error = ref<string | null>(null)

function validateAndSet(file: File) {
  error.value = props.validate?.(file) ?? null
  if (error.value) return
  emit('update:modelValue', file)
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) validateAndSet(file)
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) validateAndSet(file)
}

function clear() {
  error.value = null
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <div
      class="border-2 border-dashed p-6 text-center transition-colors cursor-pointer min-h-[120px] flex flex-col items-center justify-center"
      :class="dragOver ? 'border-brand-black bg-brand-gray' : 'border-brand-black/40'"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
      @click="($refs.fileInput as HTMLInputElement).click()"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        class="hidden"
        @change="onFileChange"
      />
      <p v-if="modelValue" class="text-sm font-medium">{{ modelValue.name }}</p>
      <template v-else>
        <p class="text-sm font-medium">Przeciągnij plik lub kliknij, aby wybrać</p>
        <p class="text-xs text-brand-black/60 mt-1">{{ hint }}</p>
      </template>
    </div>
    <button
      v-if="modelValue"
      type="button"
      class="mt-2 text-xs underline text-brand-black/70"
      @click.stop="clear"
    >
      Usuń plik
    </button>
    <p v-if="error" class="mt-2 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
