"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, UserCheck, UserX, Ban, ShieldOff } from "lucide-react";
import { fetchAgents, setUserRole, banUser, unbanUser, fetchUserByPhone } from "@/lib/adminApi";

function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) return <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover" />;
  return (
    <div className="w-9 h-9 rounded-full bg-[#E6F4ED] flex items-center justify-center">
      <span className="text-sm font-bold text-[#006B3F]">{name?.[0]?.toUpperCase() ?? "?"}</span>
    </div>
  );
}

const ROLE_BADGE: Record<string, string> = {
  "super-admin": "bg-purple-100 text-purple-700",
  agent:         "bg-blue-100 text-blue-700",
  user:          "bg-gray-100 text-gray-600",
};

export default function AgentsPage() {
  const [agents, setAgents]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [acting, setActing]   = useState<string | null>(null);

  // Recherche utilisateur
  const [searchPhone, setSearchPhone] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [banReason, setBanReason] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setAgents(await fetchAgents()); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const promote = async (userId: string, role: string) => {
    setActing(userId);
    try { await setUserRole(userId, role); await load(); }
    catch (e: any) { alert(e.message); }
    finally { setActing(null); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setSearching(true); setSearchError(""); setSearchResult(null);
    try {
      const u = await fetchUserByPhone(searchPhone.trim());
      setSearchResult(u);
    } catch (e: any) {
      setSearchError("Utilisateur introuvable");
    } finally {
      setSearching(false);
    }
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    if (!isBanned && !banReason.trim()) { alert("Indiquez le motif de bannissement"); return; }
    setActing(userId);
    try {
      if (isBanned) await unbanUser(userId);
      else await banUser(userId, banReason);
      const updated = await fetchUserByPhone(searchPhone.trim()).catch(() => null);
      setSearchResult(updated);
      setBanReason("");
    } catch (e: any) { alert(e.message); }
    finally { setActing(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Agents & Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{agents.length} agent{agents.length !== 1 ? "s" : ""} actif{agents.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded-xl">
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Recherche utilisateur */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4">Rechercher un utilisateur</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              placeholder="Numéro de téléphone..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#006B3F]"
            />
          </div>
          <button type="submit" disabled={searching}
            className="px-4 py-2.5 bg-[#006B3F] text-white rounded-xl text-sm font-semibold hover:bg-[#005a34] disabled:opacity-50 transition-colors">
            {searching ? <RefreshCw size={16} className="animate-spin" /> : "Chercher"}
          </button>
        </form>

        {searchError && <p className="text-red-500 text-sm mt-3">{searchError}</p>}

        {searchResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={searchResult.displayName} photo={searchResult.photoUrl} />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{searchResult.displayName || "—"}</p>
                <p className="text-sm text-gray-500">{searchResult.phone}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${ROLE_BADGE[searchResult.role] ?? ROLE_BADGE.user}`}>
                {searchResult.role || "user"}
              </span>
              {searchResult.isBanned && (
                <span className="text-xs px-2 py-1 rounded-full font-semibold bg-red-100 text-red-600">Banni</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {searchResult.role !== "agent" && searchResult.role !== "super-admin" && (
                <button onClick={() => promote(searchResult._id, "agent")} disabled={acting === searchResult._id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-xl text-xs font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
                  <UserCheck size={14} />
                  Promouvoir Agent
                </button>
              )}
              {searchResult.role === "agent" && (
                <button onClick={() => promote(searchResult._id, "user")} disabled={acting === searchResult._id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors">
                  <ShieldOff size={14} />
                  Révoquer Agent
                </button>
              )}
              {searchResult.isBanned ? (
                <button onClick={() => handleBan(searchResult._id, true)} disabled={acting === searchResult._id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-xs font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors">
                  <UserCheck size={14} />
                  Débannir
                </button>
              ) : (
                <div className="flex gap-2 flex-1">
                  <input
                    value={banReason}
                    onChange={e => setBanReason(e.target.value)}
                    placeholder="Motif de bannissement..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-red-400"
                  />
                  <button onClick={() => handleBan(searchResult._id, false)} disabled={acting === searchResult._id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
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
        <h3 className="font-bold text-gray-900 mb-3">Agents actifs</h3>
        {loading && <div className="flex justify-center py-10"><RefreshCw size={24} className="animate-spin text-[#006B3F]" /></div>}
        {error   && <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-sm">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {agents.length === 0 && !loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Aucun agent</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agents.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={a.displayName} photo={a.photoUrl} />
                        <span className="font-medium text-gray-900">{a.displayName || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_BADGE[a.role] ?? ROLE_BADGE.user}`}>
                        {a.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.role === "agent" && (
                        <button onClick={() => promote(a._id, "user")} disabled={acting === a._id}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-50 transition-colors">
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
    </div>
  );
}
