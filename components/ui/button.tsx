"use client"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center transition-all duration-200 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
  const variantStyles = variant === "default" 
    ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-400 hover:to-blue-400 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
    : "border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500"

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    />
  )
} 