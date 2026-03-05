export interface Barber {
  id: string
  name: string
  active: boolean
}

export interface Service {
  id: string
  name: string
  duration_minutes: number
  price_cents: number | null
  active: boolean
}

export interface BusinessHours {
  day_of_week: number
  open_time: string
  close_time: string
  slot_interval_minutes: number
  buffer_minutes: number
}

export interface BarberHours {
  barber_id: string
  day_of_week: number
  open_time: string
  close_time: string
}

export interface TimeOff {
  id: string
  barber_id: string | null
  start_ts: string
  end_ts: string
  reason: string
}

export interface Booking {
  id: string
  barber_id: string
  service_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  start_ts: string
  end_ts: string
  status: 'confirmed' | 'cancelled'
  manage_token: string
  created_at: string
  barbers?: Barber
  services?: Service
}

export interface AvailabilitySlot {
  time: string
  barber_id: string
  barber_name: string
}

export interface AvailabilityResponse {
  slots: AvailabilitySlot[]
}
