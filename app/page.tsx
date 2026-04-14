"use client";

import Image from "next/image";
import {
  ShieldCheck,
  Smartphone,
  Tag,
  Home,
  Car,
  Sofa,
  TrendingUp,
  Users,
  MapPin,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Bell,
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handlePreInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitState("loading");
    try {
      const res = await fetch("https://p2pbj-backend.onrender.com/api/v1/config/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubmitState("success");
        setEmail("");
      } else {
        setSubmitState("error");
      }
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Image src="/logo.png" alt="P2P.BJ" width={100} height={40} className="object-contain" />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#fonctionnalites" className="hover:text-[#008751] transition-colors">Fonctionnalités</a>
            <a href="#comment" className="hover:text-[#008751] transition-colors">Comment ça marche</a>
            <a href="#investisseurs" className="hover:text-[#008751] transition-colors">Investisseurs</a>
            <a href="/admin" className="hover:text-[#008751] transition-colors text-gray-400 text-xs">Admin</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="#telecharger"
              className="px-5 py-2 bg-[#008751] text-white rounded-full text-sm font-semibold hover:bg-[#006b40] transition-colors"
            >
              Télécharger l'app
            </a>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4 text-sm font-medium">
            <a href="#fonctionnalites" onClick={() => setMenuOpen(false)} className="text-gray-700">Fonctionnalités</a>
            <a href="#comment" onClick={() => setMenuOpen(false)} className="text-gray-700">Comment ça marche</a>
            <a href="#investisseurs" onClick={() => setMenuOpen(false)} className="text-gray-700">Investisseurs</a>
            <a
              href="#telecharger"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-2 bg-[#008751] text-white rounded-full text-center font-semibold"
            >
              Télécharger l'app
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="gradient-hero pt-28 pb-20 px-4 sm:px-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-[#FCD116] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E8112D] rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block badge-yellow text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
                🇧🇯 Made in Bénin
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                Le <span className="text-[#FCD116]">marché digital</span> des
                Béninois
              </h1>

              <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-xl mx-auto lg:mx-0">
                P2P.BJ, c'est le LeBonCoin du Bénin — achetez, vendez et louez
                entre particuliers, sans intermédiaire et en toute sécurité.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#telecharger"
                  className="flex items-center justify-center gap-2 bg-[#FCD116] text-gray-900 px-7 py-4 rounded-full font-bold text-base hover:bg-yellow-300 transition-colors shadow-lg"
                >
                  <Smartphone size={20} />
                  Télécharger gratuitement
                </a>
                <a
                  href="#comment"
                  className="flex items-center justify-center gap-2 border-2 border-white/40 text-white px-7 py-4 rounded-full font-semibold text-base hover:bg-white/10 transition-colors"
                >
                  Comment ça marche
                  <ChevronRight size={18} />
                </a>
              </div>

              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#FCD116]" />
                  Gratuit
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#FCD116]" />
                  Paiement MoMo
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#FCD116]" />
                  100% sécurisé
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="flex-1 flex justify-center lg:justify-end float-animation">
              <div className="relative w-64 sm:w-72">
                <div className="bg-white/10 backdrop-blur rounded-[2.5rem] p-3 border border-white/20 shadow-2xl">
                  <div className="bg-[#005c37] rounded-[2rem] p-6 min-h-[480px] flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                      <Image src="/logo.png" alt="P2P.BJ" width={70} height={28} className="object-contain brightness-200" />
                      <div className="w-8 h-8 bg-[#FCD116] rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-900">3</span>
                      </div>
                    </div>

                    {/* Mock annonce cards */}
                    {[
                      { icon: "🏠", title: "Appartement F3 – Cotonou", price: "150 000 FCFA/mois", cat: "Immobilier" },
                      { icon: "🚗", title: "Toyota Corolla 2019", price: "6 500 000 FCFA", cat: "Véhicules" },
                      { icon: "📱", title: "iPhone 13 – Comme neuf", price: "280 000 FCFA", cat: "Électronique" },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                          <p className="text-[#FCD116] text-xs font-bold">{item.price}</p>
                          <p className="text-green-300 text-[10px]">{item.cat}</p>
                        </div>
                      </div>
                    ))}

                    <div className="mt-auto bg-[#FCD116] rounded-xl py-3 text-center">
                      <span className="text-gray-900 text-xs font-bold">+ Publier une annonce</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10 000+", label: "Annonces publiées" },
            { value: "5 000+", label: "Utilisateurs actifs" },
            { value: "12", label: "Catégories" },
            { value: "100%", label: "Gratuit" },
          ].map((stat, i) => (
            <div key={i} className="p-4">
              <p className="text-3xl font-black text-[#008751]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FONCTIONNALITES ─────────────────────────────────── */}
      <section id="fonctionnalites" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#008751] font-semibold text-sm uppercase tracking-wider">Fonctionnalités</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Une plateforme pensée pour le quotidien des Béninois, simple, rapide et sécurisée.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Tag size={28} className="text-[#008751]" />,
                title: "Achetez & Vendez",
                desc: "Publiez une annonce en 2 minutes. Touchez des milliers d'acheteurs dans tout le Bénin.",
                bg: "bg-green-50",
              },
              {
                icon: <Home size={28} className="text-[#E8112D]" />,
                title: "Location immobilière",
                desc: "Appartements, maisons, bureaux — trouvez ou proposez votre bien facilement.",
                bg: "bg-red-50",
              },
              {
                icon: <Car size={28} className="text-[#FCD116]" />,
                title: "Véhicules",
                desc: "Voitures, motos, tricycles — le marché auto du Bénin au bout des doigts.",
                bg: "bg-yellow-50",
              },
              {
                icon: <ShieldCheck size={28} className="text-[#008751]" />,
                title: "Paiement sécurisé",
                desc: "MTN MoMo, Moov Money et Celtiis intégrés. Payez sans quitter l'app.",
                bg: "bg-green-50",
              },
              {
                icon: <Zap size={28} className="text-[#E8112D]" />,
                title: "Annonces vérifiées",
                desc: "Modération IA pour garantir des annonces fiables et des profils authentiques.",
                bg: "bg-red-50",
              },
              {
                icon: <MapPin size={28} className="text-[#FCD116]" />,
                title: "Géolocalisation",
                desc: "Trouvez des annonces près de chez vous à Cotonou, Porto-Novo, Parakou et partout au Bénin.",
                bg: "bg-yellow-50",
              },
            ].map((f, i) => (
              <div key={i} className={`${f.bg} rounded-2xl p-6 card-hover`}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT CA MARCHE ───────────────────────────────── */}
      <section id="comment" className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#008751] font-semibold text-sm uppercase tracking-wider">Simple & Rapide</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-4">Comment ça marche ?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-[#008751]/20" />

            {[
              {
                step: "01",
                title: "Inscrivez-vous",
                desc: "Créez votre compte en 30 secondes avec votre numéro de téléphone. C'est gratuit.",
                icon: <Users size={32} className="text-[#008751]" />,
              },
              {
                step: "02",
                title: "Publiez ou cherchez",
                desc: "Déposez votre annonce avec photos, ou parcourez des milliers d'offres près de chez vous.",
                icon: <Sofa size={32} className="text-[#008751]" />,
              },
              {
                step: "03",
                title: "Concluez en sécurité",
                desc: "Discutez via la messagerie intégrée et payez directement par Mobile Money.",
                icon: <ShieldCheck size={32} className="text-[#008751]" />,
              },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  {s.icon}
                </div>
                <span className="text-[#FCD116] font-black text-4xl absolute -top-3 left-1/2 -translate-x-1/2 opacity-20 select-none">
                  {s.step}
                </span>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-10">Explorez toutes les catégories</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "🏠 Immobilier", "🚗 Véhicules", "📱 Électronique", "👗 Mode",
              "🛋️ Maison & Jardin", "💼 Emploi", "🐾 Animaux", "🎓 Formation",
              "⚙️ Services", "🎮 Loisirs", "🍽️ Alimentation", "🔧 Matériaux",
            ].map((cat, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-[#008751] hover:text-white transition-colors cursor-pointer"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── INVESTISSEURS ───────────────────────────────────── */}
      <section id="investisseurs" className="py-20 px-4 sm:px-6 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="inline-block bg-[#FCD116] text-gray-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
                Opportunité d'investissement
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
                Investissez dans le{" "}
                <span className="text-[#FCD116]">commerce digital</span>{" "}
                ouest-africain
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Le Bénin compte plus de 13 millions d'habitants et un taux de pénétration mobile en forte croissance.
                P2P.BJ est positionné pour devenir la référence du commerce entre particuliers en Afrique de l'Ouest,
                en commençant par le Bénin.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <Globe size={20} />, label: "Marché adressable", value: "UEMOA — 130M hab." },
                  { icon: <TrendingUp size={20} />, label: "Croissance mobile", value: "+18% / an" },
                  { icon: <Users size={20} />, label: "Cible an 1", value: "50 000 utilisateurs" },
                  { icon: <Star size={20} />, label: "Modèle", value: "Freemium + SaaS" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-[#FCD116] mb-2">{item.icon}</div>
                    <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-bold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              <a
                href="mailto:invest@p2pmarketplace.net"
                className="inline-flex items-center gap-2 bg-[#FCD116] text-gray-900 px-7 py-4 rounded-full font-bold hover:bg-yellow-300 transition-colors"
              >
                Contacter l'équipe
                <ChevronRight size={18} />
              </a>
            </div>

            <div className="flex-1 w-full">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h3 className="font-bold text-xl mb-6 text-[#FCD116]">Pourquoi P2P.BJ ?</h3>
                <div className="space-y-4">
                  {[
                    "Premier acteur P2P structuré au Bénin",
                    "Paiement Mobile Money 100% intégré (MTN, Moov, Celtiis)",
                    "Modération IA pour des annonces fiables",
                    "Équipe locale avec expertise terrain",
                    "Potentiel d'extension UEMOA validé",
                    "MVP fonctionnel — traction déjà en cours",
                  ].map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-[#008751] mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRE-INSCRIPTION ──────────────────────────────────── */}
      <section id="telecharger" className="py-20 px-4 sm:px-6 gradient-cta text-white text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bell size={32} className="text-[#FCD116]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Soyez parmi les premiers
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            P2P.BJ arrive bientôt. Laissez votre email pour être notifié en avant-première au lancement.
          </p>

          {submitState === "success" ? (
            <div className="bg-white/10 border border-white/20 rounded-2xl px-8 py-6">
              <CheckCircle size={40} className="text-[#FCD116] mx-auto mb-3" />
              <p className="text-white font-bold text-lg">Vous êtes inscrit !</p>
              <p className="text-green-200 text-sm mt-1">On vous préviendra dès le lancement.</p>
            </div>
          ) : (
            <form onSubmit={handlePreInscription} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="flex-1 px-5 py-4 rounded-full text-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-[#FCD116]"
              />
              <button
                type="submit"
                disabled={submitState === "loading"}
                className="px-7 py-4 bg-[#FCD116] text-gray-900 rounded-full font-bold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {submitState === "loading" ? "..." : "Me notifier"}
              </button>
            </form>
          )}

          {submitState === "error" && (
            <p className="mt-3 text-red-300 text-sm">Une erreur est survenue. Réessayez.</p>
          )}

          <div className="mt-10 flex items-center justify-center gap-6 opacity-50">
            <div className="flex items-center gap-2 text-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M3.18 23.76c.36.2.77.24 1.16.12l12.93-7.47-2.9-2.9-11.19 10.25zM.5 1.4C.19 1.83 0 2.4 0 3.1v17.8c0 .7.19 1.27.5 1.7l.09.09 9.97-9.97v-.24L.59 1.31.5 1.4zM20.12 10.52l-2.57-1.48-3.22 3.22 3.22 3.22 2.58-1.49c.74-.43.74-1.1 0-1.47h-.01zM4.34.12L17.27 7.6l-2.9 2.9L3.18.24C3.57.12 3.98.12 4.34.12z" /></svg>
              Google Play
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              App Store
            </div>
            <span className="text-sm">Bientôt disponible</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <Image src="/logo.png" alt="P2P.BJ" width={90} height={36} className="object-contain brightness-200 mb-4" />
              <p className="text-sm leading-relaxed">
                La place de marché digitale des Béninois. Achetez, vendez, louez en toute confiance.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Déposer une annonce</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Parcourir les annonces</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Télécharger l'app</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#investisseurs" className="hover:text-white transition-colors">Investisseurs</a></li>
                <li><a href="mailto:contact@p2pmarketplace.net" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 P2P.BJ — Tous droits réservés 🇧🇯</p>
            <p>Fait avec ❤️ au Bénin</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
