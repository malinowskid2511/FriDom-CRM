<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { useCertificates } from '@/composables/useCertificates'
import {
  earningsPeriodLabel,
  MONTH_OPTIONS,
  type EarningsSummary,
} from '@/lib/earnings'
import { formatCost } from '@/lib/format'

const { getEarningsSummary, getEarningsYears } = useCertificates()

const loading = ref(true)
const error = ref<string | null>(null)

const yearOptions = ref<number[]>([new Date().getFullYear()])
const selectedYear = ref(String(new Date().getFullYear()))
const selectedMonth = ref(String(new Date().getMonth() + 1))
const earnings = ref<EarningsSummary | null>(null)
const earningsLoading = ref(false)

const currentMonthSummary = ref<EarningsSummary | null>(null)
const currentYearSummary = ref<EarningsSummary | null>(null)

function parseSelectedMonth(): number | null {
  return selectedMonth.value === 'all' ? null : Number(selectedMonth.value)
}

async function loadEarnings() {
  earningsLoading.value = true
  try {
    const year = Number(selectedYear.value)
    earnings.value = await getEarningsSummary(year, parseSelectedMonth())
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Błąd pobierania podsumowania'
    earnings.value = null
  } finally {
    earningsLoading.value = false
  }
}

async function loadQuickEarnings() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [monthSum, yearSum] = await Promise.all([
    getEarningsSummary(year, month),
    getEarningsSummary(year, null),
  ])
  currentMonthSummary.value = monthSum
  currentYearSummary.value = yearSum
}

watch([selectedYear, selectedMonth], loadEarnings)

onMounted(async () => {
  try {
    yearOptions.value = await getEarningsYears()
    await Promise.all([loadEarnings(), loadQuickEarnings()])
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Błąd pobierania danych'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-semibold">Podsumowanie zarobków</h1>
        <p class="text-sm text-brand-black/70 mt-1">
          Suma kosztów certyfikatów według daty wystawienia
        </p>
      </div>

      <p v-if="loading" class="text-sm text-brand-black/60">Ładowanie...</p>
      <p v-else-if="error && !earnings" class="text-sm text-red-600">{{ error }}</p>

      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div class="border border-brand-black bg-brand-white p-6">
            <p class="text-sm text-brand-black/70">Bieżący miesiąc</p>
            <p class="text-3xl font-semibold mt-2 tabular-nums">
              {{ formatCost(currentMonthSummary?.total ?? 0) }}
            </p>
            <p class="text-sm text-brand-black/50 mt-2">
              {{ currentMonthSummary?.count ?? 0 }} certyfikatów
            </p>
          </div>
          <div class="border border-brand-black bg-brand-white p-6">
            <p class="text-sm text-brand-black/70">Bieżący rok</p>
            <p class="text-3xl font-semibold mt-2 tabular-nums">
              {{ formatCost(currentYearSummary?.total ?? 0) }}
            </p>
            <p class="text-sm text-brand-black/50 mt-2">
              {{ currentYearSummary?.count ?? 0 }} certyfikatów
            </p>
          </div>
        </div>

        <div class="border border-brand-black bg-brand-white p-6 space-y-6 max-w-2xl">
          <h2 class="font-semibold">Wybierz okres</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSelect id="earnings-year" v-model="selectedYear" label="Rok">
              <option v-for="year in yearOptions" :key="year" :value="String(year)">
                {{ year }}
              </option>
            </BaseSelect>
            <BaseSelect id="earnings-month" v-model="selectedMonth" label="Miesiąc">
              <option
                v-for="opt in MONTH_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </BaseSelect>
          </div>

          <div class="border border-brand-black/20 bg-brand-gray p-5">
            <p class="text-sm text-brand-black/70">
              {{ earnings ? earningsPeriodLabel(earnings.year, earnings.month) : 'Wybrany okres' }}
            </p>
            <p v-if="earningsLoading" class="text-3xl font-semibold mt-2">—</p>
            <template v-else-if="earnings">
              <p class="text-3xl font-semibold mt-2 tabular-nums">
                {{ formatCost(earnings.total) }}
              </p>
              <p class="text-sm text-brand-black/60 mt-2">
                {{ earnings.count }}
                {{ earnings.count === 1 ? 'certyfikat' : earnings.count < 5 ? 'certyfikaty' : 'certyfikatów' }}
                w wybranym okresie
              </p>
            </template>
          </div>
        </div>
      </template>
    </div>
  </AppShell>
</template>
