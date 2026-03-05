import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import type { Booking, Barber } from '../../lib/types'
import BookingsBoard from '../../components/admin/BookingsBoard'
import ServicesCrud from '../../components/admin/ServicesCrud'
import BarbersCrud from '../../components/admin/BarbersCrud'
import HoursEditor from '../../components/admin/HoursEditor'
import TimeOffEditor from '../../components/admin/TimeOffEditor'

type Tab = 'bookings' | 'services' | 'barbers' | 'hours' | 'timeoff'

export default function Dashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/admin/login')
    })
  }, [navigate])

  useEffect(() => {
    supabase.from('barbers').select('*').then(({ data }) => {
      if (data) setBarbers(data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const startOfDay = `${date}T00:00:00`
    const endOfDay = `${date}T23:59:59`
    supabase
      .from('bookings')
      .select('*, barbers(name), services(name, duration_minutes)')
      .gte('start_ts', startOfDay)
      .lte('start_ts', endOfDay)
      .order('start_ts')
      .then(({ data }) => {
        if (data) setBookings(data)
        setLoading(false)
      })
  }, [date])

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'bookings', label: 'Bookings' },
    { key: 'services', label: 'Services' },
    { key: 'barbers', label: 'Barbers' },
    { key: 'hours', label: 'Hours' },
    { key: 'timeoff', label: 'Time Off' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">36Chambers Admin</h1>
        <button onClick={signOut} className="text-sm text-gray-500 hover:text-black">Sign out</button>
      </header>
      <div className="flex border-b border-gray-100 bg-white px-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm border-b-2 whitespace-nowrap transition-colors ${
              tab === t.key ? 'border-black font-medium' : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-6 max-w-6xl mx-auto">
        {tab === 'bookings' && (
          <BookingsBoard bookings={bookings} barbers={barbers} date={date} onDateChange={setDate} loading={loading} />
        )}
        {tab === 'services' && <ServicesCrud />}
        {tab === 'barbers' && <BarbersCrud />}
        {tab === 'hours' && <HoursEditor />}
        {tab === 'timeoff' && <TimeOffEditor barbers={barbers} />}
      </div>
    </div>
  )
}
