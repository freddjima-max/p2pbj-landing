"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw, CheckCircle, XCircle, User, ChevronDown, ChevronUp,
  ExternalLink, Star, AlertTriangle, Clock, ShieldCheck, ShieldX, FileCheck,
} from "lucide-react";
import { fetchPendingKyc, reviewKyc } from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://p2pbj-backend.onrender.com";

function AuthImage({ path, alt, className }: { path: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!path) return;
    const token = localStorage.getItem("p2pbj_admin_token");
    let objectUrl: string;
    fetch(`${BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => { if (!r.ok) throw new Error(); return r.blob(); })
      .then(blob => { objectUrl = URL.createObjectURL(blob); setSrc(objectUrl); })
      .catch(() => setErr(true));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path]);

  if (err) return (
    <div className={`${className} flex items-center justify-center bg-red-500/10 text-red-400 text-xs`}>Erreur</div>
  );
  if (!src) return (
    <div className={`${className} flex items-center justify-center bg-white/5 animate-pulse`} />
  );
  return <img src={src} alt={alt} className={className} />;
}

function ScoreBadge({ score, unavailable }: { score: number | null; unavailable?: boolean }) {
  if (score == null) return null;
  if (unavailable) return (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 bg-white/5 text-slate-400 border border-white/10">
      <AlertTriangle size={11} /> IA indisponible
    </span>
  );
  const style =
    score >= 85 ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
    score >= 60 ? "bg-amber-400/10 text-amber-400 border-amber-400/20" :
    "bg-red-400/10 text-red-400 border-red-400/20";
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 border ${style}`}>
      <Star size={11} /> {score}/100
    </span>
  );
}

export default function KycPage() {
  const { success, error: toastError } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reasons, setReasons]   = useState<Record<string, string>>({});
  const [acting, setActing]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setRequests(await fetchPendingKyc()); }
    catch (e: any) { toastError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const decide = async (userId: string, decision: "approved" | "rejected") => {
    if (decision === "rejected" && !reasons[userId]?.trim()) {
      toastError("Indiquez le motif de rejet");
      return;
    }
    setActing(userId);
    try {
      await reviewKyc(userId, decision, reasons[userId]);
      setRequests(prev => prev.filter(r => String(r.userId?._id || r.userId) !== userId));
      success(decision === "approved" ? "KYC approuvé avec succès" : "KYC rejeté");
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
        <p className="text-slate-400 text-sm">
          {requests.length} dossier{requests.length !== 1 ? "s" : ""} en attente
        </p>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {loading && <div className="flex justify-center py-16"><RefreshCw size={24} className="animate-spin text-emerald-500" /></div>}

      {!loading && requests.length === 0 && (
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileCheck size={32} className="text-emerald-400" />
          </div>
          <p className="font-bold text-white">Aucun dossier en attente</p>
          <p className="text-sm text-slate-500 mt-1">Tous les dossiers KYC ont été traités</p>
        </div>
      )}

      <div className="space-y-2">
        {requests.map((r) => {
          const uid    = String(r.userId?._id || r.userId || "");
          const name   = r.userId?.displayName || r.userId?.phone || "Utilisateur inconnu";
          const isOpen = expanded === uid;
          const docs   = [
            { label: "Recto CNI",    path: r.idCardFront },
            { label: "Verso CNI",    path: r.idCardBack },
            { label: "Selfie",       path: r.selfie },
            { label: "Justificatif", path: r.addressProof },
          ].filter(d => d.path);

          return (
            <div key={uid} className="bg-[#1a1f2e] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
              <button
                className="w-full flex items-center gap-4 p-5 text-left"
                onClick={() => setExpanded(isOpen ? null : uid)}
              >
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {r.userId?.photoUrl
                    ? <img src={r.userId.photoUrl} className="w-10 h-10 rounded-xl object-cover" alt="" />
                    : <User size={17} className="text-blue-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">{name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "Date inconnue"}
                    {r.documentType && <span className="ml-2 uppercase font-medium text-slate-400">{r.documentType}</span>}
                  </p>
                </div>
                <ScoreBadge score={r.aiScore} unavailable={r.aiUnavailable} />
                <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">En attente</span>
                {isOpen ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-white/5 p-5 space-y-5">

                  {/* Analyse IA */}
                  {(r.aiSummary || r.aiIssues?.length > 0 || r.aiFaceMatchConfidence != null || r.aiExpiryDate) && (
                    <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analyse IA</p>
                      {r.aiSummary && (
                        <p className="text-sm text-slate-300 italic">"{r.aiSummary}"</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {r.aiFaceMatch != null && (
                          <span className={`flex items-center gap-1.5 font-semibold ${r.aiFaceMatch ? "text-emerald-400" : "text-red-400"}`}>
                            {r.aiFaceMatch ? <ShieldCheck size={13} /> : <ShieldX size={13} />}
                            Visage {r.aiFaceMatch ? "concordant" : "non concordant"}
                            {r.aiFaceMatchConfidence != null && ` (${r.aiFaceMatchConfidence}%)`}
                          </span>
                        )}
                        {r.aiExpiryDate && (
                          <span className={`flex items-center gap-1.5 font-semibold ${r.aiExpired ? "text-red-400" : "text-emerald-400"}`}>
                            <Clock size={13} />
                            Expire le {r.aiExpiryDate}
                            {r.aiExpired && " — EXPIRÉ"}
                          </span>
                        )}
                      </div>
                      {r.aiIssues?.length > 0 && (
                        <ul className="space-y-1.5">
                          {r.aiIssues.map((issue: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-amber-400 bg-amber-400/5 rounded-lg px-3 py-2">
                              <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Documents soumis</p>
                    {docs.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {docs.map(({ label, path }) => (
                          <div key={label} className="rounded-xl overflow-hidden border border-white/5 bg-white/3">
                            <AuthImage path={path} alt={label} className="w-full h-32 object-cover" />
                            <button
                              className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                              onClick={() => {
                                const token = localStorage.getItem("p2pbj_admin_token");
                                fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                                  .then(r => r.blob())
                                  .then(blob => {
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, "_blank");
                                    setTimeout(() => URL.revokeObjectURL(url), 30000);
                                  });
                              }}
                            >
                              <ExternalLink size={11} />
                              {label}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Aucun document soumis</p>
                    )}
                  </div>

                  {/* Motif rejet */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Motif de rejet (requis si rejeté)
                    </label>
                    <textarea
                      value={reasons[uid] ?? ""}
                      onChange={e => setReasons(prev => ({ ...prev, [uid]: e.target.value }))}
                      placeholder="Ex: Documents illisibles, photo floue, visage non concordant…"
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => decide(uid, "approved")}
                      disabled={acting === uid}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle size={16} /> Approuver
                    </button>
                    <button
                      onClick={() => decide(uid, "rejected")}
                      disabled={acting === uid}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 transition-colors"
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
