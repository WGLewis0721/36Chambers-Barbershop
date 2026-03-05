import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Service } from '../../lib/types'

export default function ServicesCrud() {
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState({ name: '', duration_minutes: 30, price_cents: '', active: true })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('services').select('*').order('name')
    if (data) setServices(data)
  }

  useEffect(() => { load() }, [])

  function startEdit(s: Service) {
    setEditId(s.id)
    setForm({ name: s.name, duration_minutes: s.duration_minutes, price_cents: s.price_cents != null ? String(s.price_cents) : '', active: s.active })
  }

  async function save() {
    setSaving(true)
    const payload = {
      name: form.name,
      duration_minutes: form.duration_minutes,
      price_cents: form.price_cents !== '' ? parseInt(form.price_cents) : null,
      active: form.active,
    }
    if (editId) {
      await supabase.from('services').update(payload).eq('id', editId)
    } else {
      await supabase.from('services').insert(payload)
    }
    setForm({ name: '', duration_minutes: 30, price_cents: '', active: true })
    setEditId(null)
    setSaving(false)
    load()
  }

  async function remove(id: string) {
    await supabase.from('services').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Services</h2>
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 grid gap-3">
        <input className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Service name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Duration (min)</label>
            <input type="number" className="border border-gray-200 rounded-lg p-2 text-sm w-full" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 30 }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Price (cents, optional)</label>
            <input type="number" className="border border-gray-200 rounded-lg p-2 text-sm w-full" placeholder="e.g. 3500" value={form.price_cents} onChange={e => setForm(f => ({ ...f, price_cents: e.target.value }))} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
          Active
        </label>
        <button onClick={save} disabled={!form.name || saving} className="bg-black text-white rounded-lg py-2 text-sm disabled:opacity-40">
          {editId ? 'Update Service' : 'Add Service'}
        </button>
        {editId && <button onClick={() => { setEditId(null); setForm({ name: '', duration_minutes: 30, price_cents: '', active: true }) }} className="text-sm text-gray-500">Cancel</button>}
      </div>
      <div className="grid gap-2">
        {services.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-gray-400">{s.duration_minutes} min {s.price_cents != null ? `· $${(s.price_cents/100).toFixed(2)}` : ''} {!s.active ? '· inactive' : ''}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(s)} className="text-gray-400 hover:text-black text-xs">Edit</button>
              <button onClick={() => remove(s.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
