<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div v-if="auth.loading" class="min-h-screen flex items-center justify-center bg-brand-gray">
    <p class="text-sm text-brand-black/60">Ładowanie...</p>
  </div>
  <RouterView v-else v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>
