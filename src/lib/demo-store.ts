import type {
  ActivityLogEntry,
  Building,
  BuildingFormData,
  BuildingMaterial,
  BuildingMaterialFormData,
  Certificate,
  CertificateFormData,
  ChecklistItem,
  Client,
  ClientFormData,
  OrderStatus,
  PaymentStatus,
  Profile,
  RecentCertificate,
  UserRole,
} from '@/types'
import { resolveMimeType } from '@/lib/file-upload'
import { parseCost } from '@/lib/format'
import { defaultChecklistTitles } from '@/lib/checklist-defaults'
import type { LogActivityParams } from '@/lib/activity-log'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types'

const now = new Date().toISOString()
const ago = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}
const day = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

const CLIENT_1 = 'c1111111-1111-1111-1111-111111111111'
const CLIENT_2 = 'c2222222-2222-2222-2222-222222222222'
const CLIENT_3 = 'c3333333-3333-3333-3333-333333333333'
const BUILD_1 = 'b1111111-1111-1111-1111-111111111111'
const BUILD_2 = 'b2222222-2222-2222-2222-222222222222'
const BUILD_3 = 'b3333333-3333-3333-3333-333333333333'
const DEV_USER = '00000000-0000-0000-0000-000000000000'

let clients: Client[] = [
  {
    id: CLIENT_1,
    name: 'Jan Kowalski',
    email: 'jan.kowalski@email.pl',
    phone: '+48 601 234 567',
    notes: 'Dom jednorodzinny — certyfikat po generalnym remoncie.',
    order_status: 'in_progress',
    created_by: DEV_USER,
    created_at: now,
    updated_at: now,
  },
  {
    id: CLIENT_2,
    name: 'Anna Nowak',
    email: 'anna.nowak@email.pl',
    phone: '+48 512 345 678',
    notes: 'Mieszkanie w bloku, sprzedaż nieruchomości.',
    order_status: 'waiting_for_data',
    created_by: DEV_USER,
    created_at: now,
    updated_at: now,
  },
  {
    id: CLIENT_3,
    name: 'Spółdzielnia Mieszkaniowa „Słoneczna”',
    email: 'biuro@sloneczna-sm.pl',
    phone: '+48 95 123 45 67',
    notes: 'Budynek wielorodzinny — 12 lokali.',
    order_status: 'ready',
    created_by: DEV_USER,
    created_at: now,
    updated_at: now,
  },
]

let buildings: Building[] = [
  {
    id: BUILD_1,
    client_id: CLIENT_1,
    address: 'ul. Kwiatowa 12, 66-470 Kostrzyn nad Odrą',
    building_type: 'dom_jednorodzinny',
    notes: 'Pow. użytkowa 145 m²',
    created_at: now,
  },
  {
    id: BUILD_2,
    client_id: CLIENT_2,
    address: 'ul. Parkowa 5/12, 66-470 Kostrzyn nad Odrą',
    building_type: 'mieszkanie',
    notes: 'III piętro, 62 m²',
    created_at: now,
  },
  {
    id: BUILD_3,
    client_id: CLIENT_3,
    address: 'ul. Słoneczna 8, 66-470 Kostrzyn nad Odrą',
    building_type: 'budynek_wielorodzinny',
    notes: null,
    created_at: now,
  },
]

let buildingMaterials: BuildingMaterial[] = [
  {
    id: 'mat-1111-1111-1111-111111111111',
    building_id: BUILD_1,
    client_id: CLIENT_1,
    title: 'Rzut budynku',
    file_path: 'demo/rzut-kowalski.pdf',
    file_name: 'rzut-parter.pdf',
    mime_type: 'application/pdf',
    notes: 'Rzut parteru i piętra',
    uploaded_by: DEV_USER,
    created_at: ago(10),
  },
  {
    id: 'mat-2222-2222-2222-222222222222',
    building_id: BUILD_2,
    client_id: CLIENT_2,
    title: 'Informacje ze spółdzielni',
    file_path: 'demo/spoldzielnia-nowak.pdf',
    file_name: 'informacje-sm.pdf',
    mime_type: 'application/pdf',
    notes: null,
    uploaded_by: DEV_USER,
    created_at: ago(5),
  },
]

let certificates: Certificate[] = [
  {
    id: 'cert-1111-1111-1111-111111111111',
    client_id: CLIENT_1,
    building_id: BUILD_1,
    certificate_number: 'CEEB/2024/00123',
    issue_date: day(-120),
    expiry_date: day(3450),
    energy_class: 'B',
    cost: 450,
    payment_status: 'paid',
    pdf_sent_at: ago(10),
    file_path: 'demo/certyfikat-kowalski.pdf',
    file_name: 'certyfikat-kowalski.pdf',
    notes: null,
    uploaded_by: DEV_USER,
    created_at: ago(14),
  },
  {
    id: 'cert-2222-2222-2222-222222222222',
    client_id: CLIENT_2,
    building_id: BUILD_2,
    certificate_number: 'CEEB/2025/00456',
    issue_date: day(-30),
    expiry_date: day(60),
    energy_class: 'C',
    cost: 380,
    payment_status: 'pending',
    pdf_sent_at: null,
    file_path: 'demo/certyfikat-nowak.pdf',
    file_name: 'certyfikat-nowak.pdf',
    notes: 'Wygasa wkrótce — przypomnienie dla klienta.',
    uploaded_by: DEV_USER,
    created_at: ago(3),
  },
  {
    id: 'cert-3333-3333-3333-333333333333',
    client_id: CLIENT_3,
    building_id: BUILD_3,
    certificate_number: 'CEEB/2025/00789',
    issue_date: day(-7),
    expiry_date: day(3650),
    energy_class: 'D',
    cost: 1200,
    payment_status: 'paid',
    pdf_sent_at: ago(1),
    file_path: 'demo/certyfikat-sloneczna.pdf',
    file_name: 'certyfikat-sloneczna.pdf',
    notes: null,
    uploaded_by: DEV_USER,
    created_at: ago(1),
  },
]

let checklistItems: ChecklistItem[] = [
  {
    id: 'chk-1111-1111-1111-111111111111',
    building_id: BUILD_1,
    client_id: CLIENT_1,
    title: 'Rzut budynku',
    is_done: true,
    sort_order: 0,
    created_at: ago(12),
  },
  {
    id: 'chk-1112-1111-1111-111111111111',
    building_id: BUILD_1,
    client_id: CLIENT_1,
    title: 'Informacje ze spółdzielni',
    is_done: false,
    sort_order: 1,
    created_at: ago(12),
  },
  {
    id: 'chk-1113-1111-1111-111111111111',
    building_id: BUILD_1,
    client_id: CLIENT_1,
    title: 'Dokumentacja techniczna',
    is_done: false,
    sort_order: 2,
    created_at: ago(12),
  },
  {
    id: 'chk-1114-1111-1111-111111111111',
    building_id: BUILD_1,
    client_id: CLIENT_1,
    title: 'Zdjęcia budynku',
    is_done: true,
    sort_order: 3,
    created_at: ago(12),
  },
  {
    id: 'chk-2221-2222-2222-222222222222',
    building_id: BUILD_2,
    client_id: CLIENT_2,
    title: 'Rzut budynku',
    is_done: false,
    sort_order: 0,
    created_at: ago(8),
  },
  {
    id: 'chk-2222-2222-2222-222222222222',
    building_id: BUILD_2,
    client_id: CLIENT_2,
    title: 'Informacje ze spółdzielni',
    is_done: false,
    sort_order: 1,
    created_at: ago(8),
  },
  {
    id: 'chk-2223-2222-2222-222222222222',
    building_id: BUILD_2,
    client_id: CLIENT_2,
    title: 'Dokumentacja techniczna',
    is_done: false,
    sort_order: 2,
    created_at: ago(8),
  },
  {
    id: 'chk-2224-2222-2222-222222222222',
    building_id: BUILD_2,
    client_id: CLIENT_2,
    title: 'Zdjęcia budynku',
    is_done: false,
    sort_order: 3,
    created_at: ago(8),
  },
]

let activityLog: ActivityLogEntry[] = [
  {
    id: 'act-0001',
    client_id: CLIENT_1,
    user_id: DEV_USER,
    action: 'certificate_pdf_sent',
    description: 'Wysłano PDF certyfikatu CEEB/2024/00123',
    entity_id: 'cert-1111-1111-1111-111111111111',
    created_at: ago(10),
  },
  {
    id: 'act-0002',
    client_id: CLIENT_1,
    user_id: DEV_USER,
    action: 'material_uploaded',
    description: 'Dodano materiał: Rzut budynku',
    entity_id: 'mat-1111-1111-1111-111111111111',
    created_at: ago(10),
  },
  {
    id: 'act-0003',
    client_id: CLIENT_2,
    user_id: DEV_USER,
    action: 'order_status_changed',
    description: 'Status zlecenia: Czeka na dane',
    entity_id: CLIENT_2,
    created_at: ago(5),
  },
  {
    id: 'act-0004',
    client_id: CLIENT_3,
    user_id: DEV_USER,
    action: 'certificate_uploaded',
    description: 'Dodano certyfikat CEEB/2025/00789',
    entity_id: 'cert-3333-3333-3333-333333333333',
    created_at: ago(1),
  },
]

let profiles: Profile[] = [
  {
    id: DEV_USER,
    email: 'admin@fridom.pl',
    full_name: 'Antonina Frieske',
    role: 'admin',
    created_at: now,
  },
  {
    id: 'u2222222-2222-2222-2222-222222222222',
    email: 'asystent@fridom.pl',
    full_name: 'Maria Kowalczyk',
    role: 'assistant',
    created_at: now,
  },
]

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms))
}

function profileName(userId: string | null | undefined) {
  if (!userId) return null
  return profiles.find((p) => p.id === userId) ?? null
}

function attachActivityUser(entry: ActivityLogEntry): ActivityLogEntry {
  const user = profileName(entry.user_id)
  return {
    ...entry,
    user: user ? { full_name: user.full_name, email: user.email } : null,
  }
}

function attachBuilding(cert: Certificate): Certificate {
  if (!cert.building_id) return { ...cert, building: null }
  const building = buildings.find((b) => b.id === cert.building_id) ?? null
  return { ...cert, building }
}

export const demoStore = {
  async getClients(search?: string) {
    await delay()
    let result = [...clients].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    if (search?.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((c) => {
        const matchesClient =
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
        const matchesAddress = buildings.some(
          (b) => b.client_id === c.id && b.address.toLowerCase().includes(q),
        )
        return matchesClient || matchesAddress
      })
    }
    return result
  },

  async getClient(id: string) {
    await delay()
    return clients.find((c) => c.id === id) ?? null
  },

  async createClient(form: ClientFormData) {
    await delay()
    const client: Client = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
      order_status: 'waiting_for_data',
      created_by: DEV_USER,
      created_at: now,
      updated_at: now,
    }
    clients.unshift(client)
    return client
  },

  async updateClient(id: string, form: ClientFormData) {
    await delay()
    const idx = clients.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Klient nie znaleziony')
    clients[idx] = {
      ...clients[idx],
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    }
    return clients[idx]
  },

  async updateOrderStatus(id: string, status: OrderStatus, userId?: string | null) {
    await delay()
    const idx = clients.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Klient nie znaleziony')
    clients[idx] = {
      ...clients[idx],
      order_status: status,
      updated_at: new Date().toISOString(),
    }
    await demoStore.logActivity({
      clientId: id,
      action: 'order_status_changed',
      description: `Status zlecenia: ${ORDER_STATUS_LABELS[status]}`,
      userId,
      entityId: id,
    })
    return clients[idx]
  },

  async deleteClient(id: string) {
    await delay()
    certificates = certificates.filter((c) => c.client_id !== id)
    buildingMaterials = buildingMaterials.filter((m) => m.client_id !== id)
    checklistItems = checklistItems.filter((i) => i.client_id !== id)
    activityLog = activityLog.filter((a) => a.client_id !== id)
    buildings = buildings.filter((b) => b.client_id !== id)
    clients = clients.filter((c) => c.id !== id)
  },

  async getBuildings(clientId: string) {
    await delay()
    return buildings.filter((b) => b.client_id === clientId)
  },

  async createBuilding(clientId: string, form: BuildingFormData) {
    await delay()
    const building: Building = {
      id: crypto.randomUUID(),
      client_id: clientId,
      address: form.address.trim(),
      building_type: form.building_type,
      notes: form.notes.trim() || null,
      created_at: now,
    }
    buildings.push(building)
    await demoStore.createDefaultChecklist(clientId, building.id, DEV_USER)
    return building
  },

  async updateBuilding(id: string, form: BuildingFormData) {
    await delay()
    const idx = buildings.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('Budynek nie znaleziony')
    buildings[idx] = {
      ...buildings[idx],
      address: form.address.trim(),
      building_type: form.building_type,
      notes: form.notes.trim() || null,
    }
    return buildings[idx]
  },

  async deleteBuilding(id: string) {
    await delay()
    certificates = certificates.map((c) =>
      c.building_id === id ? { ...c, building_id: null } : c,
    )
    buildingMaterials = buildingMaterials.filter((m) => m.building_id !== id)
    checklistItems = checklistItems.filter((i) => i.building_id !== id)
    buildings = buildings.filter((b) => b.id !== id)
  },

  async getBuildingMaterials(clientId: string) {
    await delay()
    return buildingMaterials
      .filter((m) => m.client_id === clientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  async uploadBuildingMaterial(
    clientId: string,
    buildingId: string,
    form: BuildingMaterialFormData,
    file: File,
  ) {
    await delay()
    const material: BuildingMaterial = {
      id: crypto.randomUUID(),
      building_id: buildingId,
      client_id: clientId,
      title: form.title.trim(),
      file_path: `demo/${file.name}`,
      file_name: file.name,
      mime_type: resolveMimeType(file) || null,
      notes: form.notes.trim() || null,
      uploaded_by: DEV_USER,
      created_at: now,
    }
    buildingMaterials.unshift(material)
    return material
  },

  async deleteBuildingMaterial(id: string) {
    await delay()
    buildingMaterials = buildingMaterials.filter((m) => m.id !== id)
  },

  async getCertificates(clientId: string) {
    await delay()
    return certificates
      .filter((c) => c.client_id === clientId)
      .map(attachBuilding)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  async uploadCertificate(clientId: string, form: CertificateFormData, file: File) {
    await delay()
    const cert: Certificate = {
      id: crypto.randomUUID(),
      client_id: clientId,
      building_id: form.building_id || null,
      certificate_number: form.certificate_number.trim() || null,
      issue_date: form.issue_date || null,
      expiry_date: form.expiry_date || null,
      energy_class: form.energy_class || null,
      cost: parseCost(form.cost),
      payment_status: 'pending',
      pdf_sent_at: null,
      file_path: `demo/${file.name}`,
      file_name: file.name,
      notes: form.notes.trim() || null,
      uploaded_by: DEV_USER,
      created_at: now,
    }
    certificates.unshift(cert)
    return attachBuilding(cert)
  },

  async deleteCertificate(id: string) {
    await delay()
    certificates = certificates.filter((c) => c.id !== id)
  },

  async getRecentCertificates(limit = 10): Promise<RecentCertificate[]> {
    await delay()
    return certificates
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map((cert) => {
        const client = clients.find((c) => c.id === cert.client_id)
        const building = cert.building_id
          ? buildings.find((b) => b.id === cert.building_id)
          : buildings.find((b) => b.client_id === cert.client_id)
        return {
          id: cert.id,
          client_id: cert.client_id,
          created_at: cert.created_at,
          client_name: client?.name ?? '—',
          address: building?.address ?? null,
          cost: cert.cost,
        }
      })
  },

  async updateCertificateCost(id: string, cost: number | null) {
    await delay()
    const idx = certificates.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Certyfikat nie znaleziony')
    certificates[idx] = { ...certificates[idx], cost }
    return attachBuilding(certificates[idx])
  },

  async getEarningsCertificates() {
    await delay()
    return certificates.map((c) => ({
      cost: c.cost,
      issue_date: c.issue_date,
      created_at: c.created_at,
    }))
  },

  async getStats() {
    await delay()
    const today = new Date()
    const future = new Date()
    future.setDate(future.getDate() + 90)
    const expiring = certificates.filter((c) => {
      if (!c.expiry_date) return false
      const exp = new Date(c.expiry_date)
      return exp >= today && exp <= future
    }).length
    return {
      clientsCount: clients.length,
      certificatesCount: certificates.length,
      expiringCount: expiring,
    }
  },

  async updateCertificatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    userId?: string | null,
  ) {
    await delay()
    const idx = certificates.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Certyfikat nie znaleziony')
    certificates[idx] = { ...certificates[idx], payment_status: paymentStatus }
    await demoStore.logActivity({
      clientId: certificates[idx].client_id,
      action: 'certificate_payment_changed',
      description: `Płatność: ${PAYMENT_STATUS_LABELS[paymentStatus]}`,
      userId,
      entityId: id,
    })
    return attachBuilding(certificates[idx])
  },

  async markCertificatePdfSent(id: string, userId?: string | null) {
    await delay()
    const idx = certificates.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Certyfikat nie znaleziony')
    const sentAt = new Date().toISOString()
    certificates[idx] = { ...certificates[idx], pdf_sent_at: sentAt }
    const label = certificates[idx].certificate_number ?? 'certyfikat'
    await demoStore.logActivity({
      clientId: certificates[idx].client_id,
      action: 'certificate_pdf_sent',
      description: `Wysłano PDF certyfikatu ${label}`,
      userId,
      entityId: id,
    })
    return attachBuilding(certificates[idx])
  },

  async getChecklistItems(clientId: string) {
    await delay()
    return checklistItems
      .filter((i) => i.client_id === clientId)
      .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title))
  },

  async createDefaultChecklist(
    clientId: string,
    buildingId: string,
    userId?: string | null,
  ) {
    await delay()
    const created = defaultChecklistTitles().map((title, index) => ({
      id: crypto.randomUUID(),
      building_id: buildingId,
      client_id: clientId,
      title,
      is_done: false,
      sort_order: index,
      created_at: now,
    }))
    checklistItems.push(...created)
    await demoStore.logActivity({
      clientId,
      action: 'checklist_item_added',
      description: `Utworzono checklistę materiałów (${created.length} pozycji)`,
      userId: userId ?? DEV_USER,
      entityId: buildingId,
    })
    return created
  },

  async addChecklistItem(
    clientId: string,
    buildingId: string,
    title: string,
    userId?: string | null,
  ) {
    await delay()
    const maxOrder =
      checklistItems
        .filter((i) => i.building_id === buildingId)
        .reduce((max, i) => Math.max(max, i.sort_order), -1) + 1
    const item: ChecklistItem = {
      id: crypto.randomUUID(),
      building_id: buildingId,
      client_id: clientId,
      title,
      is_done: false,
      sort_order: maxOrder,
      created_at: now,
    }
    checklistItems.push(item)
    await demoStore.logActivity({
      clientId,
      action: 'checklist_item_added',
      description: `Dodano pozycję checklisty: „${title}"`,
      userId: userId ?? DEV_USER,
      entityId: item.id,
    })
    return item
  },

  async toggleChecklistItem(id: string, isDone: boolean, userId?: string | null) {
    await delay()
    const idx = checklistItems.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error('Pozycja checklisty nie znaleziona')
    checklistItems[idx] = { ...checklistItems[idx], is_done: isDone }
    const item = checklistItems[idx]
    await demoStore.logActivity({
      clientId: item.client_id,
      action: 'checklist_item_toggled',
      description: isDone
        ? `Oznaczono jako dostarczone: „${item.title}"`
        : `Cofnięto dostarczenie: „${item.title}"`,
      userId: userId ?? DEV_USER,
      entityId: item.id,
    })
    return item
  },

  async deleteChecklistItem(id: string) {
    await delay()
    checklistItems = checklistItems.filter((i) => i.id !== id)
  },

  async logActivity(params: LogActivityParams) {
    activityLog.unshift({
      id: crypto.randomUUID(),
      client_id: params.clientId,
      user_id: params.userId ?? DEV_USER,
      action: params.action,
      description: params.description,
      entity_id: params.entityId ?? null,
      created_at: new Date().toISOString(),
    })
  },

  async getActivityLog(clientId: string) {
    await delay()
    return activityLog
      .filter((a) => a.client_id === clientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(attachActivityUser)
  },

  async getUsers() {
    await delay()
    return [...profiles]
  },

  async updateUserRole(userId: string, role: UserRole) {
    await delay()
    const idx = profiles.findIndex((p) => p.id === userId)
    if (idx === -1) throw new Error('Użytkownik nie znaleziony')
    profiles[idx] = { ...profiles[idx], role }
  },

  async inviteUser(email: string, _password: string, fullName: string, role: UserRole) {
    await delay()
    profiles.push({
      id: crypto.randomUUID(),
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role,
      created_at: now,
    })
  },
}
