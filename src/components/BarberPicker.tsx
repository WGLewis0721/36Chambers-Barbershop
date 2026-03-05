import type { Barber } from '../lib/types'

interface Props {
  barbers: Barber[]
  selected: string | null
  onSelect: (id: string) => void
}

export default function BarberPicker({ barbers, selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Choose a Barber</h2>
      <div className="grid gap-3">
        <button
          onClick={() => onSelect('any')}
          className={`text-left border rounded-xl p-4 transition-colors ${
            selected === 'any'
              ? 'border-black bg-black text-white'
              : 'border-gray-200 hover:border-black'
          }`}
        >
          <div className="font-medium">Any Barber</div>
          <div className="text-sm mt-1 opacity-70">First available</div>
        </button>
        {barbers.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className={`text-left border rounded-xl p-4 transition-colors ${
              selected === b.id
                ? 'border-black bg-black text-white'
                : 'border-gray-200 hover:border-black'
            }`}
          >
            <div className="font-medium">{b.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
