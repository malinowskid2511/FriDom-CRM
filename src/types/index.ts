export type UserRole = 'admin' | 'assistant'

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
  file_path: string | null
  file_name: string | null
  notes: string | null
  uploaded_by: string | null
  created_at: string
  building?: Building | null
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

export const ENERGY_CLASSES = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] as const
