<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ROUTES } from '@/lib/routes'
import { LOGOS } from '@/lib/branding'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    await auth.signIn(email.value.trim(), password.value)
    router.push(ROUTES.root)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Błąd logowania'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-brand-gray">
    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md border border-brand-black bg-brand-white p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-8">
          <img :src="LOGOS.dark" alt="FriDom" class="h-14 w-14 object-contain" />
          <div>
            <h1 class="text-xl font-semibold">FriDom CRM</h1>
            <p class="text-sm text-brand-black/70">Antonina Frieske · Architekt</p>
          </div>
        </div>

        <h2 class="text-lg font-medium mb-6">Logowanie</h2>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <BaseInput
            id="login-email"
            v-model="email"
            label="E-mail"
            type="email"
            placeholder="twoj@email.pl"
            required
          />
          <BaseInput
            id="login-password"
            v-model="password"
            label="Hasło"
            type="password"
            required
          />
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          <BaseButton type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Logowanie...' : 'Zaloguj się' }}
          </BaseButton>
        </form>
      </div>
    </div>

    <footer class="bg-brand-black text-brand-white py-6 px-4">
      <div class="max-w-md mx-auto text-sm text-center sm:text-right space-y-1">
        <p class="font-semibold">FriDom Antonina Frieske</p>
        <p>ul. Orła Białego 21b/24, 66-470 Kostrzyn nad Odrą</p>
        <p>biuro@a-fridom.pl · +48 727 420 330</p>
      </div>
    </footer>
  </div>
</template>
