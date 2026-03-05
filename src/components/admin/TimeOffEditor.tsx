import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { TimeOff, Barber } from '../../lib/types'

interface Props {
  barbers: Barber[]
}

export default function TimeOffEditor({ barbers }: Props) {
  const [blocks, setBlocks] = useState<TimeOff[]>([])
  const [form, setForm] = useState({ barber_id: '', start_ts: '', end_ts: '', reason: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('time_off').select('*').order('start_ts')
    if (data) setBlocks(data)
  }

  useEffect(() => { load() }, [])

  async function add() {
    setSaving(true)
    await supabase.from('time_off').insert({
      barber_id: form.barber_id || null,
      start_ts: form.start_ts,
      end_ts: form.end_ts,
      reason: form.reason,
    })
    setForm({ barber_id: '', start_ts: '', end_ts: '', reason: '' })
    setSaving(false)
    load()
  }

  async function remove(id: string) {
    await supabase.from('time_off').delete().eq('id', id)
    load()
  }

  const barberName = (id: string | null) => id ? barbers.find(b => b.id === id)?.name ?? id : 'All barbers'

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Time Off / Blocks</h2>
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 grid gap-3">
        <select className="border border-gray-200 rounded-lg p-2 text-sm" value={form.barber_id} onChange={e => setForm(f => ({ ...f, barber_id: e.target.value }))}>
          <option value="">All barbers (shop closure)</option>
          {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Start</label>
            <input type="datetime-local" className="border border-gray-200 rounded-lg p-2 text-sm w-full" value={form.start_ts} onChange={e => setForm(f => ({ ...f, start_ts: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">End</label>
            <input type="datetime-local" className="border border-gray-200 rounded-lg p-2 text-sm w-full" value={form.end_ts} onChange={e => setForm(f => ({ ...f, end_ts: e.target.value }))} />
          </div>
        </div>
        <input className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Reason" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
        <button onClick={add} disabled={!form.start_ts || !form.end_ts || saving} className="bg-black text-white rounded-lg py-2 text-sm disabled:opacity-40">
          Add Block
        </button>
      </div>
      <div className="grid gap-2">
        {blocks.map(block => (
          <div key={block.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{barberName(block.barber_id)}</div>
              <div className="text-gray-400">{new Date(block.start_ts).toLocaleString()} – {new Date(block.end_ts).toLocaleString()}</div>
              {block.reason && <div className="text-gray-400">{block.reason}</div>}
            </div>
            <button onClick={() => remove(block.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
