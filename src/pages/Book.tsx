import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { getAvailability, createBooking } from '../lib/api'
import type { Service, Barber, AvailabilitySlot } from '../lib/types'
import ServicePicker from '../components/ServicePicker'
import BarberPicker from '../components/BarberPicker'
import SlotPicker from '../components/SlotPicker'
import BookingForm from '../components/BookingForm'

type Step = 'service' | 'barber' | 'slot' | 'details' | 'confirm'

export default function Book() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('service')
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('services').select('*').eq('active', true).then(({ data }) => {
      if (data) setServices(data)
    })
    supabase.from('barbers').select('*').eq('active', true).then(({ data }) => {
      if (data) setBarbers(data)
    })
  }, [])

  useEffect(() => {
    if (step === 'slot' && selectedService && selectedBarber) {
      setSlotsLoading(true)
      setSlots([])
      getAvailability(date, selectedService, selectedBarber)
        .then((res) => setSlots(res.slots))
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false))
    }
  }, [step, date, selectedService, selectedBarber])

  async function handleSubmit() {
    if (!selectedService || !selectedBarber || !selectedSlot) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await createBooking({
        serviceId: selectedService,
        barberId: selectedSlot.barber_id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || undefined,
        startTs: selectedSlot.time,
      })
      navigate(`/confirm/${result.id}?token=${result.manage_token}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  const serviceObj = services.find((s) => s.id === selectedService)
  const slotBarberObj = barbers.find((b) => b.id === selectedSlot?.barber_id)

  const steps: Step[] = ['service', 'barber', 'slot', 'details', 'confirm']
  const stepIdx = steps.indexOf(step)

  function canNext() {
    if (step === 'service') return !!selectedService
    if (step === 'barber') return !!selectedBarber
    if (step === 'slot') return !!selectedSlot
    if (step === 'details') return !!customer.name && !!customer.email
    return false
  }

  function next() {
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
  }

  function back() {
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Book an Appointment</h1>
          <div className="flex gap-1 mt-3">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${i <= stepIdx ? 'bg-black' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {step === 'service' && (
          <ServicePicker services={services} selected={selectedService} onSelect={setSelectedService} />
        )}
        {step === 'barber' && (
          <BarberPicker barbers={barbers} selected={selectedBarber} onSelect={setSelectedBarber} />
        )}
        {step === 'slot' && (
          <SlotPicker
            date={date}
            slots={slots}
            selected={selectedSlot}
            onSelectDate={(d) => { setDate(d); setSelectedSlot(null) }}
            onSelectSlot={setSelectedSlot}
            loading={slotsLoading}
          />
        )}
        {step === 'details' && (
          <BookingForm value={customer} onChange={setCustomer} />
        )}
        {step === 'confirm' && selectedSlot && serviceObj && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Confirm Booking</h2>
            <div className="border border-gray-100 rounded-xl p-4 space-y-2 text-sm mb-4">
              <div><span className="font-medium">Service:</span> {serviceObj.name}</div>
              <div><span className="font-medium">Barber:</span> {slotBarberObj?.name ?? 'Any'}</div>
              <div><span className="font-medium">Date/Time:</span> {new Date(selectedSlot.time).toLocaleString()}</div>
              <div><span className="font-medium">Name:</span> {customer.name}</div>
              <div><span className="font-medium">Email:</span> {customer.email}</div>
              {customer.phone && <div><span className="font-medium">Phone:</span> {customer.phone}</div>}
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-black text-white py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {stepIdx > 0 ? (
            <button onClick={back} className="text-sm text-gray-500 hover:text-black">
              ← Back
            </button>
          ) : (
            <div />
          )}
          {step !== 'confirm' && (
            <button
              onClick={next}
              disabled={!canNext()}
              className="bg-black text-white px-5 py-2 rounded-xl text-sm disabled:opacity-40"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
