import { useState } from 'react'
import type { AvailabilitySlot } from '../lib/types'

interface Props {
  date: string
  slots: AvailabilitySlot[]
  selected: AvailabilitySlot | null
  onSelectDate: (date: string) => void
  onSelectSlot: (slot: AvailabilitySlot) => void
  loading: boolean
}

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function SlotPicker({ date, slots, selected, onSelectDate, onSelectSlot, loading }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [localDate, setLocalDate] = useState(date || today)

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalDate(e.target.value)
    onSelectDate(e.target.value)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pick a Date &amp; Time</h2>
      <input
        type="date"
        min={today}
        value={localDate}
        onChange={handleDateChange}
        className="border border-gray-200 rounded-lg p-2 mb-4 w-full text-base"
      />
      {loading && <p className="text-gray-500">Loading slots…</p>}
      {!loading && slots.length === 0 && localDate && (
        <p className="text-gray-500">No available slots for this date.</p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => {
          const key = `${slot.barber_id}-${slot.time}`
          const isSelected = selected?.time === slot.time && selected?.barber_id === slot.barber_id
          return (
            <button
              key={key}
              onClick={() => onSelectSlot(slot)}
              className={`border rounded-lg p-2 text-sm transition-colors ${
                isSelected
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-black'
              }`}
            >
              {formatTime(slot.time)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
