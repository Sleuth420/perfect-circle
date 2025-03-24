"use client"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center transition-colors"
  const variantStyles = variant === "default" 
    ? "bg-white text-black hover:bg-gray-200"
    : "border border-white text-white hover:bg-gray-800"

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    />
  )
} 