<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BuildingList from '@/components/buildings/BuildingList.vue'
import BuildingFormModal from '@/components/buildings/BuildingFormModal.vue'
import BuildingMaterialModal from '@/components/buildings/BuildingMaterialModal.vue'
import CertificateList from '@/components/certificates/CertificateList.vue'
import CertificateFormModal from '@/components/certificates/CertificateFormModal.vue'
import CertificateCostModal from '@/components/certificates/CertificateCostModal.vue'
import { parseCost } from '@/lib/format'
import { useClients } from '@/composables/useClients'
import { useBuildings } from '@/composables/useBuildings'
import { useBuildingMaterials } from '@/composables/useBuildingMaterials'
import { useCertificates } from '@/composables/useCertificates'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/lib/routes'
import type {
  Building,
  BuildingFormData,
  BuildingMaterial,
  BuildingMaterialFormData,
  Certificate,
  CertificateFormData,
  Client,
} from '@/types'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const clientId = route.params.id as string

const { fetchClient, deleteClient } = useClients()
const {
  buildings,
  loading: buildingsLoading,
  fetchBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} = useBuildings()
const {
  materials,
  fetchMaterials,
  uploadMaterial,
  downloadMaterial,
  deleteMaterial,
} = useBuildingMaterials()
const {
  certificates,
  loading: certsLoading,
  fetchCertificates,
  uploadCertificate,
  downloadCertificate,
  deleteCertificate,
  updateCertificateCost,
} = useCertificates()

const client = ref<Client | null>(null)
const loading = ref(true)
const activeTab = ref<'dane' | 'budynki' | 'certyfikaty'>('dane')

const buildingModalOpen = ref(false)
const editingBuilding = ref<Building | null>(null)

const materialModalOpen = ref(false)
const materialBuilding = ref<Building | null>(null)

const certModalOpen = ref(false)
const costModalOpen = ref(false)
const editingCert = ref<Certificate | null>(null)
const actionError = ref<string | null>(null)

onMounted(async () => {
  client.value = await fetchClient(clientId)
  loading.value = false
  if (!client.value) return
  await Promise.all([
    fetchBuildings(clientId),
    fetchCertificates(clientId),
    fetchMaterials(clientId),
  ])
})

const materialsByBuilding = computed(() => {
  const map: Record<string, BuildingMaterial[]> = {}
  for (const material of materials.value) {
    if (!map[material.building_id]) map[material.building_id] = []
    map[material.building_id].push(material)
  }
  return map
})

async function handleDeleteClient() {
  if (!client.value) return
  if (!confirm(`Czy na pewno usunąć klienta „${client.value.name}"?`)) return
  try {
    await deleteClient(client.value.id)
    router.push(ROUTES.clients)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd usuwania'
  }
}

function openAddBuilding() {
  editingBuilding.value = null
  buildingModalOpen.value = true
}

function openEditBuilding(building: Building) {
  editingBuilding.value = building
  buildingModalOpen.value = true
}

async function handleSaveBuilding(data: BuildingFormData) {
  actionError.value = null
  try {
    if (editingBuilding.value) {
      await updateBuilding(editingBuilding.value.id, data)
    } else {
      await createBuilding(clientId, data)
    }
    buildingModalOpen.value = false
    await fetchBuildings(clientId)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd zapisu budynku'
  }
}

async function handleDeleteBuilding(building: Building) {
  if (!confirm(`Usunąć budynek „${building.address}"?`)) return
  try {
    await deleteBuilding(building.id)
    await fetchBuildings(clientId)
    await fetchCertificates(clientId)
    await fetchMaterials(clientId)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd usuwania budynku'
  }
}

function openAddMaterial(building: Building) {
  materialBuilding.value = building
  materialModalOpen.value = true
}

async function handleSaveMaterial(data: BuildingMaterialFormData, file: File) {
  if (!materialBuilding.value) return
  actionError.value = null
  try {
    await uploadMaterial(clientId, materialBuilding.value.id, data, file, auth.user?.id)
    materialModalOpen.value = false
    materialBuilding.value = null
    await fetchMaterials(clientId)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd dodawania materiału'
  }
}

async function handleDownloadMaterial(material: BuildingMaterial) {
  try {
    await downloadMaterial(material)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd pobierania'
  }
}

async function handleDeleteMaterial(material: BuildingMaterial) {
  if (!confirm(`Usunąć materiał „${material.title}"?`)) return
  try {
    await deleteMaterial(material)
    await fetchMaterials(clientId)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd usuwania materiału'
  }
}

async function handleSaveCertificate(data: CertificateFormData, file: File) {
  actionError.value = null
  try {
    await uploadCertificate(clientId, data, file, auth.user?.id)
    certModalOpen.value = false
    await fetchCertificates(clientId)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd dodawania certyfikatu'
  }
}

async function handleDownloadCertificate(cert: Certificate) {
  try {
    await downloadCertificate(cert)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd pobierania'
  }
}

async function handleDeleteCertificate(cert: Certificate) {
  if (!confirm('Usunąć ten certyfikat?')) return
  try {
    await deleteCertificate(cert)
    await fetchCertificates(clientId)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd usuwania certyfikatu'
  }
}

function openEditCost(cert: Certificate) {
  editingCert.value = cert
  costModalOpen.value = true
}

async function handleSaveCost(costValue: string) {
  if (!editingCert.value) return
  actionError.value = null
  try {
    await updateCertificateCost(editingCert.value.id, parseCost(costValue))
    costModalOpen.value = false
    editingCert.value = null
    await fetchCertificates(clientId)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Błąd zapisu kosztu'
  }
}

const tabs = [
  { id: 'dane' as const, label: 'Dane' },
  { id: 'budynki' as const, label: 'Budynki' },
  { id: 'certyfikaty' as const, label: 'Certyfikaty' },
]
</script>

<template>
  <AppShell>
    <div v-if="loading" class="text-sm text-brand-black/60">Ładowanie...</div>

    <div v-else-if="!client" class="text-center py-12">
      <p class="text-brand-black/70">Nie znaleziono klienta.</p>
      <RouterLink :to="ROUTES.clients" class="inline-block mt-4">
        <BaseButton variant="secondary">Wróć do listy</BaseButton>
      </RouterLink>
    </div>

    <div v-else class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <RouterLink :to="ROUTES.clients" class="text-sm text-brand-black/60 hover:underline">
            ← Klienci
          </RouterLink>
          <h1 class="text-2xl font-semibold mt-2">{{ client.name }}</h1>
        </div>
        <div class="flex flex-wrap gap-2">
          <RouterLink :to="ROUTES.clientEdit(client.id)">
            <BaseButton variant="secondary" size="sm">Edytuj</BaseButton>
          </RouterLink>
          <BaseButton variant="danger" size="sm" @click="handleDeleteClient">
            Usuń klienta
          </BaseButton>
        </div>
      </div>

      <p v-if="actionError" class="text-sm text-red-600 border border-red-200 bg-red-50 p-3">
        {{ actionError }}
      </p>

      <div class="flex border-b border-brand-black overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="px-4 py-3 text-sm font-medium whitespace-nowrap min-h-11 border-b-2 -mb-px transition-colors"
          :class="
            activeTab === tab.id
              ? 'border-brand-black text-brand-black'
              : 'border-transparent text-brand-black/60 hover:text-brand-black'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'dane'" class="border border-brand-black bg-brand-white p-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-brand-black/60 uppercase tracking-wide">Telefon</p>
            <p class="mt-1">{{ client.phone ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-brand-black/60 uppercase tracking-wide">E-mail</p>
            <p class="mt-1">{{ client.email ?? '—' }}</p>
          </div>
        </div>
        <div v-if="client.notes">
          <p class="text-xs text-brand-black/60 uppercase tracking-wide">Notatki</p>
          <p class="mt-1 whitespace-pre-wrap">{{ client.notes }}</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'budynki'">
        <BuildingList
          :buildings="buildings"
          :materials-by-building="materialsByBuilding"
          :loading="buildingsLoading"
          @add="openAddBuilding"
          @edit="openEditBuilding"
          @delete="handleDeleteBuilding"
          @add-material="openAddMaterial"
          @download-material="handleDownloadMaterial"
          @delete-material="handleDeleteMaterial"
        />
      </div>

      <div v-else-if="activeTab === 'certyfikaty'">
        <CertificateList
          :certificates="certificates"
          :loading="certsLoading"
          @add="certModalOpen = true"
          @download="handleDownloadCertificate"
          @edit-cost="openEditCost"
          @delete="handleDeleteCertificate"
        />
      </div>
    </div>

    <BuildingFormModal
      :open="buildingModalOpen"
      :building="editingBuilding"
      @close="buildingModalOpen = false"
      @save="handleSaveBuilding"
    />

    <BuildingMaterialModal
      :open="materialModalOpen"
      :building="materialBuilding"
      @close="materialModalOpen = false"
      @save="handleSaveMaterial"
    />

    <CertificateFormModal
      :open="certModalOpen"
      :buildings="buildings"
      @close="certModalOpen = false"
      @save="handleSaveCertificate"
    />

    <CertificateCostModal
      :open="costModalOpen"
      :certificate="editingCert"
      @close="costModalOpen = false"
      @save="handleSaveCost"
    />
  </AppShell>
</template>
