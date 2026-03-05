import type { Booking, Barber } from '../../lib/types'

interface Props {
  bookings: Booking[]
  barbers: Barber[]
  date: string
  onDateChange: (date: string) => void
  loading: boolean
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function BookingsBoard({ bookings, barbers, date, onDateChange, loading }: Props) {
  const activeBarbers = barbers.filter((b) => b.active)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold">Bookings</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="border border-gray-200 rounded-lg p-2 text-sm"
        />
      </div>
      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && (
        <div className="overflow-x-auto">
          <div className="grid gap-4 min-w-[320px]" style={{ gridTemplateColumns: `repeat(${activeBarbers.length || 1}, minmax(200px, 1fr))` }}>
          {activeBarbers.map((barber) => {
            const barberBookings = bookings.filter((b) => b.barber_id === barber.id)
            return (
              <div key={barber.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 font-medium text-sm">{barber.name}</div>
                {barberBookings.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-gray-400">No bookings</p>
                ) : (
                  barberBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`px-4 py-3 border-b border-gray-50 text-sm ${
                        b.status === 'cancelled' ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="font-medium">
                        {formatTime(b.start_ts)} – {formatTime(b.end_ts)}
                      </div>
                      <div className="text-gray-500">{b.customer_name}</div>
                      <div className="text-gray-400">{(b.services as { name: string } | undefined)?.name}</div>
                      {b.status === 'cancelled' && (
                        <span className="text-xs text-red-400">cancelled</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )
          })}
          </div>
        </div>
      )}
    </div>
  )
}
