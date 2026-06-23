<script setup lang="ts">
import type { Building, BuildingMaterial } from '@/types'
import { BUILDING_TYPE_LABELS } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  buildings: Building[]
  materialsByBuilding: Record<string, BuildingMaterial[]>
  loading?: boolean
}>()

defineEmits<{
  add: []
  edit: [building: Building]
  delete: [building: Building]
  'add-material': [building: Building]
  'download-material': [material: BuildingMaterial]
  'delete-material': [material: BuildingMaterial]
}>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Budynki</h3>
      <BaseButton size="sm" @click="$emit('add')">Dodaj budynek</BaseButton>
    </div>

    <p v-if="loading" class="text-sm text-brand-black/60">Ładowanie...</p>
    <p
      v-else-if="buildings.length === 0"
      class="text-sm text-brand-black/60 border border-dashed border-brand-black/30 p-6 text-center"
    >
      Brak budynków. Dodaj pierwszy budynek klienta.
    </p>

    <div v-else class="space-y-3">
      <div
        v-for="building in buildings"
        :key="building.id"
        class="border border-brand-black bg-brand-white"
      >
        <div class="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="font-medium">{{ building.address }}</p>
            <span class="inline-block mt-2 text-xs border border-brand-black px-2 py-0.5">
              {{ BUILDING_TYPE_LABELS[building.building_type] }}
            </span>
            <p v-if="building.notes" class="mt-2 text-sm text-brand-black/70">
              {{ building.notes }}
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <BaseButton size="sm" variant="secondary" @click="$emit('edit', building)">
              Edytuj
            </BaseButton>
            <BaseButton size="sm" variant="danger" @click="$emit('delete', building)">
              Usuń
            </BaseButton>
          </div>
        </div>

        <div class="border-t border-brand-black/20 bg-brand-gray/50 px-4 py-4">
          <div class="flex items-center justify-between gap-3 mb-3">
            <p class="text-sm font-medium">Materiały do świadectwa</p>
            <BaseButton size="sm" @click="$emit('add-material', building)">
              Dodaj materiał
            </BaseButton>
          </div>

          <p
            v-if="!(materialsByBuilding[building.id]?.length)"
            class="text-sm text-brand-black/60"
          >
            Brak materiałów. Dodaj np. rzut budynku lub informacje ze spółdzielni.
          </p>

          <ul v-else class="space-y-2">
            <li
              v-for="material in materialsByBuilding[building.id]"
              :key="material.id"
              class="border border-brand-black/20 bg-brand-white px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium">{{ material.title }}</p>
                <p class="text-xs text-brand-black/60 mt-0.5 truncate">
                  {{ material.file_name }} · {{ formatDate(material.created_at) }}
                </p>
                <p v-if="material.notes" class="text-xs text-brand-black/70 mt-1">
                  {{ material.notes }}
                </p>
              </div>
              <div class="flex gap-2 shrink-0">
                <BaseButton
                  size="sm"
                  variant="secondary"
                  @click="$emit('download-material', material)"
                >
                  Pobierz
                </BaseButton>
                <BaseButton
                  size="sm"
                  variant="danger"
                  @click="$emit('delete-material', material)"
                >
                  Usuń
                </BaseButton>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
