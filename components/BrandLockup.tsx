import { cn } from "@/lib/cn";
import BrandLogo from "@/components/BrandLogo";

type LockupSize = "sm" | "md" | "lg" | "xl" | "xxl";
type LockupSurface = "plain" | "dark";

const LOCKUP_MAP: Record<
  LockupSize,
  {
    logo: "sm" | "md" | "lg" | "xl" | "xxl";
    title: string;
    subtitle: string;
    gap: string;
  }
> = {
  sm: {
    logo: "sm",
    title: "text-sm sm:text-base",
    subtitle: "text-[10px] sm:text-xs",
    gap: "gap-2.5",
  },
  md: {
    logo: "md",
    title: "text-base sm:text-lg",
    subtitle: "text-[11px] sm:text-xs",
    gap: "gap-3",
  },
  lg: {
    logo: "lg",
    title: "text-lg sm:text-xl",
    subtitle: "text-xs sm:text-sm",
    gap: "gap-3.5",
  },
  xl: {
    logo: "xl",
    title: "text-xl sm:text-2xl",
    subtitle: "text-sm sm:text-base",
    gap: "gap-4",
  },
  xxl: {
    logo: "xxl",
    title: "text-2xl sm:text-[2rem]",
    subtitle: "text-sm sm:text-lg",
    gap: "gap-[1.125rem]",
  },
};

export default function BrandLockup({
  size = "md",
  surface = "plain",
  showSubtitle = false,
  className,
  priority,
}: {
  size?: LockupSize;
  surface?: LockupSurface;
  showSubtitle?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const styles = LOCKUP_MAP[size];
  const titleClass = surface === "dark" ? "text-white" : "text-navy-800 dark:text-navy-100";
  const subtitleClass = surface === "dark" ? "text-navy-300" : "text-navy-500 dark:text-navy-400";

  return (
    <span className={cn("inline-flex items-center", styles.gap, className)}>
      <BrandLogo alt="نوآوران زیبایی" size={styles.logo} surface={surface} priority={priority} />
      <span className="flex min-w-0 flex-col">
        <span className={cn("truncate font-extrabold tracking-[0.01em]", styles.title, titleClass)}>
          نوآوران زیبایی
        </span>
        {showSubtitle && (
          <span className={cn("truncate font-medium", styles.subtitle, subtitleClass)}>
            Skin, Hair & Laser Clinic
          </span>
        )}
      </span>
    </span>
  );
}