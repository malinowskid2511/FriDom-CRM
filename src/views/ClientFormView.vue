<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useClients } from '@/composables/useClients'
import { useAuthStore } from '@/stores/auth'
import type { ClientFormData } from '@/types'
import { ROUTES } from '@/lib/routes'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { fetchClient, createClient, updateClient } = useClients()

const isEdit = route.name === 'client-edit'
const clientId = route.params.id as string | undefined

const form = ref<ClientFormData>({
  name: '',
  email: '',
  phone: '',
  notes: '',
})

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!isEdit || !clientId) return
  loading.value = true
  const client = await fetchClient(clientId)
  loading.value = false
  if (!client) {
    error.value = 'Nie znaleziono klienta'
    return
  }
  form.value = {
    name: client.name,
    email: client.email ?? '',
    phone: client.phone ?? '',
    notes: client.notes ?? '',
  }
})

async function handleSubmit() {
  if (!form.value.name.trim()) {
    error.value = 'Nazwa klienta jest wymagana'
    return
  }

  saving.value = true
  error.value = null

  try {
    if (isEdit && clientId) {
      await updateClient(clientId, form.value)
      router.push(ROUTES.client(clientId))
    } else {
      const client = await createClient(form.value, auth.user?.id)
      router.push(ROUTES.client(client.id))
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Błąd zapisu'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppShell>
    <div class="max-w-2xl">
      <h1 class="text-2xl font-semibold mb-6">
        {{ isEdit ? 'Edytuj klienta' : 'Nowy klient' }}
      </h1>

      <p v-if="loading" class="text-sm text-brand-black/60">Ładowanie...</p>

      <form v-else class="space-y-4 border border-brand-black bg-brand-white p-6" @submit.prevent="handleSubmit">
        <BaseInput
          id="client-name"
          v-model="form.name"
          label="Nazwa / Imię i nazwisko"
          placeholder="np. Jan Kowalski lub Firma Sp. z o.o."
          required
        />
        <BaseInput
          id="client-phone"
          v-model="form.phone"
          label="Telefon"
          type="tel"
          placeholder="+48 123 456 789"
        />
        <BaseInput
          id="client-email"
          v-model="form.email"
          label="E-mail"
          type="email"
          placeholder="klient@email.pl"
        />
        <BaseTextarea
          id="client-notes"
          v-model="form.notes"
          label="Notatki"
          placeholder="Dodatkowe informacje o kliencie..."
        />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <BaseButton
            type="button"
            variant="secondary"
            class="flex-1"
            @click="router.back()"
          >
            Anuluj
          </BaseButton>
          <BaseButton type="submit" class="flex-1" :disabled="saving">
            {{ saving ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Dodaj klienta' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </AppShell>
</template>
