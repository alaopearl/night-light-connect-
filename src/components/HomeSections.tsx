import { useState } from "react";
import { motion } from "framer-motion";
import type { Lead, Property } from "../types";
import { COMPANY, STATS, REGIONS, SERVICES, WHY_US, TESTIMONIALS, WHATSAPP_LINK, PHONE_LINK } from "../constants";
import {
  WhatsappLogo,
  Phone,
  MapPin,
  HouseLine,
  Key,
  MapTrifold,
  Buildings,
  TrendUp,
  ShieldCheck,
  Heart,
  Eye,
  Star,
  Users,
  HandCoins,
  ArrowRight,
  CaretLeft,
  CaretRight,
  Clock,
  Check,
  MagnifyingGlass,
  Sparkle,
  ListChecks,
  GlobeHemisphereWest,
  MapPinArea,
  PushPin,
  Envelope,
} from "@phosphor-icons/react";

const SERVICE_ICONS = { house: HouseLine, key: Key, map: MapTrifold, building: Buildings, trend: TrendUp, shield: ShieldCheck } as const;
const WHY_ICONS = { heart: Heart, shield: ShieldCheck, eye: Eye, star: Star, users: Users, pin: MapPin } as const;

interface HomeSectionsProps {
  properties: Property[];
  onInspect: (p: Property) => void;
  onPropertyClick: (p: Property) => void;
  onNavigate: (id: string) => void;
}

export function Hero({ properties, onInspect, onPropertyClick }: Pick<HomeSectionsProps, "properties" | "onInspect" | "onPropertyClick">) {
  const featured = properties.filter((p) => p.featured);
  const [idx, setIdx] = useState(0);
  const [search, setSearch] = useState("");
  const current = featured.length > 0 ? featured[idx % featured.length] : properties[0];

  const suggestions = search.trim()
    ? featured
        .filter((p) => `${p.title} ${p.location} ${p.area} ${p.type}`.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 3)
    : [];

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#080E1A]">
      {/* Background */}
      <div className="absolute inset-0">
        <AnimatedSlide url={current?.images[0]?.url} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080E1A]/95 via-[#080E1A]/75 to-[#080E1A]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E1A] via-transparent to-[#080E1A]/70" />
        <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-24 pt-28 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-2"
          >
            <span className="flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#EAB308]">
              <Sparkle weight="fill" className="h-3 w-3" />
              Nigeria's Trusted Nationwide Real Estate Partner
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
            className="mt-6 font-serif text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
          >
            Find a Place You'll Be <span className="bg-gradient-to-r from-[#F5D97A] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">Proud to Call
            Home</span>, Anywhere in Nigeria.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: "easeOut" }}
            className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
          >
            From luxury homes in Lagos and Abuja to verified land and commercial spaces in
            Port Harcourt, Ibadan, Enugu and beyond — we connect you to genuinely verified
            opportunities across all 36 states and the FCT.
          </motion.p>

          {/* Quick search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55, ease: "easeOut" }}
            className="relative mt-8 max-w-xl"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
              <MagnifyingGlass weight="bold" className="ml-3 h-5 w-5 shrink-0 text-[#EAB308]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search duplexes, land, apartments in Lagos, Abuja, Port Harcourt…"
                className="h-11 w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" })}
                className="shrink-0 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-5 py-2.5 text-sm font-bold text-[#080E1A] transition hover:brightness-110"
              >
                Search
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/95 shadow-2xl backdrop-blur-xl">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPropertyClick(p)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                  >
                    <img src={p.images[0]?.url} alt="" className="h-11 w-14 rounded-lg object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">{p.title}</span>
                      <span className="block text-xs text-[#EAB308]">{p.price}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Critical contact buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.55, ease: "easeOut" }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <a
              href={WHATSAPP_LINK("Hello Night Light Connect! I’d like to enquire about your properties.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110"
            >
              <WhatsappLogo weight="fill" className="h-5 w-5" />
              Chat Now — 09133172414
            </a>
            <a
              href={PHONE_LINK}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:border-[#EAB308]/50 hover:text-[#EAB308]"
            >
              <Phone weight="bold" className="h-5 w-5" />
              Call — 07080210062
            </a>
          </motion.div>

          {/* Trust ticks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400"
          >
            {["Title-verified listings nationwide", "36 states & FCT coverage", "Diaspora-friendly process"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check weight="bold" className="h-3.5 w-3.5 text-emerald-400" /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Featured slider card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          {current && (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
              <img
                src={current.images[0]?.url}
                alt={current.title}
                className="h-80 w-full object-cover sm:h-[420px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#080E1A]">
                  Featured
                </span>
                <span className="rounded-full bg-[#080E1A]/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  {current.type}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-serif text-2xl font-bold text-[#EAB308]">{current.price}</p>
                <h3 className="mt-1 font-serif text-xl font-bold leading-snug text-white">{current.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                  <MapPin weight="bold" className="h-4 w-4 text-[#EAB308]" /> {current.area}, {current.location}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => onPropertyClick(current)}
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#080E1A] transition hover:bg-[#F5D97A]"
                  >
                    View Details <ArrowRight weight="bold" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onInspect(current)}
                    className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    <Clock weight="bold" className="h-4 w-4" /> Inspect
                  </button>
                </div>
              </div>

              {/* Arrows */}
              <button
                onClick={() => setIdx((i) => (i - 1 + featured.length) % featured.length)}
                className="absolute right-16 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25"
                aria-label="Previous featured property"
              >
                <CaretLeft weight="bold" className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIdx((i) => (i + 1) % featured.length)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25"
                aria-label="Next featured property"
              >
                <CaretRight weight="bold" className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="mt-4 flex justify-center gap-2">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx % featured.length ? "w-6 bg-[#EAB308]" : "w-2.5 bg-white/25"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AnimatedSlide({ url }: { url?: string }) {
  return (
    <motion.div
      key={url}
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="h-full w-full"
    >
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[#0F1B33] to-[#080E1A]" />
      )}
    </motion.div>
  );
}

const STAT_ICONS = [HandCoins, Users, MapPin, Star];

export function About({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <section id="about" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80"
                alt="Night Light Connect real estate agents at work"
                className="h-[420px] w-full object-cover sm:h-[500px]"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 rounded-2xl border border-[#D4AF37]/30 bg-[#080E1A] p-5 shadow-2xl sm:-right-6">
              <p className="font-serif text-3xl font-bold text-[#EAB308]">8+</p>
              <p className="mt-1 text-xs text-slate-300">Years of combined<br />market experience</p>
            </div>
            <div className="absolute -top-4 left-4 rounded-full border border-[#D4AF37]/40 bg-white px-4 py-2 text-xs font-bold text-[#B8860B] shadow-lg">
              <span className="flex items-center gap-1.5">
                <ShieldCheck weight="duotone" className="h-4 w-4" /> Trusted across Nigeria
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B8860B]">Who We Are</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#080E1A] sm:text-4xl">
              A <span className="text-[#B8860B]">Nationwide Beacon of Light</span> in Nigeria&apos;s Real Estate Market
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
              Night Light Connect exists because far too many Nigerians have been burnt by
              unverified agents, duplicate titles and opaque deals. We built the company they
              wished they&apos;d started with: a team that shines a light on every document,
              every plot, and every price tag.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Headquartered at 23 High Court, Lekki-Ajah Road, Lagos, we operate through
              verified partner networks and title liaisons across all 36 states and the FCT —
              connecting buyers, renters and diaspora investors to verified opportunities in
              Abuja, Port Harcourt, Ibadan, Enugu, Asaba, Kano and beyond.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { k: "Our Mission", v: "Make every property transaction transparent, verified and stress-free." },
                { k: "Our Promise", v: "Every listing is audited for title, land status and fair value." },
              ].map((m) => (
                <div key={m.k} className="rounded-2xl border border-slate-100 bg-[#F7F5F0] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B8860B]">{m.k}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{m.v}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate("services")}
              className="mt-8 flex items-center gap-2 rounded-full bg-[#080E1A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1B2B4B]"
            >
              Explore our services <ArrowRight weight="bold" className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-20 grid grid-cols-2 gap-6 rounded-3xl bg-gradient-to-br from-[#0F1B33] via-[#0B132B] to-[#080E1A] p-8 sm:p-10 lg:grid-cols-4"
        >
          {STATS.map((s, i) => {
            const Icon = STAT_ICONS[i] ?? Star;
            return (
              <div key={s.label} className="text-center">
                <Icon weight="duotone" className="mx-auto h-7 w-7 text-[#EAB308]" />
                <p className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
                  {s.value}
                  <span className="text-[#EAB308]">{s.suffix}</span>
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400 sm:text-sm">{s.label}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

const REGION_ICONS = { house: HouseLine, key: Key, map: MapTrifold, building: Buildings, trend: TrendUp, shield: ShieldCheck } as const;

export function NationwideHubs() {
  return (
    <section id="nationwide" className="relative overflow-hidden bg-[#080E1A] py-20 sm:py-24">
      <div className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#EAB308]">Nationwide Operations</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
            One Trusted Partner, <span className="text-[#EAB308]">All 36 States + FCT</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Headquartered in Lagos with active partner networks, verified title liaisons and property
            portfolios from Abuja to Port Harcourt, Ibadan, Enugu, Asaba, Kano and every region in between.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => {
            const Icon = REGION_ICONS[r.icon] ?? MapPinArea;
            return (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
                className="group rounded-3xl border border-white/5 bg-white/[0.03] p-6 transition hover:border-[#D4AF37]/40 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/10 text-[#EAB308] transition group-hover:scale-110">
                    <Icon weight="duotone" className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#EAB308]">
                    {r.short}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-lg font-bold text-white">{r.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{r.blurb}</p>
                <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#EAB308]">
                  <MapPinArea weight="fill" className="h-3.5 w-3.5" /> {r.cities}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-[#D4AF37]/25 bg-gradient-to-r from-[#D4AF37]/15 via-[#D4AF37]/5 to-transparent p-8 sm:flex-row sm:p-10"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#080E1A]">
              <GlobeHemisphereWest weight="duotone" className="h-7 w-7" />
            </span>
            <div>
              <h3 className="font-serif text-xl font-bold text-white sm:text-2xl">Looking for a property in your state?</h3>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-300">
                Tell us the state, city or estate and our nationwide network will source verified options
                for you - usually within 48 hours.
              </p>
            </div>
          </div>
          <a
            href={WHATSAPP_LINK("Hello Night Light Connect! I'd like to request a property search in my state. My state/city is: ")}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-7 py-3.5 text-sm font-bold text-[#080E1A] transition hover:brightness-110"
          >
            <PushPin weight="bold" className="h-4 w-4" /> Request Nationwide Search
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section id="services" className="bg-[#080E1A] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#EAB308]">What We Do</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
            Complete Real Estate Services, <span className="text-[#EAB308]">Under One Roof</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Whether you&apos;re buying your first home, scaling a portfolio, or renting stress-free —
            we handle every stage with expertise.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = SERVICE_ICONS[s.icon] ?? HouseLine;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
                className="group rounded-3xl border border-white/5 bg-white/[0.03] p-6 transition hover:border-[#D4AF37]/40 hover:bg-white/[0.06]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/10 text-[#EAB308] transition group-hover:scale-110">
                  <Icon weight="duotone" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-serif text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                <a
                  href={WHATSAPP_LINK(`Hello Night Light Connect! I’d like to discuss ${s.title}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#EAB308] transition group-hover:gap-2.5"
                >
                  Enquire now <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyUs() {
  return (
    <section id="why-us" className="bg-[#F7F5F0] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B8860B]">The Difference</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#080E1A] sm:text-4xl">
            Why Homeowners & Investors <span className="text-[#B8860B]">Choose Us</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map((w, i) => {
            const Icon = WHY_ICONS[w.icon] ?? ShieldCheck;
            return (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
                className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EEDF] text-[#B8860B]">
                  <Icon weight="duotone" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-serif text-lg font-bold text-[#080E1A]">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{w.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const [idx, setIdx] = useState(0);
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B8860B]">Client Stories</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#080E1A] sm:text-4xl">
            Trusted by Families & <span className="text-[#B8860B]">Diaspora Investors</span>
          </h2>
        </div>

        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative mt-12 rounded-3xl border border-slate-100 bg-[#F7F5F0] p-8 text-center sm:p-12"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] font-serif text-2xl font-bold text-[#080E1A]">
            “
          </span>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-slate-700 sm:text-xl">
            {TESTIMONIALS[idx].text}
          </p>
          <div className="mt-6 flex justify-center gap-1 text-[#D4AF37]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} weight="fill" className="h-4 w-4" />
            ))}
          </div>
          <p className="mt-3 text-sm font-bold text-[#080E1A]">{TESTIMONIALS[idx].name}</p>
          <p className="text-xs text-slate-500">{TESTIMONIALS[idx].role}</p>
        </motion.div>

        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#D4AF37] hover:text-[#B8860B]"
            aria-label="Previous testimonial"
          >
            <CaretLeft weight="bold" className="h-4 w-4" />
          </button>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-[#B8860B]" : "w-2 bg-slate-300"}`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
          <button
            onClick={() => setIdx((i) => (i + 1) % TESTIMONIALS.length)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#D4AF37] hover:text-[#B8860B]"
            aria-label="Next testimonial"
          >
            <CaretRight weight="bold" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

interface ContactProps {
  onLead?: (lead: Omit<Lead, "id" | "createdAt" | "source">) => void;
}

export function Contact({ onLead }: ContactProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hello Night Light Connect! My name is ${form.name || "—"}.%0A%0A${form.message || "I’d like to make an enquiry."}%0A%0APhone: ${form.phone || "—"}%0AEmail: ${form.email || "—"}`;
    window.open(WHATSAPP_LINK(msg.split("%0A").join(String.fromCharCode(10))), "_blank");
    onLead?.({ name: form.name, phone: form.phone, email: form.email, message: form.message, propertyTitle: "General enquiry" });
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="bg-[#080E1A] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#EAB308]">Get In Touch</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
            Let&apos;s Talk About <span className="text-[#EAB308]">Your Next Move</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            One message is all it takes. Our team responds fast — usually within hours — with
            honest answers and options that match your budget.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: WhatsappLogo, label: "WhatsApp (fastest)", value: COMPANY.whatsappNumber, href: WHATSAPP_LINK("Hello Night Light Connect!") },
              { icon: Phone, label: "Phone / Call", value: COMPANY.phone, href: PHONE_LINK },
              { icon: Envelope, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
              { icon: MapPin, label: "Head Office", value: COMPANY.address },
              { icon: Clock, label: "Office Hours", value: COMPANY.hours },
            ].map((c) => (
              <li key={c.label} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#EAB308]">
                  <c.icon weight="duotone" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-sm font-semibold text-white transition hover:text-[#EAB308]">
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-white">{c.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
          <h3 className="font-serif text-xl font-bold text-white">Send a Quick Enquiry</h3>
          <p className="mt-1 text-xs text-slate-500">Opens WhatsApp with your message pre-filled.</p>
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#D4AF37]"
              />
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
                className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#D4AF37]"
              />
            </div>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email (optional)"
              type="email"
              className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#D4AF37]"
            />
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="I’m looking for… (area, budget, property type)"
              rows={4}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#D4AF37]"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 text-sm font-bold text-white transition hover:brightness-110"
              >
                <WhatsappLogo weight="fill" className="h-4 w-4" />
                Send via WhatsApp
              </button>
              <a
                href={PHONE_LINK}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-bold text-white transition hover:border-[#EAB308]/50 hover:text-[#EAB308]"
              >
                <Phone weight="bold" className="h-4 w-4" /> Call us instead
              </a>
            </div>
            {sent && (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-400">
                <Check weight="bold" className="h-4 w-4" /> Opening WhatsApp — please press send to deliver your message.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export function StatsStrip() {
  return null;
}

export default {
  Hero,
  About,
  NationwideHubs,
  Services,
  WhyUs,
  Testimonials,
  Contact,
};