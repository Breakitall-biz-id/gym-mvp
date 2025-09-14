"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Calendar01Icon,
  FingerprintScanIcon,
  UserIcon,
  Dumbbell02Icon,
  WorkoutKickingIcon
} from "@hugeicons/core-free-icons";

const tabs = [
  { href: "/member", label: "Home", icon: Home01Icon },
  { href: "/member/class", label: "Class", icon: WorkoutKickingIcon },
  {
    href: "/member/scan",
    label: "Scan",
    icon: FingerprintScanIcon,
    special: true,
  },
  { href: "/member/trainer", label: "Trainer", icon: Dumbbell02Icon },
  { href: "/member/profile", label: "Profile", icon: UserIcon },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br @container flex flex-col">
      <main className="flex-1">{children}</main>
      <nav className="sticky bottom-0 z-50 w-full bg-white/10 backdrop-blur border-t border-white/10">
        <ul className="flex justify-between px-2 py-1 items-end">
          {tabs.map((tab, idx) => {
            const active = pathname === tab.href;
            if (tab.special) {
              return (
                <li
                  key={tab.href}
                  className="flex-1 flex justify-center relative"
                  style={{ zIndex: 2 }}
                >
                  <Link
                    href={tab.href}
                    className={`flex flex-col items-center justify-center rounded-full shadow-xl border-2 border-slate-700 transition
                      w-16 h-16 bg-lime-400 text-slate-950 bg-opacity-80
                      ${active ? "scale-110" : "opacity-90 hover:opacity-100"}
                    `}
                    style={{ position: "absolute", top: "-5rem" }}
                  >
                    <HugeiconsIcon
                      icon={tab.icon}
                      size={28}
                      color="#222"
                      className="mb-1"
                    />
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-lg transition
                    ${
                      active
                        ? "text-lime-400 bg-lime-400/10 font-semibold"
                        : "text-white/80 hover:text-lime-300"
                    }
                  `}
                >
                  <HugeiconsIcon
                    icon={tab.icon}
                    size={24}
                    color={active ? "#a3e635" : "#fff"}
                    className="mb-0.5"
                  />
                  <span className="text-xs">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
