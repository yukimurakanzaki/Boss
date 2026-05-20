import { cn } from "@/lib/utils"
import type { ElisStatus } from "@/lib/constants"

const statusColors: Record<ElisStatus, string> = {
  'Menunggu validasi': "bg-amber-100 text-amber-800 border-amber-200",
  'Revisi': "bg-orange-100 text-orange-800 border-orange-200",
  'Ditolak': "bg-red-100 text-red-800 border-red-200",
  'Menunggu persetujuan': "bg-blue-100 text-blue-800 border-blue-200",
  'Disetujui': "bg-emerald-100 text-emerald-800 border-emerald-200",
  'Sedang diproses': "bg-purple-100 text-purple-800 border-purple-200",
  'Selesai': "bg-green-100 text-green-800 border-green-200",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status as ElisStatus] ?? "bg-gray-100 text-gray-800 border-gray-200"
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
        className
      )}
    >
      {status}
    </span>
  )
}