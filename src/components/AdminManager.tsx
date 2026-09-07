import { useMemo, useState } from "react";
import type { Property } from "../types";
import { STATUSES, PROMO_BADGES, PRICE_UNITS } from "../constants";
import {
  PencilSimple,
  Trash,
  Check,
  X,
  Star,
  Fire,
  Eye,
  EyeSlash,
  MagnifyingGlass,
} from "@phosphor-icons/react";

interface AdminManagerProps {
  properties: Property[];
  onUpdate: (id: string, patch: Partial<Property>) => void;
  onDelete: (id: string) => void;
  onEdit: (property: Property) => void;
}

const fmtNgn = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export default function AdminManager({ properties, onUpdate, onDelete, onEdit }: AdminManagerProps) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState<string>("");
  const [unitDraft, setUnitDraft] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) =>
      `${p.title} ${p.location} ${p.area} ${p.type} ${p.status}`.toLowerCase().includes(q)
    );
  }, [properties, query]);

  const startEditPrice = (p: Property) => {
    setEditingId(p.id);
    setPriceDraft(String(p.priceNumeric));
    setUnitDraft(p.priceUnit ?? "outright");
  };

  const savePrice = (p: Property) => {
    const num = Number(priceDraft) || p.priceNumeric;
    const unit = unitDraft && unitDraft !== "outright" ? ` / ${unitDraft}` : "";
    onUpdate(p.id, {
      priceNumeric: num,
      priceUnit: unitDraft === "outright" ? undefined : unitDraft,
      price: `${fmtNgn(num)}${unit}`,
    });
    setEditingId(null);
  };

  const liveCount = properties.filter((p) => p.published !== false).length;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-white">{liveCount}</span> live in catalog ·{" "}
          <span className="font-semibold text-white">{properties.length}</span> total · price edits
          sync instantly
        </p>
        <div className="relative w-full sm:w-64">
          <MagnifyingGlass weight="bold" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search buildings…"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-sm text-slate-500">
            {properties.length === 0
              ? "No buildings yet — publish your first listing in the Upload tab."
              : "No buildings match your search."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition hover:border-white/10"
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <img
                  src={p.images[0]?.url}
                  alt=""
                  className="h-20 w-full rounded-xl object-cover sm:w-28"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-white">{p.title}</p>
                    {p.featured && (
                      <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-2 py-0.5 text-[10px] font-bold text-[#080E1A]">
                        <Fire weight="fill" className="h-3 w-3" /> Featured
                      </span>
                    )}
                    {p.badge && (
                      <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {p.type} · {p.location} · {p.purpose === "sale" ? "For Sale" : p.purpose === "rent" ? "For Rent" : "Shortlet"}
                  </p>
                  {p.discountPrice ? (
                    <p className="mt-1 text-sm">
                      <span className="font-serif font-bold text-[#EAB308]">{fmtNgn(p.discountPrice)}</span>
                      <span className="ml-2 text-xs text-slate-500 line-through">{fmtNgn(p.priceNumeric)}</span>
                      {p.priceUnit ? <span className="text-xs text-slate-400"> / {p.priceUnit}</span> : null}
                    </p>
                  ) : (
                    <p className="mt-1 font-serif text-sm font-bold text-[#EAB308]">{p.price}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    onClick={() => onUpdate(p.id, { published: p.published === false })}
                    className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                      p.published === false
                        ? "border-white/10 text-slate-400 hover:border-[#EAB308]/50"
                        : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                    title={p.published === false ? "Unpublished" : "Published"}
                  >
                    {p.published === false ? (
                      <>
                        <EyeSlash weight="bold" className="h-3.5 w-3.5" /> Hidden
                      </>
                    ) : (
                      <>
                        <Eye weight="bold" className="h-3.5 w-3.5" /> Live
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onUpdate(p.id, { featured: !p.featured })}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                      p.featured
                        ? "border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#EAB308]"
                        : "border-white/10 text-slate-400 hover:border-[#EAB308]/50 hover:text-[#EAB308]"
                    }`}
                    aria-label="Toggle featured"
                  >
                    <Star weight={p.featured ? "fill" : "bold"} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(p)}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:border-[#EAB308]/50 hover:text-[#EAB308]"
                  >
                    <PencilSimple weight="bold" className="h-3.5 w-3.5" /> Edit
                  </button>
                  {confirmDelete === p.id ? (
                    <button
                      onClick={() => {
                        onDelete(p.id);
                        setConfirmDelete(null);
                      }}
                      className="flex h-9 items-center gap-1.5 rounded-lg bg-red-500 px-3 text-xs font-bold text-white"
                    >
                      <Check weight="bold" className="h-3.5 w-3.5" /> Sure?
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(p.id)}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-400 transition hover:border-red-500/60 hover:text-red-400"
                    >
                      <Trash weight="bold" className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Inline price editor */}
              {editingId === p.id && (
                <div className="flex flex-col gap-3 border-t border-white/10 bg-[#080E1A]/50 p-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      New price (₦)
                    </label>
                    <input
                      type="number"
                      value={priceDraft}
                      onChange={(e) => setPriceDraft(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Unit
                    </label>
                    <select
                      value={unitDraft}
                      onChange={(e) => setUnitDraft(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                    >
                      {PRICE_UNITS.map((u) => (
                        <option key={u} value={u} className="bg-[#0A1120]">
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4 sm:pt-0">
                    <button
                      onClick={() => savePrice(p)}
                      className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-5 text-sm font-bold text-[#080E1A] transition hover:brightness-110"
                    >
                      <Check weight="bold" className="h-4 w-4" /> Save price
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:text-white"
                      aria-label="Cancel price edit"
                    >
                      <X weight="bold" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { STATUSES, PROMO_BADGES };