import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { demoMode } from '@/lib/config'
import { demoStore } from '@/lib/demo-store'
import { sumEarnings, yearsFromCertificates, type EarningsSummary } from '@/lib/earnings'
import { parseCost } from '@/lib/format'
import { logActivity } from '@/lib/activity-log'
import type {
  Certificate,
  CertificateFormData,
  PaymentStatus,
  RecentCertificate,
} from '@/types'
import { PAYMENT_STATUS_LABELS } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export function useCertificates() {
  const certificates = ref<Certificate[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCertificates(clientId: string) {
    loading.value = true
    error.value = null
    try {
      if (demoMode) {
        certificates.value = await demoStore.getCertificates(clientId)
      } else {
        const { data, error: fetchError } = await supabase
          .from('certificates')
          .select('*, building:buildings(*)')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
        if (fetchError) throw fetchError
        certificates.value = (data ?? []) as Certificate[]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Błąd pobierania'
    } finally {
      loading.value = false
    }
  }

  async function uploadCertificate(
    clientId: string,
    form: CertificateFormData,
    file: File,
    userId: string | undefined,
  ) {
    if (file.type !== 'application/pdf') {
      throw new Error('Dozwolone są tylko pliki PDF')
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Plik jest za duży (maks. 10 MB)')
    }

    if (demoMode) return demoStore.uploadCertificate(clientId, form, file)

    const { data: certRow, error: insertError } = await supabase
      .from('certificates')
      .insert({
        client_id: clientId,
        building_id: form.building_id || null,
        certificate_number: form.certificate_number.trim() || null,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
        energy_class: form.energy_class || null,
        cost: parseCost(form.cost),
        notes: form.notes.trim() || null,
        uploaded_by: userId ?? null,
      })
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)

    const cert = certRow as Certificate
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${clientId}/${cert.id}/${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, file, { upsert: false })

    if (uploadError) {
      await supabase.from('certificates').delete().eq('id', cert.id)
      throw new Error(uploadError.message)
    }

    const { data: updated, error: updateError } = await supabase
      .from('certificates')
      .update({ file_path: filePath, file_name: file.name })
      .eq('id', cert.id)
      .select('*, building:buildings(*)')
      .single()

    if (updateError) {
      await supabase.storage.from('certificates').remove([filePath])
      await supabase.from('certificates').delete().eq('id', cert.id)
      throw new Error(updateError.message)
    }

    const label = form.certificate_number.trim() || 'certyfikat'
    await logActivity({
      clientId,
      action: 'certificate_uploaded',
      description: `Dodano certyfikat ${label}`,
      userId,
      entityId: cert.id,
    })

    return updated as Certificate
  }

  async function downloadCertificate(cert: Certificate) {
    if (demoMode) {
      alert(`Tryb podglądu — plik „${cert.file_name ?? 'certyfikat.pdf'}” jest symulowany.`)
      return
    }
    if (!cert.file_path) throw new Error('Brak pliku certyfikatu')

    const { data, error: downloadError } = await supabase.storage
      .from('certificates')
      .createSignedUrl(cert.file_path, 60)

    if (downloadError) throw new Error(downloadError.message)
    if (!data?.signedUrl) throw new Error('Nie udało się wygenerować linku')

    const link = document.createElement('a')
    link.href = data.signedUrl
    link.download = cert.file_name ?? 'certyfikat.pdf'
    link.target = '_blank'
    link.click()
  }

  async function deleteCertificate(cert: Certificate, userId?: string | null) {
    if (demoMode) return demoStore.deleteCertificate(cert.id)

    if (cert.file_path) {
      await supabase.storage.from('certificates').remove([cert.file_path])
    }

    const { error: deleteError } = await supabase
      .from('certificates')
      .delete()
      .eq('id', cert.id)

    if (deleteError) throw new Error(deleteError.message)

    const label = cert.certificate_number ?? 'certyfikat'
    await logActivity({
      clientId: cert.client_id,
      action: 'certificate_deleted',
      description: `Usunięto certyfikat ${label}`,
      userId,
      entityId: cert.id,
    })
  }

  async function getCertificatesCount(): Promise<number> {
    if (demoMode) return (await demoStore.getStats()).certificatesCount
    const { count, error: countError } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })
    if (countError) throw new Error(countError.message)
    return count ?? 0
  }

  async function getRecentCertificates(limit = 10): Promise<RecentCertificate[]> {
    if (demoMode) return demoStore.getRecentCertificates(limit)

    const { data, error: fetchError } = await supabase
      .from('certificates')
      .select('id, client_id, created_at, cost, client:clients(name), building:buildings(address)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (fetchError) throw new Error(fetchError.message)

    return (data ?? []).map((row) => {
      const client = row.client as { name: string } | { name: string }[] | null
      const building = row.building as { address: string } | { address: string }[] | null
      const clientName = Array.isArray(client) ? client[0]?.name : client?.name
      const address = Array.isArray(building) ? building[0]?.address : building?.address
      return {
        id: row.id as string,
        client_id: row.client_id as string,
        created_at: row.created_at as string,
        client_name: clientName ?? '—',
        address: address ?? null,
        cost: row.cost != null ? Number(row.cost) : null,
      }
    })
  }

  async function updateCertificateCost(id: string, cost: number | null) {
    if (demoMode) return demoStore.updateCertificateCost(id, cost)

    const { data, error: updateError } = await supabase
      .from('certificates')
      .update({ cost })
      .eq('id', id)
      .select('*, building:buildings(*)')
      .single()

    if (updateError) throw new Error(updateError.message)
    return data as Certificate
  }

  async function fetchEarningsRows() {
    if (demoMode) return demoStore.getEarningsCertificates()

    const { data, error: fetchError } = await supabase
      .from('certificates')
      .select('cost, issue_date, created_at')

    if (fetchError) throw new Error(fetchError.message)
    return (data ?? []).map((row) => ({
      cost: row.cost != null ? Number(row.cost) : null,
      issue_date: row.issue_date as string | null,
      created_at: row.created_at as string,
    }))
  }

  async function getEarningsSummary(year: number, month: number | null): Promise<EarningsSummary> {
    const rows = await fetchEarningsRows()
    return sumEarnings(rows, year, month)
  }

  async function getEarningsYears(): Promise<number[]> {
    const rows = await fetchEarningsRows()
    return yearsFromCertificates(rows)
  }

  async function updateCertificatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    userId?: string | null,
  ) {
    if (demoMode) return demoStore.updateCertificatePaymentStatus(id, paymentStatus, userId)

    const { data, error: updateError } = await supabase
      .from('certificates')
      .update({ payment_status: paymentStatus })
      .eq('id', id)
      .select('*, building:buildings(*)')
      .single()

    if (updateError) throw new Error(updateError.message)

    const cert = data as Certificate
    await logActivity({
      clientId: cert.client_id,
      action: 'certificate_payment_changed',
      description: `Płatność: ${PAYMENT_STATUS_LABELS[paymentStatus]}`,
      userId,
      entityId: id,
    })

    return cert
  }

  async function markCertificatePdfSent(id: string, userId?: string | null) {
    if (demoMode) return demoStore.markCertificatePdfSent(id, userId)

    const sentAt = new Date().toISOString()
    const { data, error: updateError } = await supabase
      .from('certificates')
      .update({ pdf_sent_at: sentAt })
      .eq('id', id)
      .select('*, building:buildings(*)')
      .single()

    if (updateError) throw new Error(updateError.message)

    const cert = data as Certificate
    const label = cert.certificate_number ?? 'certyfikat'
    await logActivity({
      clientId: cert.client_id,
      action: 'certificate_pdf_sent',
      description: `Wysłano PDF certyfikatu ${label}`,
      userId,
      entityId: id,
    })

    return cert
  }

  async function getExpiringCount(days = 90): Promise<number> {
    if (demoMode) return (await demoStore.getStats()).expiringCount
    const future = new Date()
    future.setDate(future.getDate() + days)
    const today = new Date().toISOString().split('T')[0]
    const futureStr = future.toISOString().split('T')[0]

    const { count, error: countError } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })
      .gte('expiry_date', today)
      .lte('expiry_date', futureStr)

    if (countError) throw new Error(countError.message)
    return count ?? 0
  }

  return {
    certificates,
    loading,
    error,
    fetchCertificates,
    uploadCertificate,
    downloadCertificate,
    deleteCertificate,
    getCertificatesCount,
    getExpiringCount,
    getRecentCertificates,
    updateCertificateCost,
    updateCertificatePaymentStatus,
    markCertificatePdfSent,
    getEarningsSummary,
    getEarningsYears,
  }
}
