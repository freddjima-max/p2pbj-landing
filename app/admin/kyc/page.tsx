"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw, CheckCircle, XCircle, User, ChevronDown, ChevronUp,
  ExternalLink, Star, AlertTriangle, Clock, ShieldCheck, ShieldX,
} from "lucide-react";
import { fetchPendingKyc, reviewKyc } from "@/lib/adminApi";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://p2pbj-backend.onrender.com';

// ── Composant image authentifiée ─────────────────────────────────────────────
// Fetch avec Authorization header → blob URL local. Jamais de token dans l'URL.
function AuthImage({ path, alt, className }: { path: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!path) return;
    const token = localStorage.getItem('p2pbj_admin_token');
    let objectUrl: string;
    fetch(`${BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.blob();
      })
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setErr(true));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path]);

  if (err) return (
    <div className={`${className} flex items-center justify-center bg-red-50 text-red-400 text-xs`}>
      Erreur
    </div>
  );
  if (!src) return (
    <div className={`${className} flex items-center justify-center bg-gray-100 animate-pulse`} />
  );
  return <img src={src} alt={alt} className={className} />;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ScoreBadge({ score, unavailable }: { score: number | null; unavailable?: boolean }) {
  if (score == null) return null;
  if (unavailable) return (
    <span className="text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 bg-gray-100 text-gray-500">
      <AlertTriangle size={11} /> IA indisponible
    </span>
  );
  const color = score >= 85 ? 'bg-green-100 text-green-700' : score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 ${color}`}>
      <Star size={11} /> {score}/100
    </span>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function KycPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reasons, setReasons]   = useState<Record<string, string>>({});
  const [acting, setActing]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try { setRequests(await fetchPendingKyc()); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const decide = async (userId: string, decision: "approved" | "rejected") => {
    if (decision === "rejected" && !reasons[userId]?.trim()) {
      alert("Indiquez le motif de rejet");
      return;
    }
    setActing(userId);
    try {
      await reviewKyc(userId, decision, reasons[userId]);
      setRequests(prev => prev.filter(r => String(r.userId?._id || r.userId) !== userId));
    } catch (e: any) { alert(e.message); }
    finally { setActing(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">KYC Identité</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {requests.length} dossier{requests.length !== 1 ? "s" : ""} en attente
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded-xl">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {loading && <div className="flex justify-center py-16"><RefreshCw size={24} className="animate-spin text-[#006B3F]" /></div>}
      {error   && <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-sm">{error}</div>}

      {!loading && requests.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <CheckCircle size={48} className="text-[#006B3F] mx-auto mb-4" />
          <p className="font-bold text-gray-900">Aucun dossier en attente</p>
          <p className="text-sm text-gray-500 mt-1">Tous les dossiers KYC ont été traités</p>
        </div>
      )}

      <div className="space-y-3">
        {requests.map((r) => {
          const uid     = String(r.userId?._id || r.userId || "");
          const name    = r.userId?.displayName || r.userId?.phone || "Utilisateur inconnu";
          const isOpen  = expanded === uid;
          const hasDocs = !!(r.idCardFront || r.idCardBack || r.selfie || r.addressProof);
          const docs    = [
            { label: "Recto CNI",    path: r.idCardFront },
            { label: "Verso CNI",    path: r.idCardBack },
            { label: "Selfie",       path: r.selfie },
            { label: "Justificatif", path: r.addressProof },
          ].filter(d => d.path);

          return (
            <div key={uid} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header cliquable */}
              <button
                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : uid)}
              >
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  {r.userId?.photoUrl
                    ? <img src={r.userId.photoUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                    : <User size={18} className="text-blue-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-400">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "Date inconnue"}
                    {r.documentType && <span className="ml-2 uppercase font-medium">{r.documentType}</span>}
                  </p>
                </div>
                <ScoreBadge score={r.aiScore} unavailable={r.aiUnavailable} />
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">En attente</span>
                {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 p-5 space-y-5">

                  {/* ── Analyse IA ── */}
                  {(r.aiSummary || r.aiIssues?.length > 0 || r.aiFaceMatchConfidence != null || r.aiExpiryDate) && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analyse IA</p>

                      {r.aiSummary && (
                        <p className="text-sm text-gray-700 italic">"{r.aiSummary}"</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs">
                        {r.aiFaceMatch != null && (
                          <span className={`flex items-center gap-1 font-semibold ${r.aiFaceMatch ? 'text-green-700' : 'text-red-600'}`}>
                            {r.aiFaceMatch ? <ShieldCheck size={13} /> : <ShieldX size={13} />}
                            Visage {r.aiFaceMatch ? 'concordant' : 'non concordant'}
                            {r.aiFaceMatchConfidence != null && ` (${r.aiFaceMatchConfidence}%)`}
                          </span>
                        )}
                        {r.aiExpiryDate && (
                          <span className={`flex items-center gap-1 font-semibold ${r.aiExpired ? 'text-red-600' : 'text-green-700'}`}>
                            <Clock size={13} />
                            Expire le {r.aiExpiryDate}
                            {r.aiExpired && ' — EXPIRÉ'}
                          </span>
                        )}
                      </div>

                      {r.aiIssues?.length > 0 && (
                        <ul className="space-y-1">
                          {r.aiIssues.map((issue: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-orange-700">
                              <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* ── Documents ── */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents soumis</p>
                    {hasDocs ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {docs.map(({ label, path }) => (
                          <div key={label} className="rounded-xl overflow-hidden border border-gray-200">
                            <AuthImage
                              path={path}
                              alt={label}
                              className="w-full h-32 object-cover"
                            />
                            <a
                              href={`${BASE}${path}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => {
                                // Ouvre via fetch authentifié dans un nouvel onglet
                                e.preventDefault();
                                const token = localStorage.getItem('p2pbj_admin_token');
                                fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                                  .then(r => r.blob())
                                  .then(blob => {
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                    setTimeout(() => URL.revokeObjectURL(url), 30000);
                                  });
                              }}
                              className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-[#006B3F] transition-colors"
                            >
                              <ExternalLink size={11} />
                              {label}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Aucun document soumis</p>
                    )}
                  </div>

                  {/* ── Motif rejet ── */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Motif de rejet (requis si rejeté)
                    </label>
                    <textarea
                      value={reasons[uid] ?? ""}
                      onChange={e => setReasons(prev => ({ ...prev, [uid]: e.target.value }))}
                      placeholder="Ex: Documents illisibles, photo floue, visage non concordant..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#006B3F] resize-none"
                    />
                  </div>

                  {/* ── Actions ── */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => decide(uid, "approved")}
                      disabled={acting === uid}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#006B3F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#005a34] disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle size={16} /> Approuver
                    </button>
                    <button
                      onClick={() => decide(uid, "rejected")}
                      disabled={acting === uid}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={16} /> Rejeter
                    </button>
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
