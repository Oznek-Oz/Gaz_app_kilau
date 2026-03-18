import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, padding = "md", hover = false, onClick }: CardProps) {
  const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-8" };
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100",
        paddings[padding],
        hover && "hover:shadow-md transition-shadow duration-200 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
