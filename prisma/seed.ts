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
