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
    const body = await req.json()
    const { serviceId, barberId, customerName, customerEmail, customerPhone, startTs } = body

    if (!serviceId || !barberId || !customerName || !customerEmail || !startTs) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return new Response(JSON.stringify({ message: 'Invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get service
    const { data: service } = await supabase.from('services').select('duration_minutes').eq('id', serviceId).eq('active', true).single()
    if (!service) {
      return new Response(JSON.stringify({ message: 'Service not found or inactive' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get barber (resolve "any" to first available)
    let resolvedBarberId = barberId
    if (barberId === 'any') {
      const { data: barbers } = await supabase.from('barbers').select('id').eq('active', true).order('name')
      if (!barbers || barbers.length === 0) {
        return new Response(JSON.stringify({ message: 'No barbers available' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      resolvedBarberId = barbers[0].id
    }

    const startTime = new Date(startTs)
    const endTime = new Date(startTime.getTime() + service.duration_minutes * 60_000)

    // Get buffer
    const dayOfWeek = startTime.getUTCDay()
    const { data: bh } = await supabase.from('business_hours').select('buffer_minutes').eq('day_of_week', dayOfWeek).single()
    const bufferMs = (bh?.buffer_minutes ?? 5) * 60_000

    // Check for conflicts (with buffer around existing bookings)
    const bufferedStart = new Date(startTime.getTime() - bufferMs)
    const bufferedEnd = new Date(endTime.getTime() + bufferMs)
    const { data: bufferConflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('barber_id', resolvedBarberId)
      .eq('status', 'confirmed')
      .lt('start_ts', bufferedEnd.toISOString())
      .gt('end_ts', bufferedStart.toISOString())

    if (bufferConflicts && bufferConflicts.length > 0) {
      return new Response(JSON.stringify({ message: 'Slot no longer available' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check time_off
    const { data: timeOff } = await supabase
      .from('time_off')
      .select('id')
      .or(`barber_id.eq.${resolvedBarberId},barber_id.is.null`)
      .lt('start_ts', endTime.toISOString())
      .gt('end_ts', startTime.toISOString())

    if (timeOff && timeOff.length > 0) {
      return new Response(JSON.stringify({ message: 'Barber is not available at that time' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate manage token
    const manageToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

    // Insert booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        barber_id: resolvedBarberId,
        service_id: serviceId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone ?? null,
        start_ts: startTime.toISOString(),
        end_ts: endTime.toISOString(),
        status: 'confirmed',
        manage_token: manageToken,
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ id: booking.id, manage_token: booking.manage_token }), {
      status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ message: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
