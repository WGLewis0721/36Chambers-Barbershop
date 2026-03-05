import type { Service } from '../lib/types'

interface Props {
  services: Service[]
  selected: string | null
  onSelect: (id: string) => void
}

export default function ServicePicker({ services, selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Choose a Service</h2>
      <div className="grid gap-3">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`text-left border rounded-xl p-4 transition-colors ${
              selected === s.id
                ? 'border-black bg-black text-white'
                : 'border-gray-200 hover:border-black'
            }`}
          >
            <div className="font-medium">{s.name}</div>
            <div className="text-sm mt-1 opacity-70">
              {s.duration_minutes} min
              {s.price_cents != null ? ` · $${(s.price_cents / 100).toFixed(2)}` : ''}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
