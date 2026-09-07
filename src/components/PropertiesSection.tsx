import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Property, Filters } from "../types";
import { LOCATIONS, TYPES, PURPOSES, BED_OPTIONS, WHATSAPP_LINK, PHONE_LINK } from "../constants";
import {
  MagnifyingGlass,
  MapPin,
  Bed,
  Bathtub,
  Ruler,
  SlidersHorizontal,
  X,
  ArrowRight,
  ArrowClockwise,
  WhatsappLogo,
  Phone,
  MapTrifold,
  Fire,
  Check,
  CaretLeft,
  CaretRight,
  CalendarPlus,
  ShieldCheck,
  Key,
} from "@phosphor-icons/react";

interface PropertiesSectionProps {
  properties: Property[];
  onInspect: (property: Property) => void;
  onNavigateProps: (id: string) => void;
}

const PRICE_RANGES = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under ₦50m", min: 0, max: 50_000_000 },
  { label: "₦50m – ₦100m", min: 50_000_000, max: 100_000_000 },
  { label: "₦100m – ₦200m", min: 100_000_000, max: 200_000_000 },
  { label: "Above ₦200m", min: 200_000_000, max: Infinity },
];

const EMPTY_FILTERS: Filters = {
  search: "",
  location: "All Nigeria",
  type: "All Types",
  purpose: "All Purposes",
  minPrice: 0,
  maxPrice: Infinity,
  beds: "Any Beds",
};

export default function PropertiesSection({ properties, onInspect, onNavigateProps }: PropertiesSectionProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const q = filters.search.trim().toLowerCase();
      if (q && !`${p.title} ${p.location} ${p.area} ${p.type}`.toLowerCase().includes(q)) return false;
      if (filters.location !== "All Nigeria" && p.location !== filters.location) return false;
      if (filters.type !== "All Types" && p.type !== filters.type) return false;
      if (filters.purpose !== "All Purposes" && p.purpose !== filters.purpose) return false;
      if (p.priceNumeric < filters.minPrice || p.priceNumeric > filters.maxPrice) return false;
      if (filters.beds !== "Any Beds") {
        const min = parseInt(filters.beds, 10);
        if (filters.beds === "5+" ? p.beds < 5 : p.beds !== min) return false;
      }
      return true;
    });
  }, [filters, properties]);

  const update = (key: keyof Filters, value: string | number) =>
    setFilters((f) => ({ ...f, [key]: value }));

  return (
    <section id="properties" className="bg-[#F7F5F0] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B8860B]">
              Featured Listings
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#080E1A] sm:text-4xl">
              Handpicked Properties, <span className="text-[#B8860B]">Verified Titles</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Every listing below passes our nationwide title audit before it goes live. Search across
              Lagos, Abuja, Port Harcourt, Ibadan, Enugu and more to find the home or land that fits your goals.
            </p>
          </div>
          <button
            onClick={() => onNavigateProps("why-us")}
            className="group hidden items-center gap-2 text-sm font-semibold text-[#080E1A] transition hover:text-[#B8860B] lg:flex"
          >
            Why title verification matters
            <ArrowRight weight="bold" className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
        </div>

        {/* Search row */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              placeholder="Search by title, area, or location…"
              className="h-13 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
            {(
              [
                { key: "location", options: LOCATIONS },
                { key: "type", options: TYPES },
                { key: "purpose", options: PURPOSES.map((p) => (p === "sale" ? "For Sale" : p === "rent" ? "For Rent" : "All Purposes")) },
              ] as const
            ).map(({ key, options }) => (
              <select
                key={key}
                value={key === "purpose" ? (filters.purpose === "sale" ? "For Sale" : filters.purpose === "rent" ? "For Rent" : "All Purposes") : filters[key]}
                onChange={(e) => {
                  const v = e.target.value;
                  update(key, key === "purpose" ? (v === "For Sale" ? "sale" : v === "For Rent" ? "rent" : "All Purposes") : v);
                }}
                className="h-13 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#D4AF37]"
              >
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ))}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#D4AF37] hover:text-[#B8860B]"
            >
              <SlidersHorizontal weight="bold" className="h-4 w-4" />
              More
            </button>
          </div>
        </div>

        {/* Advanced filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Price range</label>
                  <select
                    value={filters.minPrice}
                    onChange={(e) => {
                      const r = PRICE_RANGES[Number(e.target.value)] ?? PRICE_RANGES[0];
                      setFilters((f) => ({ ...f, minPrice: r.min, maxPrice: r.max }));
                    }}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#D4AF37]"
                  >
                    {PRICE_RANGES.map((r, i) => (
                      <option key={r.label} value={i}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bedrooms</label>
                  <select
                    value={filters.beds}
                    onChange={(e) => update("beds", e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#D4AF37]"
                  >
                    {BED_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters(EMPTY_FILTERS)}
                    className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-[#D4AF37] hover:text-[#B8860B]"
                  >
                    <ArrowClockwise weight="bold" className="h-4 w-4" />
                    Reset filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result count */}
        <p className="mt-6 text-sm text-slate-500">
          Showing <span className="font-semibold text-[#080E1A]">{filtered.length}</span> of{" "}
          <span className="font-semibold text-[#080E1A]">{properties.length}</span> properties
        </p>

        {/* Grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} onInspect={onInspect} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
            <MapTrifold weight="duotone" className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 font-serif text-xl font-bold text-[#080E1A]">No properties found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try adjusting your search or filters — or message us and we&apos;ll source it from any state in Nigeria.
            </p>
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="mt-5 rounded-full bg-[#080E1A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B2B4B]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// --- Property card & modal ---

function PropertyCard({ property: p, onInspect }: { property: Property; onInspect: (p: Property) => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const images = p.images.length > 0 ? p.images : [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80", alt: p.title }];

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/50"
      >
        <div className="relative h-60 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              src={images[imgIdx].url}
              alt={images[imgIdx].alt}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              onClick={() => setOpen(true)}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#080E1A]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#EAB308] backdrop-blur">
              {p.type}
            </span>
            {p.featured && (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#080E1A]">
                <Fire weight="fill" className="h-3 w-3" /> Featured
              </span>
            )}
          </div>
          {p.status === "available" ? (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Available
            </span>
          ) : (
            <span className="absolute right-3 top-3 rounded-full bg-slate-700/90 px-3 py-1 text-[11px] font-semibold uppercase text-white backdrop-blur">
              {p.status}
            </span>
          )}
          <button
            onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black/60"
            aria-label="Previous image"
          >
            <CaretLeft weight="bold" className="h-4 w-4" />
          </button>
          <button
            onClick={() => setImgIdx((i) => (i + 1) % images.length)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black/60"
            aria-label="Next image"
          >
            <CaretRight weight="bold" className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                {p.purpose === "sale" ? "For Sale" : "For Rent"} · {p.titleType}
              </p>
              <h3 className="font-serif text-lg font-bold leading-snug text-white">
                {p.title.length > 52 ? `${p.title.slice(0, 52)}…` : p.title}
              </h3>
            </div>
            <p className="shrink-0 font-serif text-lg font-bold text-[#EAB308]">{p.price}</p>
          </div>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin weight="bold" className="h-4 w-4 text-[#B8860B]" />
            {p.area}, {p.location}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
              {p.beds > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bed weight="bold" className="h-4 w-4 text-[#B8860B]" /> {p.beds} Beds
                </span>
              )}
              {p.baths > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bathtub weight="bold" className="h-4 w-4 text-[#B8860B]" /> {p.baths} Baths
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Ruler weight="bold" className="h-4 w-4 text-[#B8860B]" /> {p.areaSqm} sqm
              </span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <a
              href={WHATSAPP_LINK(`Hello Night Light Connect! I’m interested in "${p.title}" (${p.price}). Is it still available?`)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <WhatsappLogo weight="fill" className="h-4 w-4" /> Enquire
            </a>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#080E1A] px-3 py-2.5 text-sm font-semibold text-[#080E1A] transition hover:bg-[#080E1A] hover:text-white"
            >
              Details
            </button>
          </div>
          <button
            onClick={() => onInspect(p)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F3EEDF] px-3 py-2.5 text-sm font-semibold text-[#7A5A0A] transition hover:bg-[#EDE4CC]"
          >
            <CalendarPlus weight="bold" className="h-4 w-4" /> Schedule Inspection
          </button>
        </div>
      </motion.article>

      <PropertyModal property={p} open={open} onClose={() => setOpen(false)} onInspect={onInspect} currentImage={imgIdx} setCurrentImage={setImgIdx} />
    </>
  );
}

function PropertyModal({
  property: p,
  open,
  onClose,
  onInspect,
  currentImage,
  setCurrentImage,
}: {
  property: Property;
  open: boolean;
  onClose: () => void;
  onInspect: (p: Property) => void;
  currentImage: number;
  setCurrentImage: (i: number) => void;
}) {
  const images = p.images.length > 0 ? p.images : [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80", alt: p.title }];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            {/* Gallery */}
            <div className="relative h-72 sm:h-96">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={images[currentImage].url}
                  alt={images[currentImage].alt}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                aria-label="Close details"
              >
                <X weight="bold" className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
                aria-label="Previous image"
              >
                <CaretLeft weight="bold" className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
                aria-label="Next image"
              >
                <CaretRight weight="bold" className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="rounded-full bg-[#080E1A]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#EAB308] backdrop-blur">
                  {p.type} · {p.purpose === "sale" ? "For Sale" : "For Rent"}
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold text-white">{p.title}</h3>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <p className="font-serif text-2xl font-bold text-[#B8860B]">{p.price}</p>
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin weight="bold" className="h-4 w-4 text-[#B8860B]" /> {p.area}, {p.location}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {p.beds > 0 && (
                  <div className="rounded-2xl bg-[#F7F5F0] p-3 text-center">
                    <Bed weight="bold" className="mx-auto h-5 w-5 text-[#B8860B]" />
                    <p className="mt-1 text-sm font-bold text-[#080E1A]">{p.beds}</p>
                    <p className="text-[11px] text-slate-500">Bedrooms</p>
                  </div>
                )}
                {p.baths > 0 && (
                  <div className="rounded-2xl bg-[#F7F5F0] p-3 text-center">
                    <Bathtub weight="bold" className="mx-auto h-5 w-5 text-[#B8860B]" />
                    <p className="mt-1 text-sm font-bold text-[#080E1A]">{p.baths}</p>
                    <p className="text-[11px] text-slate-500">Bathrooms</p>
                  </div>
                )}
                <div className="rounded-2xl bg-[#F7F5F0] p-3 text-center">
                  <Ruler weight="bold" className="mx-auto h-5 w-5 text-[#B8860B]" />
                  <p className="mt-1 text-sm font-bold text-[#080E1A]">{p.areaSqm}</p>
                  <p className="text-[11px] text-slate-500">Sqm</p>
                </div>
                <div className="rounded-2xl bg-[#F7F5F0] p-3 text-center">
                  <ShieldCheck weight="bold" className="mx-auto h-5 w-5 text-[#B8860B]" />
                  <p className="mt-1 text-sm font-bold text-[#080E1A]">Verified</p>
                  <p className="text-[11px] text-slate-500">{p.titleType}</p>
                </div>
              </div>

              <h4 className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-500">Description</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.description}</p>

              <h4 className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-500">Key Features</h4>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <a
                  href={WHATSAPP_LINK(`Hello Night Light Connect! I’m interested in "${p.title}" (${p.price}). Is it still available?`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <WhatsappLogo weight="fill" className="h-4 w-4" /> WhatsApp Enquiry
                </a>
                <a
                  href={PHONE_LINK}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#080E1A] px-4 py-3.5 text-sm font-semibold text-[#080E1A] transition hover:bg-[#080E1A] hover:text-white"
                >
                  <Phone weight="bold" className="h-4 w-4" /> Call Agent
                </a>
                <button
                  onClick={() => onInspect(p)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#F3EEDF] px-4 py-3.5 text-sm font-semibold text-[#7A5A0A] transition hover:bg-[#EDE4CC]"
                >
                  <CalendarPlus weight="bold" className="h-4 w-4" /> Book Inspection
                </button>
              </div>

              <p className="mt-5 flex items-center gap-2 rounded-2xl bg-[#F7F5F0] px-4 py-3 text-xs leading-relaxed text-slate-500">
                <Key weight="bold" className="h-4 w-4 shrink-0 text-[#B8860B]" />
                Inspection fees apply. All documents shared privately after verification of buyer identity.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}