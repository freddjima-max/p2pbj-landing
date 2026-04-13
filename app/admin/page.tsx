"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Phone, KeyRound, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { sendOtp, verifyOtp } from "@/lib/adminApi";

export default function AdminLogin() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fullPhone = `+229${phone.replace(/\s/g, "")}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone.trim()) { setError("Numéro requis"); return; }
    setLoading(true);
    try {
      const res = await sendOtp(fullPhone);
      setStep("otp");
      // En développement, pré-remplir le code OTP reçu en réponse
      if ((res as any)?.devOtp) setOtp((res as any).devOtp);
    } catch (err: any) {
      setError(err.message ?? "Impossible d'envoyer le code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length < 4) { setError("Code invalide"); return; }
    setLoading(true);
    try {
      const { user } = await verifyOtp(fullPhone, otp.trim());
      if (user?.role !== "super-admin" && user?.role !== "agent") {
        setError("Accès réservé aux administrateurs");
        localStorage.removeItem("p2pbj_admin_token");
        localStorage.removeItem("p2pbj_admin_user");
        setLoading(false);
        return;
      }
      router.replace("/admin/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Code incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#006B3F] rounded-2xl mb-4 shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Administration P2P.BJ</h1>
          <p className="text-gray-500 text-sm mt-1">Accès réservé aux administrateurs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#006B3F] focus-within:ring-2 focus-within:ring-[#006B3F]/10 transition-all">
                  <div className="flex items-center gap-2 px-3 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                    <span className="text-lg">🇧🇯</span>
                    <span className="text-sm font-semibold text-gray-700">+229</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9\s]/g, "");
                      setPhone(val);
                    }}
                    placeholder="01 97 XX XX XX"
                    maxLength={14}
                    className="flex-1 px-4 py-3 text-sm focus:outline-none bg-white"
                    autoFocus
                    autoComplete="tel-national"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#006B3F] text-white py-3 rounded-xl font-semibold hover:bg-[#005a34] transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Recevoir le code
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code de vérification
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Code envoyé au <span className="font-semibold">+229 {phone}</span>
                </p>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10 tracking-widest text-center text-lg font-bold"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#006B3F] text-white py-3 rounded-xl font-semibold hover:bg-[#005a34] transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                Accéder au tableau de bord
              </button>

              <button
                type="button"
                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Changer de numéro
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          P2P.BJ Admin · Accès sécurisé
        </p>
      </div>
    </div>
  );
}
