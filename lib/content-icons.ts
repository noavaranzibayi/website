import {
  Sparkles,
  Syringe,
  Wind,
  HeartPulse,
  Scissors,
  UserRound,
  Scale,
  Droplet,
  Activity,
  Zap,
  Stethoscope,
  Wand2,
  ScanFace,
  Award,
  FlaskConical,
  MessageCircleHeart,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  "hair-transplant": Scissors,
  carboxytherapy: Wind,
  microneedling: Syringe,
  "lipomatic-abdominal": HeartPulse,
  rhinoplasty: ScanFace,
  "hair-beard-transplant": UserRound,
  "skin-rejuvenation": Sparkles,
  "weight-loss": Scale,
  mesotherapy: Droplet,
  abdominoplasty: Activity,
  laser: Zap,
  "cosmetic-surgery": Stethoscope,
  "face-lift": Wand2,
};

export const WHY_US_ICONS: Record<string, LucideIcon> = {
  experience: Award,
  innovation: FlaskConical,
  consultation: MessageCircleHeart,
};
