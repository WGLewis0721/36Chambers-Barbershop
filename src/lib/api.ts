import { supabase } from './supabaseClient'
import type { AvailabilityResponse } from './types'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : ''

async function callEdgeFunction(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  }
  const res = await fetch(`${FUNCTIONS_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> | undefined) } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

export async function getAvailability(date: string, serviceId: string, barberId: string): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({ date, serviceId, barberId })
  return callEdgeFunction(`/availability?${params.toString()}`, { method: 'GET' })
}

export async function createBooking(payload: {
  serviceId: string
  barberId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  startTs: string
}) {
  return callEdgeFunction('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function cancelBooking(bookingId: string, manageToken: string) {
  return callEdgeFunction('/bookings/cancel', {
    method: 'POST',
    body: JSON.stringify({ bookingId, manageToken }),
  })
}
