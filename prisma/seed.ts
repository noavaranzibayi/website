import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type PermissionModule, type PermissionAction } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ROLES = [
  { name: "SUPER_ADMIN" as const, label: "Super Admin", description: "Full, unrestricted access to every module." },
  { name: "ADMIN" as const, label: "Admin", description: "Access to the modules and actions granted by a Super Admin." },
  { name: "USER" as const, label: "User", description: "Regular customer account — manages their own profile and appointments." },
];

// The full permission catalog. Not every module needs every action, so this
// is an explicit list rather than a full module x action cross-product.
const PERMISSIONS: { module: PermissionModule; action: PermissionAction }[] = [
  { module: "DASHBOARD", action: "VIEW" },

  { module: "USERS", action: "VIEW" },
  { module: "USERS", action: "CREATE" },
  { module: "USERS", action: "EDIT" },
  { module: "USERS", action: "DELETE" },
  { module: "USERS", action: "EXPORT" },
  { module: "USERS", action: "MANAGE" },

  { module: "ADMINS", action: "VIEW" },
  { module: "ADMINS", action: "CREATE" },
  { module: "ADMINS", action: "EDIT" },
  { module: "ADMINS", action: "DELETE" },
  { module: "ADMINS", action: "MANAGE" },

  { module: "ROLES", action: "VIEW" },
  { module: "ROLES", action: "MANAGE" },

  { module: "APPOINTMENTS", action: "VIEW" },
  { module: "APPOINTMENTS", action: "CREATE" },
  { module: "APPOINTMENTS", action: "EDIT" },
  { module: "APPOINTMENTS", action: "DELETE" },
  { module: "APPOINTMENTS", action: "APPROVE" },
  { module: "APPOINTMENTS", action: "MANAGE" },
  { module: "APPOINTMENTS", action: "EXPORT" },

  { module: "NOTIFICATIONS", action: "VIEW" },
  { module: "NOTIFICATIONS", action: "MANAGE" },

  { module: "AUDIT_LOG", action: "VIEW" },
  { module: "AUDIT_LOG", action: "EXPORT" },

  { module: "SETTINGS", action: "VIEW" },
  { module: "SETTINGS", action: "MANAGE" },

  { module: "SERVICES", action: "VIEW" },
  { module: "SERVICES", action: "CREATE" },
  { module: "SERVICES", action: "EDIT" },
  { module: "SERVICES", action: "DELETE" },
];

// Default grants for the ADMIN role. Super Admin can add per-admin overrides
// on top of this baseline from the panel; SUPER_ADMIN itself always bypasses
// the permission table entirely in code (see lib/permissions.ts), but we
// still seed it full grants here for data consistency.
const ADMIN_DEFAULT_GRANTS: { module: PermissionModule; action: PermissionAction }[] = [
  { module: "DASHBOARD", action: "VIEW" },
  { module: "USERS", action: "VIEW" },
  { module: "USERS", action: "EDIT" },
  { module: "APPOINTMENTS", action: "VIEW" },
  { module: "APPOINTMENTS", action: "CREATE" },
  { module: "APPOINTMENTS", action: "EDIT" },
  { module: "APPOINTMENTS", action: "APPROVE" },
  { module: "APPOINTMENTS", action: "MANAGE" },
  { module: "NOTIFICATIONS", action: "VIEW" },
  { module: "SERVICES", action: "VIEW" },
  { module: "SERVICES", action: "CREATE" },
  { module: "SERVICES", action: "EDIT" },
  { module: "SERVICES", action: "DELETE" },
];

const SERVICES_SEED: {
  slug: string;
  image: string;
  order: number;
  fa: { tag: string; title: string; description: string };
  en: { tag: string; title: string; description: string };
  ar: { tag: string; title: string; description: string };
}[] = [
  {
    slug: "hair-transplant",
    image: "/services/hair-transplant.png",
    order: 1,
    fa: {
      tag: "کاشت مو",
      title: "کاشت مو طبیعی با نتیجه‌ای پایدار و باورنکردنی",
      description:
        "با روش‌های پیشرفته کاشت مو، خط رویش طبیعی و تراکم دلخواه را به دست می‌آورید؛ از مشاوره اولیه تا مراقبت پس از عمل همراه شما هستیم.",
    },
    en: {
      tag: "Hair Transplant",
      title: "Natural Hair Transplant With Lasting, Believable Results",
      description:
        "Achieve a natural hairline and the density you want with advanced transplant techniques — we're with you from consultation through aftercare.",
    },
    ar: {
      tag: "زراعة الشعر",
      title: "زراعة شعر طبيعية بنتائج مذهلة وثابتة",
      description:
        "احصلوا على خط شعر طبيعي والكثافة التي ترغبون بها من خلال تقنيات زراعة متطورة، ونرافقكم من الاستشارة وحتى العناية بعد العملية.",
    },
  },
  {
    slug: "carboxytherapy",
    image: "/services/carboxytherapy.png",
    order: 2,
    fa: {
      tag: "کربوکسی‌تراپی",
      title: "کربوکسی‌تراپی، رمز پوستی شاداب و پرانرژی",
      description:
        "با تزریق کنترل‌شده گاز کربن‌دی‌اکسید، گردش خون پوست را تحریک و ظاهر آن را جوان‌تر و روشن‌تر می‌کنیم.",
    },
    en: {
      tag: "Carboxytherapy",
      title: "Carboxytherapy — the Secret to Radiant, Energized Skin",
      description:
        "Controlled CO2 injections stimulate skin circulation, leaving your complexion brighter and more youthful.",
    },
    ar: {
      tag: "الكربوكسي‌تراپي",
      title: "الكربوكسي‌تراپي، سر البشرة النضرة والمفعمة بالحيوية",
      description:
        "من خلال حقن ثاني أكسيد الكربون بشكل متحكم به، ننشط الدورة الدموية للبشرة ونجعلها أكثر إشراقاً وشباباً.",
    },
  },
  {
    slug: "microneedling",
    image: "/services/microneedling.png",
    order: 3,
    fa: {
      tag: "میکرونیدلینگ",
      title: "میکرونیدلینگ برای پوستی صاف و یکدست",
      description:
        "با تحریک کلاژن‌سازی طبیعی پوست، منافذ درشت، جای جوش و چروک‌های ریز را به حداقل می‌رسانیم.",
    },
    en: {
      tag: "Microneedling",
      title: "Microneedling for Smooth, Even Skin",
      description:
        "By triggering the skin's natural collagen production, we minimize enlarged pores, acne scars, and fine lines.",
    },
    ar: {
      tag: "الميكرونيدلينغ",
      title: "الميكرونيدلينغ لبشرة ناعمة ومتجانسة",
      description:
        "من خلال تحفيز إنتاج الكولاجين الطبيعي، نقلل من المسام الواسعة وآثار حب الشباب والتجاعيد الدقيقة.",
    },
  },
  {
    slug: "lipomatic-abdominal",
    image: "/services/lipomatic-abdominal.png",
    order: 4,
    fa: {
      tag: "لیپوماتیک و عمل‌های شکم",
      title: "فرم‌دهی اندام با لیپوماتیک و جراحی شکم",
      description:
        "چربی‌های موضعی مقاوم را با روشی ایمن و کم‌تهاجمی از بین می‌بریم تا به اندامی متناسب برسید.",
    },
    en: {
      tag: "Liposmatic & Abdominal Procedures",
      title: "Body Contouring With Liposmatic & Abdominal Surgery",
      description:
        "Remove stubborn localized fat safely and with minimal invasiveness to achieve a more balanced silhouette.",
    },
    ar: {
      tag: "الليبوماتيك وعمليات البطن",
      title: "نحت الجسم بالليبوماتيك وجراحة البطن",
      description:
        "تخلصوا من الدهون الموضعية العنيدة بطريقة آمنة وقليلة التوغل للوصول إلى قوام متناسق.",
    },
  },
  {
    slug: "rhinoplasty",
    image: "/services/rhinoplasty.png",
    order: 5,
    fa: {
      tag: "عمل بینی",
      title: "عمل بینی، هماهنگ با فرم صورت شما",
      description: "طراحی اختصاصی بینی متناسب با ساختار صورت، توسط تیمی با تجربه در جراحی زیبایی بینی.",
    },
    en: {
      tag: "Rhinoplasty",
      title: "Rhinoplasty, in Harmony With Your Face",
      description: "A nose design tailored to your facial structure, performed by an experienced cosmetic surgery team.",
    },
    ar: {
      tag: "عملية الأنف",
      title: "عملية الأنف بما يتناسب مع ملامح وجهكم",
      description: "تصميم مخصص للأنف يتناسب مع بنية الوجه، على يد فريق ذو خبرة في جراحة تجميل الأنف.",
    },
  },
  {
    slug: "hair-beard-transplant",
    image: "/services/hair-beard-transplant.png",
    order: 6,
    fa: {
      tag: "کاشت مو و ریش",
      title: "کاشت مو و ریش، ظاهری منسجم و مردانه",
      description: "با تکنیک‌های روز کاشت مو و ریش، تراکم طبیعی و نتیجه‌ای ماندگار را تجربه کنید.",
    },
    en: {
      tag: "Hair & Beard Transplant",
      title: "Hair & Beard Transplant for a Cohesive, Masculine Look",
      description: "Experience natural density and lasting results with today's hair and beard transplant techniques.",
    },
    ar: {
      tag: "زراعة الشعر واللحية",
      title: "زراعة الشعر واللحية لمظهر متناسق ورجولي",
      description: "استمتعوا بكثافة طبيعية ونتائج دائمة مع أحدث تقنيات زراعة الشعر واللحية.",
    },
  },
  {
    slug: "skin-rejuvenation",
    image: "/services/skin-rejuvenation.png",
    order: 7,
    fa: {
      tag: "جوانسازی پوست",
      title: "جوانسازی پوست با جدیدترین متدهای روز دنیا",
      description: "چین‌وچروک و افتادگی پوست را کاهش دهید و درخشش و شادابی پوست جوان را بازیابید.",
    },
    en: {
      tag: "Skin Rejuvenation",
      title: "Skin Rejuvenation With the Latest Global Methods",
      description: "Reduce wrinkles and sagging, and restore the glow and freshness of youthful skin.",
    },
    ar: {
      tag: "تجديد شباب البشرة",
      title: "تجديد شباب البشرة بأحدث الطرق العالمية",
      description: "قللوا من التجاعيد والترهل واستعيدوا إشراقة ونضارة البشرة الشابة.",
    },
  },
  {
    slug: "weight-loss",
    image: "/services/weight-loss.png",
    order: 8,
    fa: {
      tag: "لاغری",
      title: "لاغری موضعی و عمومی، اصولی و پایدار",
      description: "با برنامه‌های تخصصی لاغری، بدون بازگشت وزن اضافه به تناسب اندام برسید.",
    },
    en: {
      tag: "Weight Loss",
      title: "Targeted & General Weight Loss, Done Right",
      description: "Reach your ideal body shape with specialized weight-loss programs built to last.",
    },
    ar: {
      tag: "إنقاص الوزن",
      title: "إنقاص الوزن الموضعي والعام، بأسلوب علمي وثابت",
      description: "احصلوا على القوام المثالي من خلال برامج إنقاص الوزن المتخصصة دون عودة الوزن الزائد.",
    },
  },
  {
    slug: "mesotherapy",
    image: "/services/mesotherapy.png",
    order: 9,
    fa: {
      tag: "مزوتراپی",
      title: "مزوتراپی، تغذیه عمقی پوست و مو",
      description: "با تزریق ریزمغذی‌ها به لایه‌های زیرین پوست، شادابی و سلامت پوست و مو را تقویت می‌کنیم.",
    },
    en: {
      tag: "Mesotherapy",
      title: "Mesotherapy — Deep Nourishment for Skin & Hair",
      description: "Micronutrient injections into the skin's deeper layers boost the health and radiance of your skin and hair.",
    },
    ar: {
      tag: "الميزوثيرابي",
      title: "الميزوثيرابي، تغذية عميقة للبشرة والشعر",
      description: "من خلال حقن العناصر الدقيقة في الطبقات العميقة للبشرة، عززوا نضارة وصحة البشرة والشعر.",
    },
  },
  {
    slug: "abdominoplasty",
    image: "/services/abdominoplasty.png",
    order: 10,
    fa: {
      tag: "آبدومینوپلاستی",
      title: "آبدومینوپلاستی برای شکمی صاف و سفت",
      description: "پوست اضافه و شل‌شدگی عضلات شکم را با جراحی تخصصی اصلاح می‌کنیم.",
    },
    en: {
      tag: "Abdominoplasty",
      title: "Abdominoplasty for a Flat, Firm Stomach",
      description: "Correct excess skin and loosened abdominal muscles with specialized surgery.",
    },
    ar: {
      tag: "تجميل البطن",
      title: "تجميل البطن لبطن مسطح ومشدود",
      description: "صححوا الجلد الزائد وارتخاء عضلات البطن من خلال جراحة متخصصة.",
    },
  },
  {
    slug: "laser",
    image: "/services/laser.png",
    order: 11,
    fa: {
      tag: "لیزر",
      title: "لیزر موهای زائد، ماندگار و بدون درد",
      description: "با دستگاه‌های لیزر روز دنیا، پوستی صاف و بدون موی زائد را برای مدت طولانی تجربه کنید.",
    },
    en: {
      tag: "Laser",
      title: "Laser Hair Removal — Lasting and Pain-Free",
      description: "With state-of-the-art laser devices, enjoy smooth, hair-free skin for the long term.",
    },
    ar: {
      tag: "الليزر",
      title: "إزالة الشعر بالليزر، دائمة وبلا ألم",
      description: "مع أحدث أجهزة الليزر العالمية، استمتعوا ببشرة ناعمة وخالية من الشعر الزائد لفترة طويلة.",
    },
  },
  {
    slug: "cosmetic-surgery",
    image: "/services/cosmetic-surgery.png",
    order: 12,
    fa: {
      tag: "جراحی زیبایی",
      title: "جراحی زیبایی با استانداردهای بین‌المللی",
      description: "تیم جراحی مجرب ما، طیف کاملی از جراحی‌های زیبایی را با ایمنی و دقت بالا انجام می‌دهد.",
    },
    en: {
      tag: "Cosmetic Surgery",
      title: "Cosmetic Surgery to International Standards",
      description: "Our experienced surgical team performs a full range of cosmetic procedures with precision and safety.",
    },
    ar: {
      tag: "الجراحة التجميلية",
      title: "الجراحة التجميلية وفق المعايير العالمية",
      description: "يقدم فريقنا الجراحي ذو الخبرة مجموعة كاملة من عمليات التجميل بدقة وأمان عاليين.",
    },
  },
  {
    slug: "face-lift",
    image: "/services/face-lift.png",
    order: 13,
    fa: {
      tag: "لیفت صورت",
      title: "لیفت صورت، بازگشت به جوانی بدون جراحی سنگین",
      description: "افتادگی پوست صورت را اصلاح کنید و ظاهری شاداب‌تر و کشیده‌تر داشته باشید.",
    },
    en: {
      tag: "Face Lift",
      title: "Face Lift — a Youthful Look Without Heavy Surgery",
      description: "Correct facial sagging and enjoy a fresher, more lifted appearance.",
    },
    ar: {
      tag: "شد الوجه",
      title: "شد الوجه، عودة إلى الشباب دون جراحة كبرى",
      description: "صححوا ترهل بشرة الوجه واستمتعوا بمظهر أكثر نضارة وشداً.",
    },
  },
];

async function main() {
  console.log("Seeding roles...");
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { label: role.label, description: role.description },
      create: role,
    });
  }

  console.log("Seeding permissions...");
  const permissionRecords = new Map<string, string>();
  for (const permission of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { module_action: { module: permission.module, action: permission.action } },
      update: {},
      create: permission,
    });
    permissionRecords.set(`${permission.module}:${permission.action}`, record.id);
  }

  console.log("Seeding role -> permission defaults...");
  const grantsByRole: Record<"SUPER_ADMIN" | "ADMIN" | "USER", typeof PERMISSIONS> = {
    SUPER_ADMIN: PERMISSIONS,
    ADMIN: ADMIN_DEFAULT_GRANTS,
    USER: [],
  };

  for (const [roleName, grants] of Object.entries(grantsByRole) as [keyof typeof grantsByRole, typeof PERMISSIONS][]) {
    for (const grant of grants) {
      const permissionId = permissionRecords.get(`${grant.module}:${grant.action}`);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: roleName, permissionId } },
        update: {},
        create: { role: roleName, permissionId },
      });
    }
  }

  console.log("Seeding first Super Admin...");
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME?.trim() || "Super Admin";

  if (!email || !password) {
    throw new Error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in the environment to seed the first Super Admin. " +
        "See .env.example."
    );
  }
  if (password.length < 8) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 8 characters long.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
    create: {
      name,
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  console.log(`Super Admin ready: ${email}`);

  console.log("Seeding services...");
  for (const service of SERVICES_SEED) {
    const record = await prisma.service.upsert({
      where: { slug: service.slug },
      update: { image: service.image, order: service.order },
      create: { slug: service.slug, image: service.image, order: service.order },
    });

    for (const locale of ["fa", "en", "ar"] as const) {
      const t = service[locale];
      await prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: record.id, locale } },
        update: { tag: t.tag, title: t.title, description: t.description },
        create: { serviceId: record.id, locale, tag: t.tag, title: t.title, description: t.description },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
