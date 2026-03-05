import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { BusinessHours } from '../../lib/types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function HoursEditor() {
  const [hours, setHours] = useState<BusinessHours[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('business_hours').select('*').order('day_of_week').then(({ data }) => {
      if (data) setHours(data)
    })
  }, [])

  function update(day: number, field: keyof BusinessHours, value: string | number) {
    setHours(h => h.map(row => row.day_of_week === day ? { ...row, [field]: value } : row))
  }

  async function save() {
    setSaving(true)
    for (const row of hours) {
      await supabase
        .from('business_hours')
        .upsert(row, { onConflict: 'day_of_week' })
    }
    setSaving(false)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Business Hours</h2>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-2 text-gray-500 font-normal">Day</th>
              <th className="text-left px-4 py-2 text-gray-500 font-normal">Open</th>
              <th className="text-left px-4 py-2 text-gray-500 font-normal">Close</th>
              <th className="text-left px-4 py-2 text-gray-500 font-normal">Interval (min)</th>
              <th className="text-left px-4 py-2 text-gray-500 font-normal">Buffer (min)</th>
            </tr>
          </thead>
          <tbody>
            {hours.map(row => (
              <tr key={row.day_of_week} className="border-b border-gray-50">
                <td className="px-4 py-2 font-medium">{DAY_NAMES[row.day_of_week]}</td>
                <td className="px-4 py-2"><input type="time" value={row.open_time} onChange={e => update(row.day_of_week, 'open_time', e.target.value)} className="border border-gray-200 rounded p-1 text-sm" /></td>
                <td className="px-4 py-2"><input type="time" value={row.close_time} onChange={e => update(row.day_of_week, 'close_time', e.target.value)} className="border border-gray-200 rounded p-1 text-sm" /></td>
                <td className="px-4 py-2"><input type="number" value={row.slot_interval_minutes} onChange={e => update(row.day_of_week, 'slot_interval_minutes', parseInt(e.target.value))} className="border border-gray-200 rounded p-1 text-sm w-16" /></td>
                <td className="px-4 py-2"><input type="number" value={row.buffer_minutes} onChange={e => update(row.day_of_week, 'buffer_minutes', parseInt(e.target.value))} className="border border-gray-200 rounded p-1 text-sm w-16" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={save} disabled={saving} className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-40">
        {saving ? 'Saving…' : 'Save Hours'}
      </button>
    </div>
  )
}
