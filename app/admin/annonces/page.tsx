"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, XCircle, Tag, MapPin, ChevronDown, ChevronUp, LayoutGrid } from "lucide-react";
import { fetchPendingReview, reviewAnnonce, fetchModeration, moderateAnnonce } from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";

type SubTab = "review" | "moderation";

const CAT_STYLES: Record<string, string> = {
  auto:   "bg-blue-400/10 text-blue-400 border-blue-400/20",
  immo:   "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  emploi: "bg-amber-400/10 text-amber-400 border-amber-400/20",
};

export default function AnnoncesPage() {
  const { success, error: toastError } = useToast();
  const [sub, setSub]         = useState<SubTab>("review");
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes]     = useState<Record<string, string>>({});
  const [acting, setActing]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(sub === "review" ? await fetchPendingReview() : await fetchModeration());
    } catch (e: any) {
      toastError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [sub]);

  const act = async (id: string, action: string) => {
    setActing(id);
    try {
      if (sub === "review") await reviewAnnonce(id, action as any, notes[id]);
      else await moderateAnnonce(id, action);
      setItems(prev => prev.filter(a => (a._id || a.id) !== id));
      setExpanded(null);
      success(
        action === "approve" ? "Annonce approuvée" :
        action === "reject"  ? "Annonce rejetée" :
        "Annonce supprimée"
      );
    } catch (e: any) {
      toastError(e.message);
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{items.length} annonce{items.length !== 1 ? "s" : ""}</p>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Sous-onglets */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit border border-white/5">
        {(["review", "moderation"] as SubTab[]).map(t => (
          <button
            key={t}
            onClick={() => setSub(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              sub === t
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t === "review" ? "À valider" : "Modération"}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-16"><RefreshCw size={24} className="animate-spin text-emerald-500" /></div>}

      {!loading && items.length === 0 && (
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <p className="font-bold text-white">Aucune annonce en attente</p>
          <p className="text-sm text-slate-500 mt-1">La file de modération est vide</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((a) => {
          const id     = a._id || a.id;
          const isOpen = expanded === id;
          const photos = a.photos ?? [];

          return (
            <div key={id} className="bg-[#1a1f2e] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
              <button
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : id)}
              >
                {/* Miniature */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                  {photos[0]
                    ? <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                    : <Tag size={20} className="text-slate-600 m-auto mt-5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">{a.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {a.ville && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={11} />{a.ville}
                      </span>
                    )}
                    <span className="text-xs font-bold text-emerald-400">
                      {(a.price ?? 0).toLocaleString("fr-FR")} FCFA
                    </span>
                    {a.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${CAT_STYLES[a.category] ?? "bg-white/5 text-slate-400 border-white/10"}`}>
                        {a.category}
                      </span>
                    )}
                  </div>
                  {a.userId?.displayName && (
                    <p className="text-xs text-slate-500 mt-1">Par {a.userId.displayName}</p>
                  )}
                </div>
                {isOpen ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-white/5 p-5 space-y-4">
                  {/* Photos */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {photos.map((p: string, i: number) => (
                        <a key={i} href={p} target="_blank" rel="noreferrer">
                          <img src={p} alt="" className="w-full h-24 object-cover rounded-xl border border-white/5 hover:opacity-80 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {a.description && (
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-4 bg-white/3 rounded-xl p-4">
                      {a.description}
                    </p>
                  )}

                  {/* Note interne */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Note interne (optionnel)
                    </label>
                    <textarea
                      value={notes[id] ?? ""}
                      onChange={e => setNotes(prev => ({ ...prev, [id]: e.target.value }))}
                      placeholder="Raison du rejet, remarque interne…"
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => act(id, "approve")}
                      disabled={acting === id}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle size={16} />
                      Approuver
                    </button>
                    <button
                      onClick={() => act(id, "reject")}
                      disabled={acting === id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={16} />
                      Rejeter
                    </button>
                    {sub === "moderation" && (
                      <button
                        onClick={() => act(id, "delete")}
                        disabled={acting === id}
                        className="px-4 flex items-center justify-center gap-2 bg-white/5 text-slate-300 border border-white/10 py-3 rounded-xl text-sm font-semibold hover:bg-white/10 disabled:opacity-50 transition-colors"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
