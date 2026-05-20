import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "edit" | "danger" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[--color-primary] hover:bg-[--color-primary-hover] text-white",
  secondary: "bg-gray-100 hover:bg-gray-200 text-[--color-text]",
  edit: "border border-[--color-edit-btn] text-[--color-edit-btn] hover:bg-blue-50 bg-white",
  danger: "bg-[--color-danger] hover:bg-red-600 text-white",
  ghost: "bg-transparent hover:bg-gray-100 text-[--color-text]",
}

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-medium transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      style={{ borderRadius: 'var(--radius-button)' }}
      {...props}
    >
      {children}
    </button>
  )
}
