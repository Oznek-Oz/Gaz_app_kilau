import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm active:scale-95",
    secondary: "bg-blue-900 hover:bg-blue-800 text-white focus:ring-blue-700 shadow-sm active:scale-95",
    outline: "border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500 active:scale-95",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-400 active:scale-95",
    danger: "bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-400 active:scale-95",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5 gap-1.5",
    md: "text-base px-5 py-2.5 gap-2",
    lg: "text-lg px-7 py-3.5 gap-2.5",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Chargement...
        </>
      ) : children}
    </button>
  );
}
