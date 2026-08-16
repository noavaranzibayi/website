import { cn } from "@/lib/cn";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
type LogoSurface = "plain" | "dark";

const SIZE_MAP: Record<LogoSize, { width: number; height: number }> = {
  xs: { width: 34, height: 27 },
  sm: { width: 40, height: 32 },
  md: { width: 48, height: 39 },
  lg: { width: 58, height: 47 },
  xl: { width: 70, height: 56 },
  xxl: { width: 84, height: 67 },
};

export default function BrandLogo({
  alt,
  size = "md",
  surface = "plain",
  className,
}: {
  alt: string;
  size?: LogoSize;
  surface?: LogoSurface;
  className?: string;
  priority?: boolean;
}) {
  const dimensions = SIZE_MAP[size];
  const colorClass = surface === "dark" ? "bg-white" : "bg-navy-700 dark:bg-white";

  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("inline-block shrink-0", colorClass, className)}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        WebkitMaskImage: "url('/logo.svg')",
        maskImage: "url('/logo.svg')",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}