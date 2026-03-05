import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Booking } from '../lib/types'

export default function Confirm() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('bookings')
      .select('*, barbers(name), services(name)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setBooking(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  if (!booking) return <div className="min-h-screen flex items-center justify-center">Booking not found.</div>

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="text-5xl mb-4">✂️</div>
        <h1 className="text-2xl font-bold mb-2">You're booked!</h1>
        <p className="text-gray-500 mb-6">A confirmation has been noted for {booking.customer_email}.</p>
        <div className="border border-gray-100 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
          <div><span className="font-medium">Service:</span> {(booking.services as { name: string } | undefined)?.name}</div>
          <div><span className="font-medium">Barber:</span> {(booking.barbers as { name: string } | undefined)?.name}</div>
          <div><span className="font-medium">Date/Time:</span> {new Date(booking.start_ts).toLocaleString()}</div>
          <div><span className="font-medium">Status:</span> {booking.status}</div>
        </div>
        {token && (
          <Link
            to={`/manage/${booking.id}?token=${token}`}
            className="block w-full border border-black text-black py-3 rounded-xl font-medium hover:bg-black hover:text-white transition-colors"
          >
            Manage / Cancel Booking
          </Link>
        )}
        <Link to="/book" className="block mt-3 text-sm text-gray-400 hover:text-black">
          Book another appointment
        </Link>
      </div>
    </div>
  )
}
