import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Barber } from '../../lib/types'

export default function BarbersCrud() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [form, setForm] = useState({ name: '', active: true })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('barbers').select('*').order('name')
    if (data) setBarbers(data)
  }

  useEffect(() => { load() }, [])

  function startEdit(b: Barber) {
    setEditId(b.id)
    setForm({ name: b.name, active: b.active })
  }

  async function save() {
    setSaving(true)
    const payload = { name: form.name, active: form.active }
    if (editId) {
      await supabase.from('barbers').update(payload).eq('id', editId)
    } else {
      await supabase.from('barbers').insert(payload)
    }
    setForm({ name: '', active: true })
    setEditId(null)
    setSaving(false)
    load()
  }

  async function remove(id: string) {
    await supabase.from('barbers').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Barbers</h2>
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 grid gap-3">
        <input className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Barber name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
          Active
        </label>
        <button onClick={save} disabled={!form.name || saving} className="bg-black text-white rounded-lg py-2 text-sm disabled:opacity-40">
          {editId ? 'Update Barber' : 'Add Barber'}
        </button>
        {editId && <button onClick={() => { setEditId(null); setForm({ name: '', active: true }) }} className="text-sm text-gray-500">Cancel</button>}
      </div>
      <div className="grid gap-2">
        {barbers.map(b => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{b.name}</div>
              {!b.active && <div className="text-gray-400 text-xs">inactive</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(b)} className="text-gray-400 hover:text-black text-xs">Edit</button>
              <button onClick={() => remove(b.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
