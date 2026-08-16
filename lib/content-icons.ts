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

export const SERVICE_IMAGES: Record<string, string> = {
  "hair-transplant": "/services/hair-transplant.png",
  carboxytherapy: "/services/carboxytherapy.png",
  microneedling: "/services/microneedling.png",
  "lipomatic-abdominal": "/services/lipomatic-abdominal.png",
  rhinoplasty: "/services/rhinoplasty.png",
  "hair-beard-transplant": "/services/hair-beard-transplant.png",
  "skin-rejuvenation": "/services/skin-rejuvenation.png",
  "weight-loss": "/services/weight-loss.png",
  mesotherapy: "/services/mesotherapy.png",
  abdominoplasty: "/services/abdominoplasty.png",
  laser: "/services/laser.png",
  "cosmetic-surgery": "/services/cosmetic-surgery.png",
  "face-lift": "/services/face-lift.png",
};
