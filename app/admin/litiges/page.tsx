"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, CheckCircle, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { fetchReports, resolveReport } from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

const STATUS_OPTIONS = [
  { value: "",         label: "Tous" },
  { value: "pending",  label: "En attente" },
  { value: "resolved", label: "Résolus" },
];

const ACTION_OPTIONS = [
  { value: "dismiss", label: "Ignorer",              style: "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5" },
  { value: "warn",    label: "Avertir le vendeur",   style: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20" },
  { value: "remove",  label: "Retirer l'annonce",    style: "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20" },
  { value: "ban",     label: "Bannir l'utilisateur", style: "bg-red-500 text-white hover:bg-red-600 border border-red-500", danger: true },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function LitigesPage() {
  const { success, error: toastError } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter]   = useState("pending");
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: string; label: string; danger: boolean } | null>(null);

  const load = async () => {
    setLoading(true);
    try { setReports(await fetchReports(filter || undefined)); }
    catch (e: any) { toastError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const doAction = async () => {
    if (!confirm) return;
    const { id, action, label } = confirm;
    setConfirm(null);
    setActing(id);
    try {
      await resolveReport(id, action);
      setReports(prev => prev.filter(r => (r._id || r.id) !== id));
      setExpanded(null);
      success(`Action effectuée : ${label}`);
    } catch (e: any) {
      toastError(e.message);
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{reports.length} signalement{reports.length !== 1 ? "s" : ""}</p>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3">
        <Filter size={15} className="text-slate-500" />
        <div className="flex gap-2">
          {STATUS_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setFilter(o.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === o.value
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5"
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><RefreshCw size={24} className="animate-spin text-emerald-500" /></div>}

      {!loading && reports.length === 0 && (
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <p className="font-bold text-white">Aucun signalement</p>
          <p className="text-sm text-slate-500 mt-1">Tout est en ordre</p>
        </div>
      )}

      <div className="space-y-2">
        {reports.map(r => {
          const id     = r._id || r.id;
          const isOpen = expanded === id;

          return (
            <div key={id} className="bg-[#1a1f2e] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
              <button
                className="w-full flex items-center gap-4 p-5 text-left"
                onClick={() => setExpanded(isOpen ? null : id)}
              >
                <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={17} className="text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">
                    {r.annonceId?.title || "Annonce inconnue"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Par {r.reporterId?.displayName || r.reporterId?.phone || "anonyme"} · {fmtDate(r.createdAt)}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex-shrink-0 ${
                  r.status === "pending"
                    ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                    : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                }`}>
                  {r.status === "pending" ? "En attente" : "Résolu"}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-white/5 p-5 space-y-4">
                  {/* Motif */}
                  <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Motif signalé</p>
                    <p className="text-sm text-slate-200">{r.reason || "—"}</p>
                    {r.details && <p className="text-sm text-slate-400 mt-2 leading-relaxed">{r.details}</p>}
                  </div>

                  {/* Infos */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">Vendeur signalé</p>
                      <p className="font-semibold text-slate-200 text-sm">{r.annonceId?.userId?.displayName || r.reportedUserId?.displayName || "—"}</p>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">Catégorie</p>
                      <p className="font-semibold text-slate-200 text-sm capitalize">{r.annonceId?.category || "—"}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {r.status === "pending" && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Action à mener</p>
                      <div className="flex flex-wrap gap-2">
                        {ACTION_OPTIONS.map(({ value, label, style }) => (
                          <button
                            key={value}
                            onClick={() => setConfirm({ id, action: value, label, danger: value === "ban" })}
                            disabled={acting === id}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 transition-all ${style}`}
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

      <ConfirmModal
        open={!!confirm}
        title={`Confirmer : ${confirm?.label}`}
        message="Cette action sera enregistrée dans le journal de modération."
        confirmLabel={confirm?.label}
        danger={confirm?.danger}
        onConfirm={doAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
