"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, UserCheck, UserX, Ban, ShieldOff, Users } from "lucide-react";
import { fetchAgents, setUserRole, banUser, unbanUser, fetchUserByPhone } from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) return <img src={photo} alt="" className="w-9 h-9 rounded-xl object-cover" />;
  return (
    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
      <span className="text-sm font-black text-emerald-400">{(name?.[0] ?? "?").toUpperCase()}</span>
    </div>
  );
}

const ROLE_BADGE: Record<string, string> = {
  "super-admin": "bg-violet-400/10 text-violet-400 border-violet-400/20",
  agent:         "bg-blue-400/10 text-blue-400 border-blue-400/20",
  user:          "bg-white/5 text-slate-400 border-white/10",
};

const ROLE_FR: Record<string, string> = {
  "super-admin": "Super Admin",
  agent:         "Agent",
  user:          "Utilisateur",
};

export default function AgentsPage() {
  const { success, error: toastError } = useToast();
  const [agents, setAgents]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState<string | null>(null);
  const [searchPhone, setSearchPhone]   = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searching, setSearching]       = useState(false);
  const [searchError, setSearchError]   = useState("");
  const [banReason, setBanReason]       = useState("");
  const [confirm, setConfirm] = useState<{ userId: string; action: string; label: string; danger?: boolean } | null>(null);

  const load = async () => {
    setLoading(true);
    try { setAgents(await fetchAgents()); }
    catch (e: any) { toastError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const promote = async (userId: string, role: string) => {
    setActing(userId);
    try {
      await setUserRole(userId, role);
      await load();
      success(role === "agent" ? "Utilisateur promu Agent" : "Agent rétrogradé");
    } catch (e: any) {
      toastError(e.message);
    } finally {
      setActing(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setSearching(true); setSearchError(""); setSearchResult(null);
    try {
      setSearchResult(await fetchUserByPhone(searchPhone.trim()));
    } catch {
      setSearchError("Utilisateur introuvable");
    } finally {
      setSearching(false);
    }
  };

  const doConfirm = async () => {
    if (!confirm) return;
    const { userId, action } = confirm;
    setConfirm(null);
    setActing(userId);
    try {
      if (action === "ban") {
        await banUser(userId, banReason);
        success("Utilisateur banni");
      } else if (action === "unban") {
        await unbanUser(userId);
        success("Utilisateur débanni");
      }
      const updated = await fetchUserByPhone(searchPhone.trim()).catch(() => null);
      setSearchResult(updated);
      setBanReason("");
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
        <p className="text-slate-400 text-sm">{agents.length} agent{agents.length !== 1 ? "s" : ""} actif{agents.length !== 1 ? "s" : ""}</p>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Recherche utilisateur */}
      <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-5">
        <p className="font-bold text-white text-sm mb-4">Rechercher un utilisateur</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              placeholder="Numéro de téléphone (+229…)"
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button type="submit" disabled={searching}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            {searching ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
            Chercher
          </button>
        </form>

        {searchError && (
          <p className="text-red-400 text-sm mt-3 bg-red-400/10 rounded-lg px-3 py-2">{searchError}</p>
        )}

        {searchResult && (
          <div className="mt-4 p-4 bg-white/3 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={searchResult.displayName} photo={searchResult.photoUrl} />
              <div className="flex-1">
                <p className="font-semibold text-white">{searchResult.displayName || "—"}</p>
                <p className="text-sm text-slate-400">{searchResult.phone}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${ROLE_BADGE[searchResult.role] ?? ROLE_BADGE.user}`}>
                {ROLE_FR[searchResult.role] ?? searchResult.role}
              </span>
              {searchResult.isBanned && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-400/10 text-red-400 border border-red-400/20">Banni</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {searchResult.role !== "agent" && searchResult.role !== "super-admin" && (
                <button onClick={() => promote(searchResult._id, "agent")} disabled={acting === searchResult._id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-semibold hover:bg-blue-500/20 disabled:opacity-50 transition-all">
                  <UserCheck size={14} />
                  Promouvoir Agent
                </button>
              )}
              {searchResult.role === "agent" && (
                <button onClick={() => promote(searchResult._id, "user")} disabled={acting === searchResult._id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-slate-300 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 disabled:opacity-50 transition-all">
                  <ShieldOff size={14} />
                  Révoquer Agent
                </button>
              )}

              {searchResult.isBanned ? (
                <button
                  onClick={() => setConfirm({ userId: searchResult._id, action: "unban", label: "Débannir cet utilisateur" })}
                  disabled={acting === searchResult._id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold hover:bg-emerald-500/20 disabled:opacity-50 transition-all">
                  <UserCheck size={14} />
                  Débannir
                </button>
              ) : (
                <div className="flex gap-2 flex-1">
                  <input
                    value={banReason}
                    onChange={e => setBanReason(e.target.value)}
                    placeholder="Motif de bannissement…"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (!banReason.trim()) { toastError("Indiquez le motif de bannissement"); return; }
                      setConfirm({ userId: searchResult._id, action: "ban", label: "Bannir cet utilisateur", danger: true });
                    }}
                    disabled={acting === searchResult._id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold hover:bg-red-500/20 disabled:opacity-50 transition-all">
                    <Ban size={14} />
                    Bannir
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Liste agents */}
      <div>
        <p className="font-bold text-white text-sm mb-3">Agents actifs</p>
        {loading && <div className="flex justify-center py-10"><RefreshCw size={24} className="animate-spin text-emerald-500" /></div>}

        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl overflow-hidden">
          {agents.length === 0 && !loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users size={24} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm">Aucun agent</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {agents.map(a => (
                  <tr key={a._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={a.displayName} photo={a.photoUrl} />
                        <span className="font-medium text-slate-200">{a.displayName || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{a.phone}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${ROLE_BADGE[a.role] ?? ROLE_BADGE.user}`}>
                        {ROLE_FR[a.role] ?? a.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {a.role === "agent" && (
                        <button
                          onClick={() => promote(a._id, "user")}
                          disabled={acting === a._id}
                          className="text-xs text-slate-500 hover:text-red-400 font-semibold disabled:opacity-50 transition-colors"
                        >
                          Révoquer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.label ?? "Confirmer"}
        message="Cette action sera enregistrée dans le journal d'administration."
        confirmLabel={confirm?.action === "ban" ? "Bannir" : "Confirmer"}
        danger={confirm?.danger}
        onConfirm={doConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
