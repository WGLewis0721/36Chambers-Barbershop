interface CustomerInfo {
  name: string
  email: string
  phone: string
}

interface Props {
  value: CustomerInfo
  onChange: (info: CustomerInfo) => void
}

export default function BookingForm({ value, onChange }: Props) {
  function set(field: keyof CustomerInfo, v: string) {
    onChange({ ...value, [field]: v })
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Details</h2>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            value={value.name}
            onChange={(e) => set('name', e.target.value)}
            className="border border-gray-200 rounded-lg p-2 w-full text-base"
            placeholder="Jane Smith"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            value={value.email}
            onChange={(e) => set('email', e.target.value)}
            className="border border-gray-200 rounded-lg p-2 w-full text-base"
            placeholder="jane@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone (optional)</label>
          <input
            type="tel"
            value={value.phone}
            onChange={(e) => set('phone', e.target.value)}
            className="border border-gray-200 rounded-lg p-2 w-full text-base"
            placeholder="+1 555 000 0000"
          />
        </div>
      </div>
    </div>
  )
}
