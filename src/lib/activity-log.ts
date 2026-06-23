import { supabase } from '@/lib/supabase'
import { demoMode } from '@/lib/config'
import { demoStore } from '@/lib/demo-store'
import type { ActivityAction } from '@/types'

export interface LogActivityParams {
  clientId: string
  action: ActivityAction
  description: string
  userId?: string | null
  entityId?: string | null
}

export async function logActivity(params: LogActivityParams) {
  if (demoMode) {
    return demoStore.logActivity(params)
  }

  const { error } = await supabase.from('activity_log').insert({
    client_id: params.clientId,
    user_id: params.userId ?? null,
    action: params.action,
    description: params.description,
    entity_id: params.entityId ?? null,
  })

  if (error) throw new Error(error.message)
}
