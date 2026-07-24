"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { UserCircle, LogOut, ChevronDown } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutAction } from "@/lib/actions/auth";

export default function UserMenu({
  name,
  email,
  image,
  roleLabel,
}: {
  name: string;
  email: string;
  image?: string | null;
  roleLabel: string;
}) {
  const t = useTranslations("panel.header");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-navy-200 py-1 ps-1 pe-2.5 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:hover:bg-navy-800"
        >
          <Avatar className="h-7 w-7">
            {image && <AvatarImage src={image} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[8rem] truncate text-sm font-semibold text-navy-700 dark:text-navy-200 sm:inline">
            {name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-navy-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="dropdown-content z-[60] min-w-[14rem] rounded-xl border border-navy-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-navy-700 dark:bg-navy-900"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-bold text-navy-800 dark:text-white">{name}</p>
            <p className="truncate text-xs text-navy-400" dir="ltr">
              {email}
            </p>
            <span className="mt-1.5 inline-flex rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-600 dark:bg-navy-800 dark:text-navy-300">
              {roleLabel}
            </span>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-navy-100 dark:bg-navy-800" />
          <DropdownMenu.Item asChild>
            <Link
              href="/panel/profile"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 outline-none transition-colors data-[highlighted]:bg-navy-50 dark:text-navy-200 dark:data-[highlighted]:bg-navy-800"
            >
              <UserCircle className="h-4 w-4 text-navy-500 dark:text-navy-300" />
              {t("profile")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={handleLogout}
            disabled={isPending}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 outline-none transition-colors data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
