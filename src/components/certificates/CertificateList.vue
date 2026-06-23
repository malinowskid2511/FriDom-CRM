<script setup lang="ts">
import type { Certificate, PaymentStatus } from '@/types'
import { PAYMENT_STATUS_LABELS } from '@/types'
import { formatCost } from '@/lib/format'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  certificates: Certificate[]
  loading?: boolean
}>()

defineEmits<{
  add: []
  download: [cert: Certificate]
  editCost: [cert: Certificate]
  togglePayment: [cert: Certificate]
  markPdfSent: [cert: Certificate]
  delete: [cert: Certificate]
}>()

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pl-PL')
}

function formatDateTime(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isExpiringSoon(expiryDate: string | null) {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diff = expiry.getTime() - now.getTime()
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000
}

function paymentBadgeClass(status: PaymentStatus) {
  return status === 'paid'
    ? 'border-green-700 text-green-800 bg-green-50'
    : 'border-amber-600 text-amber-800 bg-amber-50'
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Certyfikaty energetyczne</h3>
      <BaseButton size="sm" @click="$emit('add')">Dodaj certyfikat</BaseButton>
    </div>

    <p v-if="loading" class="text-sm text-brand-black/60">Ładowanie...</p>
    <p
      v-else-if="certificates.length === 0"
      class="text-sm text-brand-black/60 border border-dashed border-brand-black/30 p-6 text-center"
    >
      Brak certyfikatów. Dodaj pierwszy certyfikat PDF.
    </p>

    <div v-else class="space-y-3 md:hidden">
      <div
        v-for="cert in certificates"
        :key="cert.id"
        class="border border-brand-black bg-brand-white p-4 space-y-2"
      >
        <p class="font-medium">{{ cert.certificate_number ?? 'Bez numeru' }}</p>
        <p v-if="cert.building" class="text-sm">{{ cert.building.address }}</p>
        <div class="flex flex-wrap gap-2 text-xs">
          <span v-if="cert.energy_class" class="border border-brand-black px-2 py-0.5">
            Klasa {{ cert.energy_class }}
          </span>
          <span class="border border-brand-black px-2 py-0.5">
            Koszt: {{ formatCost(cert.cost) }}
          </span>
          <span class="border px-2 py-0.5" :class="paymentBadgeClass(cert.payment_status)">
            {{ PAYMENT_STATUS_LABELS[cert.payment_status] }}
          </span>
          <span
            v-if="isExpiringSoon(cert.expiry_date)"
            class="border border-amber-600 text-amber-700 px-2 py-0.5"
          >
            Wygasa wkrótce
          </span>
        </div>
        <p class="text-sm text-brand-black/70">
          Wydano: {{ formatDate(cert.issue_date) }} · Ważny do: {{ formatDate(cert.expiry_date) }}
        </p>
        <p v-if="cert.pdf_sent_at" class="text-xs text-brand-black/60">
          PDF wysłano: {{ formatDateTime(cert.pdf_sent_at) }}
        </p>
        <div class="flex flex-wrap gap-2 pt-1">
          <BaseButton size="sm" variant="secondary" @click="$emit('togglePayment', cert)">
            {{ cert.payment_status === 'paid' ? 'Oznacz oczekującą' : 'Oznacz opłacone' }}
          </BaseButton>
          <BaseButton
            v-if="cert.file_path && !cert.pdf_sent_at"
            size="sm"
            variant="secondary"
            @click="$emit('markPdfSent', cert)"
          >
            Wysłano PDF
          </BaseButton>
          <BaseButton size="sm" variant="secondary" @click="$emit('editCost', cert)">
            Koszt
          </BaseButton>
          <BaseButton
            v-if="cert.file_path"
            size="sm"
            variant="secondary"
            @click="$emit('download', cert)"
          >
            Pobierz PDF
          </BaseButton>
          <BaseButton size="sm" variant="danger" @click="$emit('delete', cert)">
            Usuń
          </BaseButton>
        </div>
      </div>
    </div>

    <div v-if="certificates.length > 0" class="hidden md:block border border-brand-black bg-brand-white overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-brand-black bg-brand-gray">
            <th class="text-left px-4 py-3 font-semibold">Numer</th>
            <th class="text-left px-4 py-3 font-semibold">Budynek</th>
            <th class="text-left px-4 py-3 font-semibold">Klasa</th>
            <th class="text-left px-4 py-3 font-semibold">Koszt</th>
            <th class="text-left px-4 py-3 font-semibold">Płatność</th>
            <th class="text-left px-4 py-3 font-semibold">Wydano</th>
            <th class="text-left px-4 py-3 font-semibold">Ważny do</th>
            <th class="text-left px-4 py-3 font-semibold">PDF</th>
            <th class="text-left px-4 py-3 font-semibold">Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cert in certificates"
            :key="cert.id"
            class="border-b border-brand-black/20"
          >
            <td class="px-4 py-3 font-medium">
              {{ cert.certificate_number ?? '—' }}
              <span
                v-if="isExpiringSoon(cert.expiry_date)"
                class="ml-2 text-xs text-amber-700"
              >
                (wygasa)
              </span>
            </td>
            <td class="px-4 py-3">
              {{ cert.building?.address ?? '—' }}
            </td>
            <td class="px-4 py-3">{{ cert.energy_class ?? '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ formatCost(cert.cost) }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block text-xs border px-2 py-0.5"
                :class="paymentBadgeClass(cert.payment_status)"
              >
                {{ PAYMENT_STATUS_LABELS[cert.payment_status] }}
              </span>
            </td>
            <td class="px-4 py-3">{{ formatDate(cert.issue_date) }}</td>
            <td class="px-4 py-3">{{ formatDate(cert.expiry_date) }}</td>
            <td class="px-4 py-3 text-xs text-brand-black/70 whitespace-nowrap">
              {{ cert.pdf_sent_at ? formatDateTime(cert.pdf_sent_at) : '—' }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-2">
                <BaseButton size="sm" variant="ghost" @click="$emit('togglePayment', cert)">
                  {{ cert.payment_status === 'paid' ? 'Nieopł.' : 'Opł.' }}
                </BaseButton>
                <BaseButton
                  v-if="cert.file_path && !cert.pdf_sent_at"
                  size="sm"
                  variant="ghost"
                  @click="$emit('markPdfSent', cert)"
                >
                  Wysłano
                </BaseButton>
                <BaseButton size="sm" variant="ghost" @click="$emit('editCost', cert)">
                  Koszt
                </BaseButton>
                <BaseButton
                  v-if="cert.file_path"
                  size="sm"
                  variant="secondary"
                  @click="$emit('download', cert)"
                >
                  PDF
                </BaseButton>
                <BaseButton size="sm" variant="danger" @click="$emit('delete', cert)">
                  Usuń
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
