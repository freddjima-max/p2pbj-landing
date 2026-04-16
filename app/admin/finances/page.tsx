"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Unlock, RotateCcw, Lock, Filter, Wallet } from "lucide-react";
import { fetchEscrows, releaseEscrow, refundEscrow } from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

const STATUS_OPTIONS = [
  { value: "",         label: "Tous" },
  { value: "locked",   label: "Bloqués" },
  { value: "released", label: "Libérés" },
  { value: "refunded", label: "Remboursés" },
];

function fmtPrice(n: number) { return (n ?? 0).toLocaleString("fr-FR") + " FCFA"; }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLE: Record<string, string> = {
  locked:   "bg-amber-400/10 text-amber-400 border-amber-400/20",
  released: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  refunded: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  failed:   "bg-red-400/10 text-red-400 border-red-400/20",
};

const STATUS_FR: Record<string, string> = {
  locked: "Bloqué", released: "Libéré", refunded: "Remboursé", failed: "Échoué",
};

export default function FinancesPage() {
  const { success, error: toastError } = useToast();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [filter, setFilter]   = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: "release" | "refund" } | null>(null);

  const load = async () => {
    setLoading(true);
    try { setEscrows(await fetchEscrows(filter || undefined)); }
    catch (e: any) { toastError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const doAction = async () => {
    if (!confirm) return;
    const { id, action } = confirm;
    setConfirm(null);
    setActing(id);
    try {
      if (action === "release") {
        await releaseEscrow(id);
        success("Fonds libérés vers le vendeur");
      } else {
        await refundEscrow(id);
        success("Remboursement effectué");
      }
      await load();
    } catch (e: any) {
      toastError(e.message);
    } finally {
      setActing(null);
    }
  };

  const totalLocked  = escrows.filter(e => e.status === "locked").reduce((s, e) => s + (e.amount ?? 0), 0);
  const countLocked  = escrows.filter(e => e.status === "locked").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{escrows.length} transaction{escrows.length !== 1 ? "s" : ""}</p>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Alerte séquestre */}
      {totalLocked > 0 && (
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lock size={18} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-300">{fmtPrice(totalLocked)} en séquestre</p>
            <p className="text-xs text-amber-400/70 mt-0.5">{countLocked} dossier{countLocked > 1 ? "s" : ""} bloqué{countLocked > 1 ? "s" : ""} en attente de libération</p>
          </div>
          <Wallet size={20} className="text-amber-400/40" />
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-3">
        <Filter size={15} className="text-slate-500" />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setFilter(o.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === o.value
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-emerald-500" />
        </div>
      )}

      {/* Empty */}
      {!loading && escrows.length === 0 && (
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-slate-500" />
          </div>
          <p className="font-bold text-white">Aucune transaction</p>
          <p className="text-sm text-slate-500 mt-1">Les transactions apparaîtront ici</p>
        </div>
      )}

      {/* Table */}
      {!loading && escrows.length > 0 && (
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Annonce</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acheteur</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendeur</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {escrows.map((e) => {
                  const id = e._id || e.id;
                  return (
                    <tr key={id} className="hover:bg-white/3 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-200 truncate max-w-[180px]">{e.annonceId?.title || "—"}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-400 truncate max-w-[120px]">
                        {e.buyerId?.displayName || e.buyerId?.phone || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-400 truncate max-w-[120px]">
                        {e.sellerId?.displayName || e.sellerId?.phone || "—"}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-white whitespace-nowrap">
                        {fmtPrice(e.amount)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[e.status] ?? STATUS_STYLE.failed}`}>
                          {STATUS_FR[e.status] ?? e.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">{fmtDate(e.createdAt)}</td>
                      <td className="px-5 py-4">
                        {e.status === "locked" && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setConfirm({ id, action: "release" })}
                              disabled={acting === id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold hover:bg-emerald-500/20 disabled:opacity-50 transition-all"
                            >
                              <Unlock size={12} />
                              Libérer
                            </button>
                            <button
                              onClick={() => setConfirm({ id, action: "refund" })}
                              disabled={acting === id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-slate-300 border border-white/5 rounded-xl text-xs font-semibold hover:bg-white/10 disabled:opacity-50 transition-all"
                            >
                              <RotateCcw size={12} />
                              Rembourser
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.action === "release" ? "Libérer les fonds ?" : "Rembourser l'acheteur ?"}
        message={
          confirm?.action === "release"
            ? "Les fonds seront transférés immédiatement vers le compte du vendeur. Cette action est irréversible."
            : "L'acheteur sera remboursé intégralement. Cette action est irréversible."
        }
        confirmLabel={confirm?.action === "release" ? "Libérer" : "Rembourser"}
        danger={confirm?.action === "refund"}
        onConfirm={doAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
