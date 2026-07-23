"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Sun, Moon, Monitor, Check, type LucideIcon } from "lucide-react";

const OPTIONS: { value: "light" | "dark" | "system"; icon: LucideIcon }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function ThemeSwitcher() {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
  // Before mount, theme/resolvedTheme are unknown on both server and client's
  // first pass — always render the neutral "system" icon so they match.
  const CurrentIcon = mounted ? current.icon : Monitor;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("label")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-200 bg-white/70 text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-900 dark:border-navy-700 dark:bg-navy-900/40 dark:text-navy-200 dark:hover:bg-navy-800"
        >
          <CurrentIcon className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="dropdown-content z-[60] min-w-[9.5rem] rounded-xl border border-navy-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-navy-700 dark:bg-navy-900"
        >
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = mounted && theme === option.value;
            return (
              <DropdownMenu.Item
                key={option.value}
                onSelect={() => setTheme(option.value)}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 outline-none transition-colors data-[highlighted]:bg-navy-50 dark:text-navy-200 dark:data-[highlighted]:bg-navy-800"
              >
                <Icon className="h-4 w-4 text-navy-500 dark:text-navy-300" />
                <span className="flex-1">{t(option.value)}</span>
                {active && <Check className="h-4 w-4 text-gold-500" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
