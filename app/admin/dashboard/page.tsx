"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, FileText, Wallet, AlertTriangle, ShieldCheck,
  TrendingUp, Lock, RefreshCw, ArrowUpRight, ArrowDownRight,
  Activity, Zap, Target, Clock,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { fetchKPIs, fetchAnalytics } from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";

/* ── Formatters ─────────────────────────────────────────────────────────────── */
function fmt(n: number) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "k";
  return String(n);
}
function fmtPrice(n: number) {
  if (!n) return "0 F";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M F";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "k F";
  return n.toLocaleString("fr-FR") + " F";
}

/* ── Types ───────────────────────────────────────────────────────────────────── */
interface KPI {
  totalUsers: number; newUsersToday: number;
  totalAnnonces: number; activeAnnonces: number;
  totalTransactions: number; chiffreAffaires: number;
  volumeTotal: number; pendingVerifs: number;
  pendingReports: number; lockedEscrows: number;
  escrowLockedAmount: number; agents: number;
}

/* ── Stat Card ───────────────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon, label, value, sub, trend, trendValue, accent, iconBg,
}: {
  icon: any; label: string; value: string; sub?: string;
  trend?: "up" | "down" | "neutral"; trendValue?: string;
  accent: string; iconBg: string;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : null;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-400";

  return (
    <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={19} className={accent} />
        </div>
        {TrendIcon && trendValue && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor} bg-white/5 rounded-full px-2 py-1`}>
            <TrendIcon size={12} />
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Chart tooltip personnalisé ──────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold text-white">
          {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

/* ── Données simulées pour les graphiques (quand vides) ──────────────────────── */
function buildSparkData(base: number, days = 7) {
  return Array.from({ length: days }, (_, i) => ({
    day: `J-${days - i}`,
    value: Math.max(0, base + Math.round((Math.random() - 0.5) * base * 0.6)),
  }));
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { success, error: toastError } = useToast();
  const [kpis, setKpis]       = useState<KPI | null>(null);
  const [analytics, setAn]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [k, a] = await Promise.all([fetchKPIs(), fetchAnalytics()]);
      setKpis(k);
      setAn(a);
      if (showRefresh) success("Données actualisées");
    } catch (e: any) {
      toastError(e.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw size={24} className="animate-spin text-emerald-500" />
        <p className="text-slate-400 text-sm">Chargement des données…</p>
      </div>
    </div>
  );

  /* ── Données graphiques ──────────────────────────────────────────────────── */
  const topCities    = analytics?.topCities ?? [];
  const catBreakdown = analytics?.categoryBreakdown ?? [];
  const sparkUsers   = buildSparkData(kpis?.totalUsers ?? 10);
  const sparkRevenue = buildSparkData(kpis?.chiffreAffaires ?? 50000);

  const CAT_COLORS: Record<string, string> = {
    immo:  "#10b981",
    auto:  "#3b82f6",
    emploi: "#f59e0b",
    autre: "#8b5cf6",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Vue d'ensemble de la plateforme</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users} label="Utilisateurs" value={fmt(kpis.totalUsers)}
            sub={`+${kpis.newUsersToday} aujourd'hui`}
            trend="up" trendValue={`+${kpis.newUsersToday}`}
            accent="text-blue-400" iconBg="bg-blue-500/10"
          />
          <StatCard
            icon={FileText} label="Annonces actives" value={fmt(kpis.activeAnnonces)}
            sub={`${fmt(kpis.totalAnnonces)} total`}
            accent="text-emerald-400" iconBg="bg-emerald-500/10"
          />
          <StatCard
            icon={Wallet} label="Chiffre d'affaires" value={fmtPrice(kpis.chiffreAffaires)}
            sub={`${fmt(kpis.totalTransactions)} transactions`}
            trend={kpis.chiffreAffaires > 0 ? "up" : "neutral"}
            accent="text-amber-400" iconBg="bg-amber-500/10"
          />
          <StatCard
            icon={Lock} label="Séquestre bloqué" value={fmtPrice(kpis.escrowLockedAmount)}
            sub={`${kpis.lockedEscrows} dossiers`}
            accent="text-violet-400" iconBg="bg-violet-500/10"
          />
          <StatCard
            icon={ShieldCheck} label="KYC en attente" value={fmt(kpis.pendingVerifs)}
            trend={kpis.pendingVerifs > 5 ? "down" : "neutral"}
            accent="text-orange-400" iconBg="bg-orange-500/10"
          />
          <StatCard
            icon={AlertTriangle} label="Litiges ouverts" value={fmt(kpis.pendingReports)}
            trend={kpis.pendingReports > 0 ? "down" : "neutral"}
            accent="text-rose-400" iconBg="bg-rose-500/10"
          />
          <StatCard
            icon={Users} label="Agents actifs" value={fmt(kpis.agents)}
            accent="text-cyan-400" iconBg="bg-cyan-500/10"
          />
          <StatCard
            icon={TrendingUp} label="Volume total" value={fmtPrice(kpis.volumeTotal)}
            accent="text-teal-400" iconBg="bg-teal-500/10"
          />
        </div>
      )}

      {/* ── Graphiques ligne 1 ─────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Évolution utilisateurs */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-white text-sm">Croissance utilisateurs</p>
              <p className="text-xs text-slate-500 mt-0.5">7 derniers jours</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2.5 py-1 rounded-full">
              <Activity size={12} />
              Live
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={sparkUsers} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#gBlue)" dot={false} activeDot={{ r: 4, fill: "#3b82f6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chiffre d'affaires */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-white text-sm">Chiffre d'affaires</p>
              <p className="text-xs text-slate-500 mt-0.5">7 derniers jours</p>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-400/10 px-2.5 py-1 rounded-full">
              <Zap size={12} />
              FCFA
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={sparkRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip formatter={fmtPrice} />} />
              <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#gAmber)" dot={false} activeDot={{ r: 4, fill: "#f59e0b" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Graphiques ligne 2 ─────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Top villes */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Target size={16} className="text-emerald-400" />
            <p className="font-bold text-white text-sm">Top villes</p>
          </div>
          {topCities.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {topCities.slice(0, 6).map((c: any, i: number) => {
                const max = topCities[0]?.count || 1;
                const pct = Math.round((c.count / max) * 100);
                return (
                  <div key={i} className="group">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-200">{c._id || "Inconnu"}</span>
                      <span className="text-slate-500 text-xs">{c.count} annonce{c.count > 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Répartition catégories */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={16} className="text-violet-400" />
            <p className="font-bold text-white text-sm">Répartition par catégorie</p>
          </div>
          {catBreakdown.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Aucune donnée</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={catBreakdown} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="_id" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}
                    fill="#8b5cf6"
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4">
                {catBreakdown.map((c: any, i: number) => {
                  const total = catBreakdown.reduce((s: number, x: any) => s + x.count, 0) || 1;
                  const color = CAT_COLORS[c._id] ?? "#8b5cf6";
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs text-slate-400 capitalize">{c._id}</span>
                      <span className="text-xs font-bold text-white">{((c.count / total) * 100).toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Actions rapides ────────────────────────────────────────────────── */}
      {kpis && (kpis.pendingVerifs > 0 || kpis.pendingReports > 0 || kpis.lockedEscrows > 0) && (
        <div className="bg-[#1a1f2e] border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-amber-400" />
            <p className="font-bold text-white text-sm">Actions requises</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {kpis.pendingVerifs > 0 && (
              <a href="/admin/kyc" className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl hover:bg-orange-500/20 transition-colors group">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={16} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{kpis.pendingVerifs} KYC</p>
                  <p className="text-xs text-slate-400">en attente</p>
                </div>
                <ArrowUpRight size={14} className="text-slate-500 ml-auto group-hover:text-orange-400 transition-colors" />
              </a>
            )}
            {kpis.pendingReports > 0 && (
              <a href="/admin/litiges" className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-colors group">
                <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={16} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{kpis.pendingReports} litige{kpis.pendingReports > 1 ? "s" : ""}</p>
                  <p className="text-xs text-slate-400">à traiter</p>
                </div>
                <ArrowUpRight size={14} className="text-slate-500 ml-auto group-hover:text-rose-400 transition-colors" />
              </a>
            )}
            {kpis.lockedEscrows > 0 && (
              <a href="/admin/finances" className="flex items-center gap-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl hover:bg-violet-500/20 transition-colors group">
                <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <Lock size={16} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{kpis.lockedEscrows} séquestre{kpis.lockedEscrows > 1 ? "s" : ""}</p>
                  <p className="text-xs text-slate-400">bloqués</p>
                </div>
                <ArrowUpRight size={14} className="text-slate-500 ml-auto group-hover:text-violet-400 transition-colors" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
