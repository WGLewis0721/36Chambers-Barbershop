import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const date = url.searchParams.get('date')
    const serviceId = url.searchParams.get('serviceId')
    const barberId = url.searchParams.get('barberId')

    if (!date || !serviceId || !barberId) {
      return new Response(JSON.stringify({ message: 'date, serviceId, barberId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get service duration
    const { data: service } = await supabase.from('services').select('duration_minutes').eq('id', serviceId).single()
    if (!service) {
      return new Response(JSON.stringify({ message: 'Service not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const durationMs = service.duration_minutes * 60_000

    // Day of week for the requested date
    const requestedDate = new Date(date + 'T00:00:00Z')
    const dayOfWeek = requestedDate.getUTCDay()

    // Get business hours for the day
    const { data: bh } = await supabase.from('business_hours').select('*').eq('day_of_week', dayOfWeek).single()
    if (!bh || bh.open_time === bh.close_time) {
      return new Response(JSON.stringify({ slots: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const intervalMs = bh.slot_interval_minutes * 60_000
    const bufferMs = bh.buffer_minutes * 60_000

    // Build open/close timestamps for the given date (using local-naive, treating input date as local)
    const openTs = new Date(`${date}T${bh.open_time}:00`)
    const closeTs = new Date(`${date}T${bh.close_time}:00`)

    // Determine which barbers to check
    let barbersToCheck: { id: string; name: string }[] = []
    if (barberId === 'any') {
      const { data: allBarbers } = await supabase.from('barbers').select('id, name').eq('active', true)
      barbersToCheck = allBarbers ?? []
    } else {
      const { data: b } = await supabase.from('barbers').select('id, name').eq('id', barberId).single()
      if (b) barbersToCheck = [b]
    }

    if (barbersToCheck.length === 0) {
      return new Response(JSON.stringify({ slots: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch existing confirmed bookings for the day (for all barbers we care about)
    const barberIds = barbersToCheck.map(b => b.id)
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('barber_id, start_ts, end_ts')
      .in('barber_id', barberIds)
      .eq('status', 'confirmed')
      .gte('start_ts', `${date}T00:00:00`)
      .lte('start_ts', `${date}T23:59:59`)

    // Fetch time_off blocks that overlap the day (barber-specific and shop-wide)
    const dayStart = `${date}T00:00:00`
    const dayEnd = `${date}T23:59:59`
    const { data: timeOffBlocks } = await supabase
      .from('time_off')
      .select('barber_id, start_ts, end_ts')
      .or(`barber_id.in.(${barberIds.join(',')}),barber_id.is.null`)
      .lt('start_ts', dayEnd)
      .gt('end_ts', dayStart)

    // Fetch barber-specific hours for the day upfront (avoid N×M queries inside the slot loop)
    const { data: allBarberHours } = await supabase
      .from('barber_hours')
      .select('barber_id, open_time, close_time')
      .in('barber_id', barberIds)
      .eq('day_of_week', dayOfWeek)

    const barberHoursMap = new Map(
      (allBarberHours ?? []).map(bhr => [bhr.barber_id, bhr])
    )

    const now = new Date()

    // Helper: check if a barber is free for [slotStart, slotEnd)
    function isBarberFree(bid: string, slotStart: Date, slotEnd: Date): boolean {
      // Check time_off blocks
      for (const block of (timeOffBlocks ?? [])) {
        if (block.barber_id !== null && block.barber_id !== bid) continue
        const blockStart = new Date(block.start_ts)
        const blockEnd = new Date(block.end_ts)
        if (slotStart < blockEnd && slotEnd > blockStart) return false
      }
      // Check existing bookings (with buffer)
      for (const booking of (existingBookings ?? [])) {
        if (booking.barber_id !== bid) continue
        const bookingStart = new Date(booking.start_ts)
        const bookingEnd = new Date(booking.end_ts)
        // Add buffer around existing booking
        const busyStart = new Date(bookingStart.getTime() - bufferMs)
        const busyEnd = new Date(bookingEnd.getTime() + bufferMs)
        if (slotStart < busyEnd && slotEnd > busyStart) return false
      }
      return true
    }

    // Build candidate slots and check each barber
    const slots: { time: string; barber_id: string; barber_name: string }[] = []
    let cursor = openTs.getTime()
    const closeTime = closeTs.getTime()

    while (cursor + durationMs <= closeTime) {
      const slotStart = new Date(cursor)
      const slotEnd = new Date(cursor + durationMs)

      // Skip slots in the past
      if (slotStart <= now) {
        cursor += intervalMs
        continue
      }

      for (const barber of barbersToCheck) {
        // Check barber-specific hours using the pre-fetched map
        const barberHours = barberHoursMap.get(barber.id)
        if (barberHours) {
          const bOpen = new Date(`${date}T${barberHours.open_time}:00`)
          const bClose = new Date(`${date}T${barberHours.close_time}:00`)
          if (slotStart < bOpen || slotEnd > bClose) continue
        }

        if (isBarberFree(barber.id, slotStart, slotEnd)) {
          slots.push({ time: slotStart.toISOString(), barber_id: barber.id, barber_name: barber.name })
          // For "any" barber: only add one slot per time (first available barber)
          if (barberId === 'any') break
        }
      }

      cursor += intervalMs
    }

    return new Response(JSON.stringify({ slots }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ message: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
