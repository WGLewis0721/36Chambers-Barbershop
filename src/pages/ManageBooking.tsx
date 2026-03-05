import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { cancelBooking } from '../lib/api'
import type { Booking } from '../lib/types'

export default function ManageBooking() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function handleCancel() {
    if (!id) return
    setCancelling(true)
    setError(null)
    try {
      await cancelBooking(id, token)
      setCancelled(true)
      if (booking) setBooking({ ...booking, status: 'cancelled' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancellation failed')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  if (!booking) return <div className="min-h-screen flex items-center justify-center">Booking not found.</div>

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-8 sm:pt-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-6">Manage Booking</h1>
        <div className="border border-gray-100 rounded-xl p-4 space-y-2 text-sm mb-6">
          <div><span className="font-medium">Service:</span> {(booking.services as { name: string } | undefined)?.name}</div>
          <div><span className="font-medium">Barber:</span> {(booking.barbers as { name: string } | undefined)?.name}</div>
          <div><span className="font-medium">Date/Time:</span> {new Date(booking.start_ts).toLocaleString()}</div>
          <div>
            <span className="font-medium">Status:</span>{' '}
            <span className={booking.status === 'cancelled' ? 'text-red-500' : 'text-green-600'}>
              {booking.status}
            </span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {cancelled || booking.status === 'cancelled' ? (
          <p className="text-center text-gray-500">This booking has been cancelled.</p>
        ) : (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-red-600 transition-colors"
          >
            {cancelling ? 'Cancelling…' : 'Cancel Booking'}
          </button>
        )}

        <Link to="/book" className="block mt-4 text-center text-sm text-gray-400 hover:text-black">
          Book a new appointment
        </Link>
      </div>
    </div>
  )
}
