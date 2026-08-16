import Image from "next/image";
import { cn } from "@/lib/cn";

export default function PortraitPanel({
  src,
  alt,
  glowClass,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  glowClass?: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={cn("relative isolate", className)}>
      <div
        className={cn(
          "absolute inset-8 -z-10 rounded-full bg-gradient-to-br from-gold-400/20 via-white/10 to-lime-300/10 blur-3xl",
          glowClass
        )}
      />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent" />
        <Image
          src={src}
          alt={alt}
          width={640}
          height={760}
          className={cn("h-auto w-full object-contain", imageClassName)}
          priority={false}
        />
      </div>
    </div>
  );
}