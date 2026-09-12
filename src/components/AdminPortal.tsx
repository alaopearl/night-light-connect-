import { useEffect, useMemo, useState } from "react";
import type { Lead, Property } from "../types";
import {
  COMPANY,
  WHATSAPP_LINK,
  PHONE_LINK,
  DEFAULT_PROPERTIES,
  ADMIN_PIN,
} from "../constants";
import AdminUploadForm from "./AdminUploadForm";
import AdminManager from "./AdminManager";
import {
  X,
  Users,
  WhatsappLogo,
  Phone,
  CalendarPlus,
  ArrowClockwise,
  Trash,
  PencilSimple,
  Check,
  Key,
  LockSimple,
  LockOpen,
  MagnifyingGlass,
  HouseLine,
  ShieldCheck,
  UploadSimple,
  Tag,
} from "@phosphor-icons/react";
import { STORAGE_KEYS, readStored, writeStored } from "../lib/database";

const LEADS_KEY = STORAGE_KEYS.leads;
const INSPECTIONS_KEY = STORAGE_KEYS.inspections;
const ADMIN_SESSION_KEY = STORAGE_KEYS.adminSession;

interface Inspection {
  id: string;
  name: string;
  phone: string;
  date: string;
  mode: string;
  propertyTitle: string;
  createdAt: string;
}

const load = <T,>(key: string, fallback: T): T => readStored(key, fallback);
const save = (key: string, value: unknown) => writeStored(key, value);

type Tab = "upload" | "manager" | "leads" | "inspections";

interface AdminPortalProps {
  onClose: () => void;
  onNavigate: (id: string) => void;
  onBookInspection: () => void;
  properties: Property[];
  onAddProperty: (p: Property) => void;
  onUpdateProperty: (id: string, patch: Partial<Property>) => void;
  onDeleteProperty: (id: string) => void;
  onResetDefaults: () => void;
}

export default function AdminPortal({
  onClose,
  onNavigate,
  onBookInspection,
  properties,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onResetDefaults,
}: AdminPortalProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [tab, setTab] = useState<Tab>("upload");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [unlocked, setUnlocked] = useState(() => load(ADMIN_SESSION_KEY, false));
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    setLeads(load<Lead[]>(LEADS_KEY, []));
    setInspections(load<Inspection[]>(INSPECTIONS_KEY, []));
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const unlock = () => {
    if (pin === ADMIN_PIN) {
      setUnlocked(true);
      setPin("");
      setPinError(false);
      save(ADMIN_SESSION_KEY, true);
    } else {
      setPinError(true);
    }
  };

  const lock = () => {
    setUnlocked(false);
    setPin("");
    save(ADMIN_SESSION_KEY, false);
    notify("Session locked");
  };

  const deleteLead = (id: string) => {
    const next = leads.filter((l) => l.id !== id);
    setLeads(next);
    save(LEADS_KEY, next);
    notify("Lead deleted");
  };

  const deleteInspection = (id: string) => {
    const next = inspections.filter((i) => i.id !== id);
    setInspections(next);
    save(INSPECTIONS_KEY, next);
    notify("Inspection request deleted");
  };

  const handleSaveProperty = (p: Property) => {
    const isEdit = properties.some((x) => x.id === p.id);
    if (isEdit) {
      onUpdateProperty(p.id, p);
      notify("Building updated & synced to catalog");
    } else {
      onAddProperty(p);
      notify("Building published to catalog");
    }
    setEditing(null);
    setShowUpload(false);
    setTab("manager");
  };

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      `${l.name} ${l.phone} ${l.email} ${l.message} ${l.propertyTitle ?? ""}`.toLowerCase().includes(q)
    );
  }, [leads, query]);

  const filteredInspections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inspections;
    return inspections.filter((i) =>
      `${i.name} ${i.phone} ${i.propertyTitle} ${i.mode}`.toLowerCase().includes(q)
    );
  }, [inspections, query]);

  const stats = useMemo(() => {
    const live = properties.filter((p) => p.published !== false).length;
    const available = properties.filter((p) => p.status === "available").length;
    const premium = properties.filter((p) => p.priceNumeric >= 100_000_000).length;
    const custom = properties.filter((p) => p.isCustom).length;
    return [
      { label: "Live Listings", value: live, icon: HouseLine },
      { label: "Available Now", value: available, icon: Check },
      { label: "Custom Uploads", value: custom, icon: UploadSimple },
      { label: "New Leads", value: leads.length, icon: Users },
    ];
  }, [properties, leads]);

  if (!unlocked) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A1120] p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#080E1A]">
              <Key weight="duotone" className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-white">Super Admin Lock</h2>
              <p className="text-xs text-slate-500">Night Light Connect control center</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-slate-400">
            Enter the Super Admin PIN to unlock building uploads, pricing controls, leads and
            inspection management.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              unlock();
            }}
            className="mt-4"
          >
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(false);
              }}
              placeholder="Super Admin PIN"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-center text-lg tracking-[0.4em] text-white placeholder-slate-600 outline-none transition focus:border-[#D4AF37]"
              autoFocus
            />
            {pinError && <p className="mt-2 text-xs font-semibold text-red-400">Incorrect PIN. Try again.</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 transition hover:border-[#EAB308]/50 hover:text-[#EAB308]"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-sm font-bold text-[#080E1A] transition hover:brightness-110"
              >
                <LockOpen weight="bold" className="h-4 w-4" /> Unlock
              </button>
            </div>
            
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-[#0A1120] shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#080E1A]">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                <path d="M12 2.5 4 6.2v5.3c0 4.6 3.4 8.6 8 10 4.6-1.4 8-5.4 8-10V6.2l-8-3.7Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v5M9.5 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 17.5c-.4-.5-1.3-1.3-2.5-1.9 1.2.9 2.5 1.2 2.5 1.2s1.3-.3 2.5-1.2c-1.2.6-2.1 1.4-2.5 1.9Z" fill="currentColor" />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#25D366] ring-2 ring-[#0A1120]">
                <Check weight="bold" className="h-2.5 w-2.5 text-white" />
              </span>
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-white">Night Light Connect — Super Admin</h2>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck weight="duotone" className="h-3.5 w-3.5 text-[#EAB308]" />
                Building & pricing control center (local storage)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={lock}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:border-[#EAB308]/50 hover:text-[#EAB308]"
            >
              <LockSimple weight="bold" className="h-4 w-4" /> Lock
            </button>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-[#EAB308]/50 hover:text-[#EAB308]"
              aria-label="Close admin portal"
            >
              <X weight="bold" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 px-5 pt-5 sm:grid-cols-4 sm:px-7">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <s.icon weight="duotone" className="h-5 w-5 text-[#EAB308]" />
              <p className="mt-2 font-serif text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto px-5 py-4 sm:px-7">
          {(
            [
              { key: "upload", label: "Upload Building", icon: UploadSimple },
              { key: "manager", label: "Price Manager", icon: Tag },
              { key: "leads", label: "Leads", icon: Users },
              { key: "inspections", label: "Inspections", icon: CalendarPlus },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setEditing(null);
                setShowUpload(false);
              }}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === t.key ? "bg-[#D4AF37] text-[#080E1A]" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <t.icon weight="bold" className="h-4 w-4" />
              {t.label}
              {t.key === "leads" && (
                <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold">{leads.length}</span>
              )}
              {t.key === "inspections" && (
                <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold">{inspections.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7">
          {tab === "upload" || tab === "manager" ? (
            (() => {
              if (tab === "upload" || showUpload || editing) {
                return (
                  <AdminUploadForm
                    initial={editing}
                    onSave={handleSaveProperty}
                    onCancel={() => {
                      setEditing(null);
                      setShowUpload(false);
                      setTab("manager");
                    }}
                  />
                );
              }
              return (
                <AdminManager
                  properties={properties}
                  onUpdate={onUpdateProperty}
                  onDelete={onDeleteProperty}
                  onEdit={(p) => {
                    setEditing(p);
                    setTab("upload");
                  }}
                />
              );
            })()
          ) : tab === "leads" ? (
            <LeadsList
              leads={filteredLeads}
              showsQuery={!!query.trim()}
              onDelete={deleteLead}
              onEmpty={() => (
                <EmptyState onClose={onClose} onNavigate={onNavigate} />
              )}
            />
          ) : (
            <InspectionsList
              inspections={filteredInspections}
              showsQuery={!!query.trim()}
              onDelete={deleteInspection}
              onEmpty={() => <EmptyState onClose={onClose} onNavigate={onNavigate} />}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-7">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck weight="duotone" className="h-4 w-4 text-[#EAB308]" />
            {COMPANY.address} · changes persist in your browser
          </p>
          <div className="flex items-center gap-2">
            {confirmed ? (
              <button
                onClick={() => {
                  onResetDefaults();
                  setConfirmed(false);
                  notify("Catalog reset to defaults");
                }}
                className="flex h-10 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-bold text-white"
              >
                <Check weight="bold" className="h-4 w-4" /> Confirm reset?
              </button>
            ) : (
              <button
                onClick={() => setConfirmed(true)}
                className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-300 transition hover:border-red-500/50 hover:text-red-400"
              >
                <ArrowClockwise weight="bold" className="h-4 w-4" /> Reset catalog
              </button>
            )}
            <a
              href={PHONE_LINK}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-4 py-2.5 text-sm font-bold text-[#080E1A] transition hover:brightness-110"
            >
              <Phone weight="bold" className="h-4 w-4" /> Call office
            </a>
          </div>
        </div>
      </div>

      {toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function SearchBar({ query, setQuery }: { query: string; setQuery: (v: string) => void }) {
  return (
    <div className="relative w-full sm:w-72">
      <MagnifyingGlass weight="bold" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
        className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
      />
    </div>
  );
}

function LeadsList({
  leads,
  showsQuery,
  onDelete,
  onEmpty,
}: {
  leads: Lead[];
  showsQuery: boolean;
  onDelete: (id: string) => void;
  onEmpty: () => React.ReactNode;
}) {
  if (leads.length === 0) {
    return showsQuery ? (
      <div className="rounded-3xl border border-dashed border-white/10 py-14 text-center text-sm text-slate-500">
        No leads match your search.
      </div>
    ) : (
      onEmpty()
    );
  }
  return (
    <ul className="space-y-3">
      {leads.map((l) => (
        <li
          key={l.id}
          className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-white/10"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white">{l.name}</p>
                <span className="rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#EAB308]">
                  {l.source}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {new Date(l.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              {l.propertyTitle && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <HouseLine weight="bold" className="h-3.5 w-3.5 text-[#EAB308]" />
                  Interested in: {l.propertyTitle}
                </p>
              )}
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{l.message}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{l.phone}</span>
                {l.email && <span>{l.email}</span>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={WHATSAPP_LINK(`Hello ${l.name}! This is Night Light Connect responding to your enquiry.`)}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white transition hover:brightness-110"
                aria-label="Reply on WhatsApp"
              >
                <WhatsappLogo weight="fill" className="h-4 w-4" />
              </a>
              <a
                href={`tel:${l.phone.replace(/\s/g, "")}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-[#EAB308]/50 hover:text-[#EAB308]"
                aria-label="Call lead"
              >
                <Phone weight="bold" className="h-4 w-4" />
              </a>
              <button
                onClick={() => onDelete(l.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-red-500/60 hover:text-red-400"
                aria-label="Delete lead"
              >
                <Trash weight="bold" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function InspectionsList({
  inspections,
  showsQuery,
  onDelete,
  onEmpty,
}: {
  inspections: Inspection[];
  showsQuery: boolean;
  onDelete: (id: string) => void;
  onEmpty: () => React.ReactNode;
}) {
  if (inspections.length === 0) {
    return showsQuery ? (
      <div className="rounded-3xl border border-dashed border-white/10 py-14 text-center text-sm text-slate-500">
        No inspections match your search.
      </div>
    ) : (
      onEmpty()
    );
  }
  return (
    <ul className="space-y-3">
      {inspections.map((i) => (
        <li
          key={i.id}
          className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-white/10"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white">{i.name}</p>
                <span className="rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#EAB308]">
                  {i.mode} inspection
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <HouseLine weight="bold" className="h-3.5 w-3.5 text-[#EAB308]" />
                {i.propertyTitle}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>📅 {i.date}</span>
                <span>{i.phone}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={WHATSAPP_LINK(`Hello ${i.name}! Confirming your ${i.mode} inspection for ${i.propertyTitle} on ${i.date}.`)}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white transition hover:brightness-110"
                aria-label="Confirm on WhatsApp"
              >
                <WhatsappLogo weight="fill" className="h-4 w-4" />
              </a>
              <button
                onClick={() => onDelete(i.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-red-500/60 hover:text-red-400"
                aria-label="Delete inspection"
              >
                <Trash weight="bold" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onClose, onNavigate }: { onClose: () => void; onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-16 text-center">
      <PencilSimple weight="duotone" className="h-10 w-10 text-slate-600" />
      <h3 className="mt-4 font-serif text-lg font-bold text-white">No requests yet</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Enquiries sent from the contact form and inspection bookings will appear here.
      </p>
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => {
            onClose();
            onNavigate("contact");
          }}
          className="rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-[#080E1A] transition hover:brightness-110"
        >
          Go to contact form
        </button>
        <button
          onClick={() => {
            onClose();
            onNavigate("properties");
          }}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-[#EAB308]/50"
        >
          Browse properties
        </button>
      </div>
    </div>
  );
}