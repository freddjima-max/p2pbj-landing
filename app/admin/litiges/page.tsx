"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, CheckCircle, Filter } from "lucide-react";
import { fetchReports, resolveReport } from "@/lib/adminApi";

const STATUS_OPTIONS = [
  { value: "",          label: "Tous" },
  { value: "pending",   label: "En attente" },
  { value: "resolved",  label: "Résolus" },
];

const ACTION_OPTIONS = [
  { value: "dismiss",      label: "Ignorer",             style: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
  { value: "warn",         label: "Avertir le vendeur",  style: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  { value: "remove",       label: "Retirer l'annonce",   style: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  { value: "ban",          label: "Bannir l'utilisateur", style: "bg-red-500 text-white hover:bg-red-600" },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function LitigesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter]   = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [acting, setActing]   = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try { setReports(await fetchReports(filter || undefined)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const act = async (id: string, action: string) => {
    setActing(id);
    try {
      await resolveReport(id, action);
      setReports(prev => prev.filter(r => (r._id || r.id) !== id));
      setExpanded(null);
    } catch (e: any) { alert(e.message); }
    finally { setActing(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Litiges & Signalements</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reports.length} signalement{reports.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded-xl">
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-400" />
        <div className="flex gap-2">
          {STATUS_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setFilter(o.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === o.value ? "bg-[#006B3F] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#006B3F]"}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><RefreshCw size={24} className="animate-spin text-[#006B3F]" /></div>}
      {error   && <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-sm">{error}</div>}

      {!loading && reports.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <CheckCircle size={48} className="text-[#006B3F] mx-auto mb-4" />
          <p className="font-bold text-gray-900">Aucun signalement</p>
        </div>
      )}

      <div className="space-y-3">
        {reports.map(r => {
          const id     = r._id || r.id;
          const isOpen = expanded === id;

          return (
            <div key={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <button
                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : id)}
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {r.annonceId?.title || "Annonce inconnue"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Signalé par {r.reporterId?.displayName || r.reporterId?.phone || "anonyme"} · {fmtDate(r.createdAt)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                  r.status === "pending" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                }`}>
                  {r.status === "pending" ? "En attente" : "Résolu"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {/* Motif */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Motif</p>
                    <p className="text-sm text-gray-700">{r.reason || "—"}</p>
                    {r.details && <p className="text-sm text-gray-500 mt-2">{r.details}</p>}
                  </div>

                  {/* Infos */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Vendeur signalé</p>
                      <p className="font-medium text-gray-700">{r.annonceId?.userId?.displayName || r.reportedUserId?.displayName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Catégorie</p>
                      <p className="font-medium text-gray-700 capitalize">{r.annonceId?.category || "—"}</p>
                    </div>
                  </div>

                  {/* Actions — uniquement si pending */}
                  {r.status === "pending" && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Action</p>
                      <div className="flex flex-wrap gap-2">
                        {ACTION_OPTIONS.map(({ value, label, style }) => (
                          <button
                            key={value}
                            onClick={() => act(id, value)}
                            disabled={acting === id}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${style} disabled:opacity-50 transition-colors`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
