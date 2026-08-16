"use client";

import Image, { type ImageProps } from "next/image";
import { motion } from "framer-motion";

export default function FloatImage({
  className,
  imageClassName = "h-auto w-full object-contain",
  glowClassName,
  amplitude = 10,
  duration = 4,
  delay = 0,
  ...props
}: Omit<ImageProps, "className"> & {
  className?: string;
  imageClassName?: string;
  glowClassName?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {glowClassName && (
        <div className={glowClassName} />
      )}
      <motion.div
        className="h-full w-full"
        animate={{ y: [0, -amplitude, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image className={imageClassName} {...props} />
      </motion.div>
    </motion.div>
  );
}
