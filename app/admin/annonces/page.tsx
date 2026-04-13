"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, XCircle, Eye, Tag, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { fetchPendingReview, reviewAnnonce, fetchModeration, moderateAnnonce } from "@/lib/adminApi";

type SubTab = "review" | "moderation";

export default function AnnoncesPage() {
  const [sub, setSub]         = useState<SubTab>("review");
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes]     = useState<Record<string, string>>({});
  const [acting, setActing]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      setItems(sub === "review" ? await fetchPendingReview() : await fetchModeration());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [sub]);

  const act = async (id: string, action: string) => {
    setActing(id);
    try {
      if (sub === "review") await reviewAnnonce(id, action as any, notes[id]);
      else await moderateAnnonce(id, action);
      setItems(prev => prev.filter(a => (a._id || a.id) !== id));
    } catch (e: any) { alert(e.message); }
    finally { setActing(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Annonces</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} annonce{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded-xl">
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Sous-onglets */}
      <div className="flex gap-2 bg-white rounded-xl border border-gray-100 p-1 shadow-sm w-fit">
        {(["review", "moderation"] as SubTab[]).map(t => (
          <button
            key={t}
            onClick={() => setSub(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${sub === t ? "bg-[#006B3F] text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            {t === "review" ? "À valider" : "Modération manuelle"}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-16"><RefreshCw size={24} className="animate-spin text-[#006B3F]" /></div>}
      {error   && <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-sm">{error}</div>}

      {!loading && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <CheckCircle size={48} className="text-[#006B3F] mx-auto mb-4" />
          <p className="font-bold text-gray-900">Aucune annonce en attente</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((a) => {
          const id     = a._id || a.id;
          const isOpen = expanded === id;
          const photos = a.photos ?? [];

          return (
            <div key={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : id)}
              >
                {/* Miniature */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {photos[0]
                    ? <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                    : <Tag size={20} className="text-gray-400 m-auto mt-5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{a.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} />{a.ville || "—"}
                    </span>
                    <span className="text-xs font-bold text-[#006B3F]">
                      {a.price?.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      a.category === "auto" ? "bg-blue-100 text-blue-700" :
                      a.category === "immo" ? "bg-green-100 text-green-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{a.category}</span>
                  </div>
                  {a.userId?.displayName && (
                    <p className="text-xs text-gray-400 mt-0.5">Par {a.userId.displayName}</p>
                  )}
                </div>
                {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {/* Photos */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {photos.map((p: string, i: number) => (
                        <a key={i} href={p} target="_blank" rel="noreferrer">
                          <img src={p} alt="" className="w-full h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {a.description && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{a.description}</p>
                  )}

                  {/* Note */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Note interne (optionnel)
                    </label>
                    <textarea
                      value={notes[id] ?? ""}
                      onChange={e => setNotes(prev => ({ ...prev, [id]: e.target.value }))}
                      placeholder="Raison du rejet, remarque..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#006B3F] resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => act(id, "approve")}
                      disabled={acting === id}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#006B3F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#005a34] disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle size={16} />
                      Approuver
                    </button>
                    <button
                      onClick={() => act(id, "reject")}
                      disabled={acting === id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={16} />
                      Rejeter
                    </button>
                    {sub === "moderation" && (
                      <button
                        onClick={() => act(id, "delete")}
                        disabled={acting === id}
                        className="px-4 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
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
