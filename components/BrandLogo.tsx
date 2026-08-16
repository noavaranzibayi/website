import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
type LogoSurface = "plain" | "dark";

const SIZE_MAP: Record<LogoSize, { width: number; height: number; frame: string }> = {
  xs: { width: 34, height: 27, frame: "h-11 w-11 p-1.5" },
  sm: { width: 40, height: 32, frame: "h-12 w-12 p-1.5" },
  md: { width: 48, height: 39, frame: "h-14 w-14 p-2" },
  lg: { width: 58, height: 47, frame: "h-16 w-16 p-2" },
  xl: { width: 70, height: 56, frame: "h-[4.5rem] w-[4.5rem] p-2" },
  xxl: { width: 84, height: 67, frame: "h-24 w-24 p-2.5" },
};

export default function BrandLogo({
  alt,
  size = "md",
  surface = "plain",
  className,
  priority,
}: {
  alt: string;
  size?: LogoSize;
  surface?: LogoSurface;
  className?: string;
  priority?: boolean;
}) {
  const dimensions = SIZE_MAP[size];

  if (surface === "dark") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/96 shadow-[0_14px_30px_rgba(15,23,42,0.18)] ring-1 ring-black/5",
          dimensions.frame,
          className
        )}
      >
        <Image
          src="/logo.svg"
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          priority={priority}
          className="h-auto w-full"
        />
      </span>
    );
  }

  return (
    <Image
      src="/logo.svg"
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={cn("h-auto", className)}
      style={{ width: `${dimensions.width}px` }}
    />
  );
}