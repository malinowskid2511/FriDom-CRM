<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/lib/routes'
import { LOGOS } from '@/lib/branding'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const route = useRoute()
const mobileMenuOpen = ref(false)

const navItems = [
  { to: ROUTES.root, label: 'Panel' },
  { to: ROUTES.clients, label: 'Klienci' },
  { to: ROUTES.earnings, label: 'Zarobki' },
]

function isActive(path: string) {
  if (path === ROUTES.root) return route.path === ROUTES.root
  return route.path.startsWith(path)
}

async function handleLogout() {
  await auth.signOut()
  mobileMenuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-brand-black text-brand-white border-b border-brand-black">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-20">
          <RouterLink :to="ROUTES.root" class="flex items-center gap-3 sm:gap-4 min-w-0">
            <img
              :src="LOGOS.light"
              alt="FriDom — Antonina Frieske Architekt"
              class="h-11 w-11 sm:h-14 sm:w-14 shrink-0 object-contain"
            />
            <div class="min-w-0">
              <p class="font-semibold text-sm sm:text-base truncate">Antonina Frieske</p>
              <p class="text-xs sm:text-sm text-brand-white/70">Architekt</p>
            </div>
          </RouterLink>

          <nav class="hidden md:flex items-center gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="px-4 py-2 text-sm transition-colors min-h-11 flex items-center"
              :class="isActive(item.to) ? 'bg-brand-white text-brand-black' : 'hover:bg-white/10'"
            >
              {{ item.label }}
            </RouterLink>
            <RouterLink
              v-if="auth.isAdmin"
              :to="ROUTES.users"
              class="px-4 py-2 text-sm transition-colors min-h-11 flex items-center"
              :class="isActive(ROUTES.users) ? 'bg-brand-white text-brand-black' : 'hover:bg-white/10'"
            >
              Użytkownicy
            </RouterLink>
          </nav>

          <div class="hidden md:flex items-center gap-4">
            <span v-if="auth.demoMode" class="text-xs border border-amber-400/60 text-amber-200 px-2 py-1">
              Podgląd demo
            </span>
            <span v-else-if="auth.skipAuth" class="text-xs border border-brand-white/40 px-2 py-1">
              Bez logowania
            </span>
            <span class="text-sm text-brand-white/80 truncate max-w-[160px]">{{ auth.fullName }}</span>
            <BaseButton
              v-if="!auth.skipAuth"
              variant="secondary"
              size="sm"
              class="!border-brand-white !text-brand-white hover:!bg-brand-white hover:!text-brand-black"
              @click="handleLogout"
            >
              Wyloguj
            </BaseButton>
          </div>

          <button
            type="button"
            class="md:hidden p-2 min-w-11 min-h-11 flex items-center justify-center"
            aria-label="Menu"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span class="text-2xl">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
          </button>
        </div>
      </div>

      <div v-if="mobileMenuOpen" class="md:hidden border-t border-white/20 px-4 py-4 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="block px-4 py-3 text-sm min-h-11"
          :class="isActive(item.to) ? 'bg-brand-white text-brand-black' : ''"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink
          v-if="auth.isAdmin"
          :to="ROUTES.users"
          class="block px-4 py-3 text-sm min-h-11"
          :class="isActive(ROUTES.users) ? 'bg-brand-white text-brand-black' : ''"
          @click="mobileMenuOpen = false"
        >
          Użytkownicy
        </RouterLink>
        <div v-if="!auth.skipAuth" class="pt-3 border-t border-white/20 flex flex-col gap-3">
          <span class="text-sm text-brand-white/80 px-4">{{ auth.fullName }}</span>
          <BaseButton variant="secondary" size="sm" class="mx-4 !border-brand-white !text-brand-white" @click="handleLogout">
            Wyloguj
          </BaseButton>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <slot />
    </main>

    <footer class="bg-brand-black text-brand-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div class="text-sm space-y-1 text-right sm:text-right">
          <p class="font-semibold">FriDom Antonina Frieske</p>
          <p>ul. Orła Białego 21b/24, 66-470 Kostrzyn nad Odrą</p>
          <p>
            <a href="mailto:biuro@a-fridom.pl" class="hover:underline">biuro@a-fridom.pl</a>
          </p>
          <p>
            <a href="tel:+48727420330" class="hover:underline">+48 727 420 330</a>
          </p>
          <p class="text-brand-white/70">NIP: 5993296705</p>
          <p class="text-brand-white/70">REGON: 541122313</p>
        </div>
      </div>
    </footer>
  </div>
</template>
