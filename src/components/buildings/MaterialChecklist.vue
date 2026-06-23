<script setup lang="ts">
import { ref } from 'vue'
import type { ChecklistItem } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps<{
  items: ChecklistItem[]
  buildingId: string
  loading?: boolean
}>()

const emit = defineEmits<{
  toggle: [item: ChecklistItem]
  add: [title: string]
}>()

const newTitle = ref('')
const adding = ref(false)

function itemsForBuilding() {
  return props.items.filter((item) => item.building_id === props.buildingId)
}

function doneCount() {
  const list = itemsForBuilding()
  return list.filter((item) => item.is_done).length
}

function handleAdd() {
  const title = newTitle.value.trim()
  if (!title) return
  adding.value = true
  emit('add', title)
  newTitle.value = ''
  adding.value = false
}
</script>

<template>
  <div class="border-t border-brand-black/20 bg-brand-gray/30 px-4 py-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
      <div>
        <p class="text-sm font-medium">Checklista materiałów od klienta</p>
        <p v-if="itemsForBuilding().length > 0" class="text-xs text-brand-black/60 mt-0.5">
          Dostarczone: {{ doneCount() }} / {{ itemsForBuilding().length }}
        </p>
      </div>
    </div>

    <p v-if="loading" class="text-sm text-brand-black/60">Ładowanie...</p>
    <p
      v-else-if="itemsForBuilding().length === 0"
      class="text-sm text-brand-black/60"
    >
      Brak pozycji checklisty.
    </p>

    <ul v-else class="space-y-2 mb-4">
      <li
        v-for="item in itemsForBuilding()"
        :key="item.id"
        class="flex items-start gap-3 border border-brand-black/20 bg-brand-white px-3 py-2"
      >
        <input
          :id="`check-${item.id}`"
          type="checkbox"
          class="mt-1 h-4 w-4 shrink-0 accent-brand-black"
          :checked="item.is_done"
          @change="$emit('toggle', item)"
        />
        <label
          :for="`check-${item.id}`"
          class="text-sm cursor-pointer flex-1"
          :class="item.is_done ? 'line-through text-brand-black/50' : ''"
        >
          {{ item.title }}
        </label>
      </li>
    </ul>

    <form class="flex flex-col sm:flex-row gap-2" @submit.prevent="handleAdd">
      <div class="flex-1">
        <BaseInput
          id="new-checklist-item"
          v-model="newTitle"
          placeholder="Nowa pozycja, np. Plan piętra"
        />
      </div>
      <BaseButton type="submit" size="sm" variant="secondary" :disabled="adding || !newTitle.trim()">
        Dodaj
      </BaseButton>
    </form>
  </div>
</template>
