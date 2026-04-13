"use client";

import { useEffect, useState } from "react";
import {
  Users, FileText, Wallet, AlertTriangle, ShieldCheck,
  TrendingUp, Lock, RefreshCw, ArrowUpRight,
} from "lucide-react";
import { fetchKPIs, fetchAnalytics } from "@/lib/adminApi";

function fmt(n: number) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}
function fmtPrice(n: number) {
  return n?.toLocaleString("fr-FR") + " F";
}

interface KPI {
  totalUsers: number; newUsersToday: number;
  totalAnnonces: number; activeAnnonces: number;
  totalTransactions: number; chiffreAffaires: number;
  volumeTotal: number; pendingVerifs: number;
  pendingReports: number; lockedEscrows: number;
  escrowLockedAmount: number; agents: number;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        <ArrowUpRight size={16} className="text-gray-300" />
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [kpis, setKpis]     = useState<KPI | null>(null);
  const [analytics, setAn]  = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [k, a] = await Promise.all([fetchKPIs(), fetchAnalytics()]);
      setKpis(k);
      setAn(a);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw size={24} className="animate-spin text-[#006B3F]" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-2xl p-6 text-sm">{error}</div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vue d'ensemble de la plateforme</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded-xl transition-colors">
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* KPIs grille */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}        label="Utilisateurs"      value={fmt(kpis.totalUsers)}          sub={`+${kpis.newUsersToday} aujourd'hui`}  color="bg-blue-500" />
          <StatCard icon={FileText}     label="Annonces actives"  value={fmt(kpis.activeAnnonces)}      sub={`${fmt(kpis.totalAnnonces)} total`}      color="bg-[#006B3F]" />
          <StatCard icon={Wallet}       label="Chiffre d'affaires" value={fmtPrice(kpis.chiffreAffaires)} sub={`${fmt(kpis.totalTransactions)} transactions`} color="bg-yellow-500" />
          <StatCard icon={Lock}         label="Séquestre bloqué"  value={fmtPrice(kpis.escrowLockedAmount)} sub={`${kpis.lockedEscrows} dossiers`}   color="bg-purple-500" />
          <StatCard icon={ShieldCheck}  label="KYC en attente"    value={fmt(kpis.pendingVerifs)}       color="bg-orange-500" />
          <StatCard icon={AlertTriangle} label="Litiges ouverts"  value={fmt(kpis.pendingReports)}      color="bg-red-500" />
          <StatCard icon={Users}        label="Agents actifs"     value={fmt(kpis.agents)}              color="bg-indigo-500" />
          <StatCard icon={TrendingUp}   label="Volume total"      value={fmtPrice(kpis.volumeTotal)}    color="bg-teal-500" />
        </div>
      )}

      {/* Analytics — top villes & catégories */}
      {analytics && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Top villes */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Top villes</h3>
            <div className="space-y-3">
              {(analytics.topCities ?? []).slice(0, 6).map((c: any, i: number) => {
                const max = analytics.topCities[0]?.count || 1;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{c._id || "Inconnu"}</span>
                      <span className="text-gray-500">{c.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-[#006B3F] rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catégories */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Répartition par catégorie</h3>
            <div className="space-y-3">
              {(analytics.categoryBreakdown ?? []).map((c: any, i: number) => {
                const total = analytics.categoryBreakdown.reduce((s: number, x: any) => s + x.count, 0) || 1;
                const COLORS = ["bg-[#006B3F]", "bg-blue-500", "bg-yellow-500", "bg-red-500", "bg-purple-500"];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{c._id}</span>
                      <span className="text-gray-500">{((c.count / total) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className={`h-2 ${COLORS[i % COLORS.length]} rounded-full`} style={{ width: `${(c.count / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
