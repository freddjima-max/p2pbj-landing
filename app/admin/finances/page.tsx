"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Unlock, RotateCcw, Lock, Filter } from "lucide-react";
import { fetchEscrows, releaseEscrow, refundEscrow } from "@/lib/adminApi";

const STATUS_OPTIONS = [
  { value: "",        label: "Tous" },
  { value: "locked",  label: "Bloqués" },
  { value: "released", label: "Libérés" },
  { value: "refunded", label: "Remboursés" },
];

function fmtPrice(n: number) { return n?.toLocaleString("fr-FR") + " FCFA"; }
function fmtDate(d: string)  {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLE: Record<string, string> = {
  locked:   "bg-yellow-100 text-yellow-700",
  released: "bg-green-100 text-green-700",
  refunded: "bg-gray-100 text-gray-600",
  failed:   "bg-red-100 text-red-600",
};

export default function FinancesPage() {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [filter, setFilter]   = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [acting, setActing]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try { setEscrows(await fetchEscrows(filter || undefined)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const release = async (id: string) => {
    if (!confirm("Libérer les fonds vers le vendeur ?")) return;
    setActing(id);
    try { await releaseEscrow(id); await load(); }
    catch (e: any) { alert(e.message); }
    finally { setActing(null); }
  };

  const refund = async (id: string) => {
    if (!confirm("Rembourser l'acheteur ?")) return;
    setActing(id);
    try { await refundEscrow(id); await load(); }
    catch (e: any) { alert(e.message); }
    finally { setActing(null); }
  };

  const totalLocked = escrows.filter(e => e.status === "locked").reduce((s, e) => s + (e.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Finances & Escrow</h1>
          <p className="text-sm text-gray-500 mt-0.5">{escrows.length} transaction{escrows.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded-xl">
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Résumé */}
      {totalLocked > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <Lock size={20} className="text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-yellow-800">{fmtPrice(totalLocked)} en séquestre</p>
            <p className="text-xs text-yellow-600">{escrows.filter(e => e.status === "locked").length} dossiers bloqués en attente de libération</p>
          </div>
        </div>
      )}

      {/* Filtre */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-400" />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setFilter(o.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === o.value ? "bg-[#006B3F] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#006B3F]"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><RefreshCw size={24} className="animate-spin text-[#006B3F]" /></div>}
      {error   && <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-sm">{error}</div>}

      {!loading && escrows.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="font-bold text-gray-900">Aucune transaction</p>
        </div>
      )}

      {/* Table */}
      {escrows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Annonce</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acheteur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendeur</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {escrows.map((e) => {
                const id = e._id || e.id;
                return (
                  <tr key={id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[180px]">{e.annonceId?.title || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]">
                      {e.buyerId?.displayName || e.buyerId?.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]">
                      {e.sellerId?.displayName || e.sellerId?.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                      {fmtPrice(e.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[e.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(e.createdAt)}</td>
                    <td className="px-4 py-3">
                      {e.status === "locked" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => release(id)}
                            disabled={acting === id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#006B3F] text-white rounded-lg text-xs font-semibold hover:bg-[#005a34] disabled:opacity-50 transition-colors"
                          >
                            <Unlock size={12} />
                            Libérer
                          </button>
                          <button
                            onClick={() => refund(id)}
                            disabled={acting === id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
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
      )}
    </div>
  );
}
