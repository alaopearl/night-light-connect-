import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Property, Lead, InspectionRequest } from "./types";
import { DEFAULT_PROPERTIES, WHATSAPP_LINK, PHONE_LINK } from "./constants";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingActions from "./components/FloatingActions";
import PropertiesSection from "./components/PropertiesSection";
import AdminPortal from "./components/AdminPortal";
import {
  Hero,
  About,
  NationwideHubs,
  Services,
  WhyUs,
  Testimonials,
  Contact,
} from "./components/HomeSections";
import { Phone, MapPin, Check, X, CalendarCheck } from "@phosphor-icons/react";
import { appendStoredRecord, STORAGE_KEYS, readPersistedRecord, readStored, subscribeToStoredKeys, writeStored } from "./lib/database";
import { supabase } from "./lib/supabase";

const LEADS_KEY = STORAGE_KEYS.leads;
const INSPECTIONS_KEY = STORAGE_KEYS.inspections;
const CUSTOM_PROPERTIES_KEY = STORAGE_KEYS.customProperties;
const DELETED_PROPERTIES_KEY = STORAGE_KEYS.deletedProperties;

export default function App() {
  const [customProperties, setCustomProperties] = useState<Property[]>(() =>
    readStored<Property[]>(CUSTOM_PROPERTIES_KEY, [])
  );
  const [deletedPropertyIds, setDeletedPropertyIds] = useState<string[]>(() =>
    readStored<string[]>(DELETED_PROPERTIES_KEY, [])
  );
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [inspectTarget, setInspectTarget] = useState<Property | null>(null);
  const [propertySearch, setPropertySearch] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      readPersistedRecord<Property[]>(CUSTOM_PROPERTIES_KEY, []),
      readPersistedRecord<string[]>(DELETED_PROPERTIES_KEY, []),
    ]).then(([savedProperties, savedDeletedIds]) => {
      if (!active) return;
      setCustomProperties(savedProperties);
      setDeletedPropertyIds(savedDeletedIds);
      setCatalogLoaded(true);
    });

    const unsubscribe = subscribeToStoredKeys(
      [CUSTOM_PROPERTIES_KEY, DELETED_PROPERTIES_KEY],
      (key, value) => {
        if (key === CUSTOM_PROPERTIES_KEY && Array.isArray(value)) {
          setCustomProperties(value as Property[]);
        }
        if (key === DELETED_PROPERTIES_KEY && Array.isArray(value)) {
          setDeletedPropertyIds(value as string[]);
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Persist catalog changes only after remote state has been loaded.
  useEffect(() => {
    if (!catalogLoaded) return;
    writeStored(CUSTOM_PROPERTIES_KEY, customProperties);
  }, [catalogLoaded, customProperties]);

  useEffect(() => {
    if (!catalogLoaded) return;
    writeStored(DELETED_PROPERTIES_KEY, deletedPropertyIds);
  }, [catalogLoaded, deletedPropertyIds]);

  // Deleted built-in listings stay deleted across reloads and devices.
  const allProperties = useMemo(() => {
    const defaultIds = new Set(DEFAULT_PROPERTIES.map((p) => p.id));
    const custom = customProperties.filter((p) => !defaultIds.has(p.id));
    const overriddenIds = new Set(customProperties.map((p) => p.id));
    const deletedIds = new Set(deletedPropertyIds);
    return [
      ...DEFAULT_PROPERTIES.filter((p) => !overriddenIds.has(p.id) && !deletedIds.has(p.id)),
      ...custom.filter((p) => !deletedIds.has(p.id)),
    ];
  }, [customProperties, deletedPropertyIds]);
  const properties = useMemo(
    () => allProperties.filter((property) => property.published !== false),
    [allProperties]
  );

  const navigate = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openProperty = useCallback((p: Property) => {
    document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("nlc-open-property", { detail: p.id }));
    }, 350);
  }, []);

  const handleInspect = useCallback((p: Property) => setInspectTarget(p), []);

  const submitInspection = useCallback((req: InspectionRequest) => {
    const inspection = {
      id: `in-${Date.now()}`,
      name: req.name,
      phone: req.phone,
      date: req.date,
      mode: req.mode,
      propertyTitle: req.propertyTitle,
      createdAt: new Date().toISOString(),
    };
    appendStoredRecord(INSPECTIONS_KEY, inspection);

    const lead: Lead = {
      id: `lead-${Date.now()}`,
      name: req.name,
      phone: req.phone,
      email: "",
      message: `Inspection request (${req.mode}) for "${req.propertyTitle}" on ${req.date}.`,
      propertyTitle: req.propertyTitle,
      createdAt: new Date().toISOString(),
      source: "inspection",
    };
    appendStoredRecord(LEADS_KEY, lead);

    window.open(
      WHATSAPP_LINK(
        `Hello Night Light Connect! I’d like to book a ${req.mode} inspection for "${req.propertyTitle}" on ${req.date}. My name is ${req.name}, phone ${req.phone}.`
      ),
      "_blank"
    );
  }, []);

  const saveContactLead = useCallback((lead: Omit<Lead, "id" | "createdAt" | "source">) => {
    const full: Lead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: "contact",
    };
    appendStoredRecord(LEADS_KEY, full);
  }, []);

  // --- Super Admin CRUD ---
  const addProperty = useCallback((p: Property) => {
    setDeletedPropertyIds((prev) => prev.filter((id) => id !== p.id));
    setCustomProperties((prev) => {
      const existingIdx = prev.findIndex((x) => x.id === p.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = p;
        return next;
      }
      return [...prev, p];
    });
  }, []);

  const updateProperty = useCallback((id: string, patch: Partial<Property>) => {
    setDeletedPropertyIds((prev) => prev.filter((deletedId) => deletedId !== id));
    setCustomProperties((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) return prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      const base = DEFAULT_PROPERTIES.find((p) => p.id === id);
      if (!base) return prev;
      return [...prev, { ...base, ...patch }];
    });
  }, []);

  const deleteProperty = useCallback((id: string) => {
    const property = allProperties.find((item) => item.id === id);
    setCustomProperties((prev) => prev.filter((p) => p.id !== id));
    setDeletedPropertyIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

    if (supabase && property) {
      const bucket = import.meta.env.VITE_SUPABASE_BUCKET || "night-light-img";
      const uploadedPaths = property.images.flatMap(({ url }) => {
        try {
          const pathname = new URL(url).pathname;
          const marker = `/object/public/${bucket}/`;
          const index = pathname.indexOf(marker);
          return index >= 0 ? [decodeURIComponent(pathname.slice(index + marker.length))] : [];
        } catch {
          return [];
        }
      });
      if (uploadedPaths.length) {
        void supabase.storage.from(bucket).remove(uploadedPaths).then(({ error }) => {
          if (error) console.warn("Property deleted, but uploaded photo cleanup failed:", error.message);
        });
      }
    }
  }, [allProperties]);

  const resetDefaults = useCallback(() => {
    setCustomProperties([]);
    setDeletedPropertyIds([]);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      void (e as CustomEvent<string>).detail;
    };
    window.addEventListener("nlc-open-property", handler);
    return () => window.removeEventListener("nlc-open-property", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-900 antialiased">
      <Navbar onNavigate={navigate} onAdmin={() => setAdminOpen(true)} />

      <main>
        <Hero properties={properties} onInspect={handleInspect} onPropertyClick={openProperty} onSearch={setPropertySearch} />
        <PropertiesSection
          properties={properties}
          onInspect={handleInspect}
          onNavigateProps={navigate}
          initialSearch={propertySearch}
        />
        <About onNavigate={navigate} />
        <NationwideHubs />
        <Services />
        <WhyUs />
        <Testimonials />
        <Contact onLead={saveContactLead} />
      </main>

      <Footer onNavigate={navigate} />

      <FloatingActions onInspect={() => setInspectTarget(properties[0] ?? null)} />

      <AnimatePresence>
        {adminOpen && (
          <AdminPortal
            onClose={() => setAdminOpen(false)}
            onNavigate={navigate}
            onBookInspection={() => {
              setAdminOpen(false);
              setInspectTarget(properties[0] ?? null);
            }}
            properties={allProperties}
            onAddProperty={addProperty}
            onUpdateProperty={updateProperty}
            onDeleteProperty={deleteProperty}
            onResetDefaults={resetDefaults}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inspectTarget && (
          <InspectionModal
            property={inspectTarget}
            onClose={() => setInspectTarget(null)}
            onSubmit={submitInspection}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InspectionModal({
  property,
  onClose,
  onSubmit,
}: {
  property: Property;
  onClose: () => void;
  onSubmit: (req: InspectionRequest) => void;
}) {
  const [mode, setMode] = useState<"Physical" | "Virtual">("Physical");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [done, setDone] = useState(false);

  const minDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, phone, date, mode, propertyTitle: property.title });
    setDone(true);
    setTimeout(onClose, 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="relative h-40 overflow-hidden">
          <img src={property.images[0]?.url} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
            aria-label="Close inspection form"
          >
            <X weight="bold" className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-5 right-5">
            <p className="text-xs uppercase tracking-wider text-[#EAB308]">Book an inspection</p>
            <h3 className="font-serif text-lg font-bold leading-snug text-white">
              {property.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-300">
              <MapPin weight="bold" className="h-3 w-3 text-[#EAB308]" /> {property.area},{" "}
              {property.location}
            </p>
          </div>
        </div>

        <div className="p-6">
          {done ? (
            <div className="py-10 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check weight="bold" className="h-8 w-8" />
              </span>
              <h3 className="mt-4 font-serif text-xl font-bold text-[#0d9488]">
                Request received!
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                We&apos;re opening WhatsApp so you can confirm instantly with our team.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-xs leading-relaxed text-slate-500">
                Choose how you&apos;d like to view this property. Physical inspections follow
                designated hours; virtual tours are available for diaspora clients.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(["Physical", "Virtual"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      mode === m
                        ? "border-[#D4AF37] bg-[#F3EEDF] text-[#7A5A0A]"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {mode === m && <Check weight="bold" className="h-4 w-4" />}
                    {m} Tour
                  </button>
                ))}
              </div>

              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (e.g. 0801 234 5678)"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
              <input
                required
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="submit"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 text-sm font-bold text-white transition hover:brightness-110"
                >
                  <CalendarCheck weight="bold" className="h-4 w-4" /> Confirm booking
                </button>
                <a
                  href={PHONE_LINK}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-[#D4AF37]"
                >
                  <Phone weight="bold" className="h-4 w-4" /> Prefer to call?
                </a>
              </div>
              <p className="text-center text-[11px] text-slate-400">
                Submitting saves your request and opens WhatsApp to confirm with our team.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}