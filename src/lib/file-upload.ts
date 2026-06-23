export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const BUILDING_MATERIAL_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const BUILDING_MATERIAL_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,application/pdf,image/jpeg,image/png,image/webp'

const EXTENSION_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export function resolveMimeType(file: File): string {
  if (file.type) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext ? (EXTENSION_MIME[ext] ?? '') : ''
}

export function validateBuildingMaterialFile(file: File): string | null {
  const mime = resolveMimeType(file)
  if (!mime || !BUILDING_MATERIAL_MIME_TYPES.includes(mime as (typeof BUILDING_MATERIAL_MIME_TYPES)[number])) {
    return 'Dozwolone: PDF, JPG, PNG, WEBP, DOC, DOCX'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Plik jest za duży (maks. 10 MB)'
  }
  return null
}
