<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useUsers } from '@/composables/useUsers'
import type { UserRole } from '@/types'

const { users, loading, error, fetchUsers, updateUserRole, inviteUser } = useUsers()

const showInvite = ref(false)
const inviteForm = ref({
  email: '',
  password: '',
  full_name: '',
  role: 'assistant' as UserRole,
})
const inviteError = ref<string | null>(null)
const inviting = ref(false)

onMounted(() => fetchUsers())

async function handleRoleChange(userId: string, role: UserRole) {
  try {
    await updateUserRole(userId, role)
    await fetchUsers()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Błąd zmiany roli')
  }
}

async function handleInvite() {
  inviteError.value = null
  inviting.value = true
  try {
    await inviteUser(
      inviteForm.value.email,
      inviteForm.value.password,
      inviteForm.value.full_name,
      inviteForm.value.role,
    )
    showInvite.value = false
    inviteForm.value = { email: '', password: '', full_name: '', role: 'assistant' }
    await fetchUsers()
  } catch (e) {
    inviteError.value = e instanceof Error ? e.message : 'Błąd zaproszenia'
  } finally {
    inviting.value = false
  }
}
</script>

<template>
  <AppShell>
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Użytkownicy</h1>
          <p class="text-sm text-brand-black/70 mt-1">
            Zarządzanie kontami administratorów i asystentów
          </p>
        </div>
        <BaseButton @click="showInvite = !showInvite">
          {{ showInvite ? 'Anuluj' : 'Dodaj użytkownika' }}
        </BaseButton>
      </div>

      <div v-if="showInvite" class="border border-brand-black bg-brand-white p-6 space-y-4">
        <h2 class="font-semibold">Nowy użytkownik</h2>
        <p class="text-sm text-brand-black/70">
          Wymaga wdrożonej funkcji Edge „invite-user” w Supabase.
          Alternatywnie utwórz użytkownika ręcznie w panelu Supabase Auth.
        </p>
        <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="handleInvite">
          <BaseInput
            id="invite-name"
            v-model="inviteForm.full_name"
            label="Imię i nazwisko"
            required
          />
          <BaseInput
            id="invite-email"
            v-model="inviteForm.email"
            label="E-mail"
            type="email"
            required
          />
          <BaseInput
            id="invite-password"
            v-model="inviteForm.password"
            label="Hasło tymczasowe"
            type="password"
            required
          />
          <BaseSelect id="invite-role" v-model="inviteForm.role" label="Rola">
            <option value="assistant">Asystent</option>
            <option value="admin">Administrator</option>
          </BaseSelect>
          <p v-if="inviteError" class="sm:col-span-2 text-sm text-red-600">{{ inviteError }}</p>
          <div class="sm:col-span-2">
            <BaseButton type="submit" :disabled="inviting">
              {{ inviting ? 'Tworzenie...' : 'Utwórz użytkownika' }}
            </BaseButton>
          </div>
        </form>
      </div>

      <p v-if="loading" class="text-sm text-brand-black/60">Ładowanie...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div v-else class="border border-brand-black bg-brand-white overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brand-black bg-brand-gray">
              <th class="text-left px-4 py-3 font-semibold">Imię i nazwisko</th>
              <th class="text-left px-4 py-3 font-semibold">E-mail</th>
              <th class="text-left px-4 py-3 font-semibold">Rola</th>
              <th class="text-left px-4 py-3 font-semibold">Data utworzenia</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-brand-black/20"
            >
              <td class="px-4 py-3 font-medium">{{ user.full_name || '—' }}</td>
              <td class="px-4 py-3">{{ user.email || '—' }}</td>
              <td class="px-4 py-3">
                <select
                  :value="user.role"
                  class="border border-brand-black px-2 py-1 text-sm min-h-9"
                  @change="handleRoleChange(user.id, ($event.target as HTMLSelectElement).value as UserRole)"
                >
                  <option value="assistant">Asystent</option>
                  <option value="admin">Administrator</option>
                </select>
              </td>
              <td class="px-4 py-3 text-brand-black/60">
                {{ new Date(user.created_at).toLocaleDateString('pl-PL') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppShell>
</template>
