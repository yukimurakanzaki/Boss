"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning"

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-[--color-success]" />,
  error: <XCircle size={18} className="text-[--color-danger]" />,
  warning: <AlertTriangle size={18} className="text-[--color-warning]" />,
}

const toastStyles: Record<ToastType, string> = {
  success: "border-[--color-success]/30 bg-green-50",
  error: "border-[--color-danger]/30 bg-red-50",
  warning: "border-[--color-warning]/30 bg-amber-50",
}

export function Toast({ message, type = "success", onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-md border shadow-lg text-sm",
        toastStyles[type],
        visible ? "opacity-100" : "opacity-0",
        "transition-opacity duration-300"
      )}
    >
      {toastIcons[type]}
      <span className="text-[--color-text]">{message}</span>
    </div>
  )
}