"use client"

import { Button } from "./Button"
import { Search, X } from "lucide-react"

interface FilterField {
  key: string
  label: string
  type: "text" | "select"
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface FilterSectionProps {
  filters: FilterField[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onSearch: () => void
  onReset: () => void
}

export function FilterSection({ filters, values, onChange, onSearch, onReset }: FilterSectionProps) {
  const hasValues = Object.values(values).some(v => v !== "")

  return (
    <div className="flex flex-wrap gap-3 items-end p-4 bg-white border border-[--color-border] rounded-md mb-4">
      {filters.map(field => (
        <div key={field.key} className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-[--color-muted]">{field.label}</label>
          {field.type === "select" ? (
            <select
              value={values[field.key]}
              onChange={e => onChange(field.key, e.target.value)}
              className="border border-[--color-border] rounded px-3 py-2 text-sm text-[--color-text] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              <option value="">{field.placeholder ?? "Semua"}</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type === "text" ? "text" : field.type}
              value={values[field.key]}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={field.placeholder ?? ""}
              className="border border-[--color-border] rounded px-3 py-2 text-sm text-[--color-text] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/30"
              style={{ borderRadius: 'var(--radius-button)' }}
            />
          )}
        </div>
      ))}

      <div className="flex gap-2 ml-auto">
        {hasValues && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X size={14} /> Reset
          </Button>
        )}
        <Button variant="primary" size="sm" onClick={onSearch}>
          <Search size={14} /> Cari
        </Button>
      </div>
    </div>
  )
}
