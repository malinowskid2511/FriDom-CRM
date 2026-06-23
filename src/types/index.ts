export type UserRole = 'admin' | 'assistant'

export type OrderStatus = 'waiting_for_data' | 'in_progress' | 'ready'

export type PaymentStatus = 'pending' | 'paid'

export type ActivityAction =
  | 'client_created'
  | 'client_updated'
  | 'order_status_changed'
  | 'building_added'
  | 'building_updated'
  | 'material_uploaded'
  | 'material_deleted'
  | 'checklist_item_added'
  | 'checklist_item_toggled'
  | 'certificate_uploaded'
  | 'certificate_pdf_sent'
  | 'certificate_payment_changed'
  | 'certificate_deleted'

export type BuildingType =
  | 'dom_jednorodzinny'
  | 'mieszkanie'
  | 'budynek_wielorodzinny'
  | 'inny'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  order_status: OrderStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Building {
  id: string
  client_id: string
  address: string
  building_type: BuildingType
  notes: string | null
  created_at: string
}

export interface Certificate {
  id: string
  client_id: string
  building_id: string | null
  certificate_number: string | null
  issue_date: string | null
  expiry_date: string | null
  energy_class: string | null
  cost: number | null
  payment_status: PaymentStatus
  pdf_sent_at: string | null
  file_path: string | null
  file_name: string | null
  notes: string | null
  uploaded_by: string | null
  created_at: string
  building?: Building | null
}

export interface ChecklistItem {
  id: string
  building_id: string
  client_id: string
  title: string
  is_done: boolean
  sort_order: number
  created_at: string
}

export interface ActivityLogEntry {
  id: string
  client_id: string
  user_id: string | null
  action: ActivityAction
  description: string
  entity_id: string | null
  created_at: string
  user?: Pick<Profile, 'full_name' | 'email'> | null
}

export interface ClientFormData {
  name: string
  email: string
  phone: string
  notes: string
}

export interface BuildingFormData {
  address: string
  building_type: BuildingType
  notes: string
}

export interface BuildingMaterial {
  id: string
  building_id: string
  client_id: string
  title: string
  file_path: string
  file_name: string
  mime_type: string | null
  notes: string | null
  uploaded_by: string | null
  created_at: string
}

export interface BuildingMaterialFormData {
  title: string
  notes: string
}

export const BUILDING_MATERIAL_PRESETS = [
  'Rzut budynku',
  'Informacje ze spółdzielni',
  'Dokumentacja techniczna',
  'Zdjęcia budynku',
] as const

export interface CertificateFormData {
  building_id: string
  certificate_number: string
  issue_date: string
  expiry_date: string
  energy_class: string
  cost: string
  notes: string
}

export interface DashboardStats {
  clientsCount: number
  certificatesCount: number
  expiringCount: number
}

export interface RecentCertificate {
  id: string
  client_id: string
  created_at: string
  client_name: string
  address: string | null
  cost: number | null
}

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  dom_jednorodzinny: 'Dom jednorodzinny',
  mieszkanie: 'Mieszkanie',
  budynek_wielorodzinny: 'Budynek wielorodzinny',
  inny: 'Inny',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  waiting_for_data: 'Czeka na dane',
  in_progress: 'W realizacji',
  ready: 'Gotowe',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Oczekuje',
  paid: 'Opłacone',
}

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  client_created: 'Nowy klient',
  client_updated: 'Aktualizacja klienta',
  order_status_changed: 'Zmiana statusu zlecenia',
  building_added: 'Dodano budynek',
  building_updated: 'Aktualizacja budynku',
  material_uploaded: 'Dodano materiał',
  material_deleted: 'Usunięto materiał',
  checklist_item_added: 'Pozycja checklisty',
  checklist_item_toggled: 'Checklista',
  certificate_uploaded: 'Dodano certyfikat',
  certificate_pdf_sent: 'Wysłano PDF',
  certificate_payment_changed: 'Status płatności',
  certificate_deleted: 'Usunięto certyfikat',
}

export const ENERGY_CLASSES = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] as const
