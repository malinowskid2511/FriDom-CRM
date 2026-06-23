<script setup lang="ts">
import { ACTIVITY_ACTION_LABELS, type ActivityLogEntry } from '@/types'

defineProps<{
  entries: ActivityLogEntry[]
  loading?: boolean
}>()

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function actorName(entry: ActivityLogEntry) {
  return entry.user?.full_name || entry.user?.email || 'System'
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold mb-4">Historia aktywności</h3>

    <p v-if="loading" class="text-sm text-brand-black/60">Ładowanie...</p>
    <p
      v-else-if="entries.length === 0"
      class="text-sm text-brand-black/60 border border-dashed border-brand-black/30 p-6 text-center"
    >
      Brak wpisów. Aktywność pojawi się po dodaniu materiałów, certyfikatów lub zmianie statusu.
    </p>

    <ol v-else class="relative border-l border-brand-black/20 ml-3 space-y-6">
      <li v-for="entry in entries" :key="entry.id" class="ml-6">
        <span
          class="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-brand-black bg-brand-white"
        />
        <div class="border border-brand-black/20 bg-brand-white p-4">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p class="text-xs uppercase tracking-wide text-brand-black/60">
                {{ ACTIVITY_ACTION_LABELS[entry.action] }}
              </p>
              <p class="mt-1 text-sm">{{ entry.description }}</p>
              <p class="mt-2 text-xs text-brand-black/60">
                {{ actorName(entry) }}
              </p>
            </div>
            <time class="text-xs text-brand-black/50 whitespace-nowrap shrink-0">
              {{ formatDateTime(entry.created_at) }}
            </time>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>
