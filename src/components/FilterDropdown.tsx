"use client"
import { useState } from "react"

type FilterOption = { id: string; name: string }

interface Props {
  label: string
  options: FilterOption[]
  selected: string[]
  toggle: (id: string) => void
}

export default function FilterDropdown({ label, options, selected, toggle }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 border rounded bg-grandma-cream shadow"
      >
        {label} ▼
      </button>

      {open && (
        <div className="absolute mt-2 bg-white border rounded shadow-lg p-2 w-48 z-50">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 p-1">
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => toggle(opt.id)}
              />
              <span>{opt.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
