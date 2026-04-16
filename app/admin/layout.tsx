"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, ShieldCheck, FileText, Wallet,
  Users, AlertTriangle, LogOut, Menu, X, ChevronRight,
  Bell, Search,
} from "lucide-react";
import { getStoredUser, clearToken } from "@/lib/adminApi";
import { ToastProvider } from "@/components/admin/Toast";

const NAV = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Tableau de bord", color: "text-emerald-400" },
  { href: "/admin/kyc",       icon: ShieldCheck,     label: "KYC Identité",    color: "text-blue-400" },
  { href: "/admin/annonces",  icon: FileText,        label: "Annonces",         color: "text-violet-400" },
  { href: "/admin/finances",  icon: Wallet,          label: "Finances & Escrow",color: "text-amber-400" },
  { href: "/admin/agents",    icon: Users,           label: "Agents & Utilisateurs", color: "text-cyan-400" },
  { href: "/admin/litiges",   icon: AlertTriangle,   label: "Litiges & Signalements", color: "text-rose-400" },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Tableau de bord",
  "/admin/kyc":       "KYC Identité",
  "/admin/annonces":  "Annonces",
  "/admin/finances":  "Finances & Escrow",
  "/admin/agents":    "Agents & Utilisateurs",
  "/admin/litiges":   "Litiges & Signalements",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]        = useState<any>(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [now, setNow]          = useState("");

  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
    }));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (pathname === "/admin") return;
    const u = getStoredUser();
    if (!u || (u.role !== "super-admin" && u.role !== "agent")) {
      router.replace("/admin");
      return;
    }
    setUser(u);
  }, [pathname]);

  const logout = () => { clearToken(); router.replace("/admin"); };

  if (pathname === "/admin") return <ToastProvider>{children}</ToastProvider>;
  if (!user) return null;

  const isSuperAdmin = user.role === "super-admin";
  const pageTitle = PAGE_TITLES[pathname] ?? "Admin";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="font-black text-white text-sm tracking-tight">P2P.BJ</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              {isSuperAdmin ? "Super Admin" : "Agent"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">Navigation</p>
        {NAV.filter(n =>
          isSuperAdmin || !["finances", "agents"].some(k => n.href.includes(k))
        ).map(({ href, icon: Icon, label, color }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSideOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon size={17} className={active ? color : "text-slate-500 group-hover:text-slate-300"} />
              <span className="flex-1">{label}</span>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-white">
              {(user.displayName?.[0] ?? user.phone?.[0] ?? "A").toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.displayName || user.phone}</p>
            <p className="text-[10px] text-slate-400">{user.phone}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="flex h-screen bg-[#0f1117] overflow-hidden">

        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-60 bg-[#141924] border-r border-white/5 flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* Sidebar mobile (drawer) */}
        {sideOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-60 bg-[#141924] border-r border-white/5 flex flex-col shadow-2xl">
              <div className="flex justify-end p-4">
                <button onClick={() => setSideOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </div>
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSideOpen(false)} />
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Topbar */}
          <header className="flex items-center justify-between px-6 py-4 bg-[#141924]/80 backdrop-blur-md border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSideOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="font-black text-white text-lg leading-none">{pageTitle}</h1>
                {now && <p className="text-xs text-slate-500 mt-0.5 capitalize">{now}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <button className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors">
                <Bell size={17} />
              </button>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
                <span className="text-xs font-black text-white">
                  {(user.displayName?.[0] ?? user.phone?.[0] ?? "A").toUpperCase()}
                </span>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-[#0f1117]">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
