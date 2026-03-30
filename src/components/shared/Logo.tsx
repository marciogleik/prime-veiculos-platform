"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark" | "full-color";
}

export default function Logo({ className, variant = "full-color" }: LogoProps) {
  // carColor: #D21016 (Premium Red)
  const carColor = variant === "light" ? "white" : variant === "dark" ? "black" : "#D21016";
  const textColor = variant === "light" ? "white" : variant === "dark" ? "black" : "#1a1a1a";

  return (
    <div className={cn("flex flex-col items-start gap-0", className)}>
      <svg 
        viewBox="0 0 200 45" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-[40px] w-auto block overflow-visible"
        preserveAspectRatio="xMinYMid meet"
      >
        {/* Elite Supercar Silhouette - Hand-crafted Geometric Paths */}
        {/* Main Roof-to-Tail Curve */}
        <path 
          d="M10 32C15 32 35 28 55 12C75 -4 140 -4 165 12C185 24 195 32 200 32" 
          stroke={carColor} 
          strokeWidth="4.5" 
          strokeLinecap="round" 
        />
        {/* High-Speed Waist Flare */}
        <path 
          d="M30 38C60 36 90 35 120 35C150 35 180 36 190 38" 
          stroke={carColor} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          opacity="0.6"
        />
        {/* Accent Shadow Line */}
        <path 
          d="M60 42L150 42" 
          stroke={carColor} 
          strokeWidth="1" 
          strokeLinecap="round" 
          opacity="0.3"
        />
      </svg>
      
      {/* Brand Text Block - Optically Aligned */}
      <div className="flex flex-col -mt-2 pl-1.5">
        <span 
          className={cn(
            "text-3xl sm:text-4xl font-display font-black italic tracking-tighter leading-none uppercase select-none",
            variant === "light" ? "text-white" : "text-black"
          )}
          style={{ letterSpacing: "-0.06em" }}
        >
          PRIME
        </span>
        <span 
          className={cn(
            "text-[9px] sm:text-[11px] font-black tracking-[0.55em] leading-none uppercase -mt-1 select-none",
            variant === "light" ? "text-white/50" : "text-primary/90"
          )}
        >
          VEÍCULOS
        </span>
      </div>
    </div>
  );
}
