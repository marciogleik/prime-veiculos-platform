"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode } from "react";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function FloatingCard({ children, className, delay = 0 }: FloatingCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Mouse tilt spring
  const mouseX = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 20 });

  // Perspective transformations
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  // Shadow displacement
  const shadowX = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
  const shadowY = useTransform(mouseY, [-0.5, 0.5], [20, -20]);

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = event.clientX - rect.left;
    const mouseYPos = event.clientY - rect.top;
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
      animate={{
        y: [0, -12, 0],
        rotateZ: [0, 0.5, 0, -0.5, 0],
      }}
      transition={{
        duration: 6, // Stable duration for hydration
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <motion.div 
        style={{ 
          transform: "translateZ(50px)",
          boxShadow: useTransform(
            [shadowX, shadowY],
            ([sx, sy]) => `${sx}px ${sy}px 60px -20px rgba(0,0,0,0.15)`
          )
        }} 
        className="h-full rounded-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
