"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, ShieldCheck, FileText, Wallet,
  Users, AlertTriangle, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { getStoredUser, clearToken } from "@/lib/adminApi";

const NAV = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/admin/kyc",       icon: ShieldCheck,     label: "KYC Identité" },
  { href: "/admin/annonces",  icon: FileText,        label: "Annonces" },
  { href: "/admin/finances",  icon: Wallet,          label: "Finances & Escrow" },
  { href: "/admin/agents",    icon: Users,           label: "Agents & Utilisateurs" },
  { href: "/admin/litiges",   icon: AlertTriangle,   label: "Litiges & Signalements" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]       = useState<any>(null);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin") return; // page login, pas de vérif
    const u = getStoredUser();
    if (!u || (u.role !== "super-admin" && u.role !== "agent")) {
      router.replace("/admin");
      return;
    }
    setUser(u);
  }, [pathname]);

  const logout = () => {
    clearToken();
    router.replace("/admin");
  };

  if (pathname === "/admin") return <>{children}</>;
  if (!user) return null;

  const isSuperAdmin = user.role === "super-admin";

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#006B3F] rounded-xl flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">P2P.BJ Admin</p>
            <p className="text-xs text-gray-400">{isSuperAdmin ? "Super Admin" : "Agent"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.filter(n => isSuperAdmin || !["finances", "agents"].some(k => n.href.includes(k))).map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSideOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[#006B3F] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#E6F4ED] rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-[#006B3F]">
              {user.displayName?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || user.phone}</p>
            <p className="text-xs text-gray-400">{user.phone}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Sidebar mobile (drawer) */}
      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-white shadow-xl flex flex-col">
            <div className="flex justify-end p-4">
              <button onClick={() => setSideOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSideOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSideOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <span className="font-black text-gray-900">P2P.BJ Admin</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
