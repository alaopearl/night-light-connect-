import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Property, PropertyType, Purpose, PromoBadge } from "../types";
import { TITLE_TYPES, PRICE_UNITS, PROMO_BADGES, PRESET_IMAGES, LOCATIONS } from "../constants";
import { X, Plus, UploadSimple, ImageSquare, CurrencyNgn, LinkSimple, CaretLeft, CaretRight, Check } from "@phosphor-icons/react";

interface AdminUploadFormProps {
  initial?: Property | null;
  onSave: (property: Property) => void;
  onCancel: () => void;
}

interface Draft {
  title: string;
  location: string;
  area: string;
  type: PropertyType;
  purpose: Purpose;
  priceNumeric: number;
  priceUnit: string;
  discountPrice: number;
  badge: PromoBadge;
  beds: number;
  baths: number;
  toilets: number;
  areaSqm: number;
  titleType: string;
  status: Property["status"];
  featured: boolean;
  published: boolean;
  imageUrls: string[];
  newImageUrl: string;
  description: string;
  featureInput: string;
  features: string[];
  videoUrl: string;
}

function emptyDraft(): Draft {
  return {
    title: "", location: "Lagos", area: "", type: "Duplex", purpose: "sale",
    priceNumeric: 0, priceUnit: "outright", discountPrice: 0, badge: "",
    beds: 0, baths: 0, toilets: 0, areaSqm: 0, titleType: "C of O",
    status: "available", featured: false, published: true,
    imageUrls: [], newImageUrl: "", description: "", featureInput: "", features: [], videoUrl: "",
  };
}

function draftFrom(p: Property): Draft {
  return { ...emptyDraft(), ...p, imageUrls: p.images.map((i) => i.url) };
}

const fmtNgn = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const inputCls = "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20";
const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";
const gridCls = "grid gap-4 sm:grid-cols-2";
const selectCls = (v: string) => `${inputCls} ${v ? "text-white" : "text-slate-500"}`;
const Field = ({ l, children }: { l: string; children: ReactNode }) => (
  <div>
    <label className={labelCls}>{l}</label>
    {children}
  </div>
);

export default function AdminUploadForm({ initial, onSave, onCancel }: AdminUploadFormProps) {
  const [d, setD] = useState<Draft>(initial ? draftFrom(initial) : emptyDraft());
  const [imgIdx, setImgIdx] = useState(0);
  const [libOpen, setLibOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((prev) => ({ ...prev, [key]: value }));

  const previews = useMemo(() => (d.imageUrls.length ? d.imageUrls : PRESET_IMAGES.slice(0, 1)), [d.imageUrls]);
  const addImages = (urls: string[]) => {
    const next = [...d.imageUrls, ...urls.filter((u) => !d.imageUrls.includes(u))].slice(0, 8);
    set("imageUrls", next);
  };
  const removeImage = (url: string) => set("imageUrls", d.imageUrls.filter((u) => u !== url));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => addImages([String(reader.result)]);
      reader.readAsDataURL(file);
    });
  };

  const addFeature = () => {
    const f = d.featureInput.trim();
    if (!f || d.features.includes(f)) return;
    set("features", [...d.features, f]);
    set("featureInput", "");
  };

  const submit = () => {
    if (!d.title.trim() || d.priceNumeric <= 0 || d.imageUrls.length === 0) return;
    const unit = d.priceUnit ? ` / ${d.priceUnit}` : "";
    const discountPrice = d.discountPrice > 0 ? d.discountPrice : undefined;
    const effective = discountPrice ?? d.priceNumeric;
    onSave({
      id: initial?.id ?? `custom-${Date.now()}`,
      title: d.title.trim(),
      slug: initial?.slug ?? slugify(d.title),
      location: d.location,
      area: d.area.trim() || d.location,
      price: `${fmtNgn(effective)}${unit}`,
      priceNumeric: effective,
      priceUnit: d.priceUnit || undefined,
      discountPrice,
      badge: d.badge || undefined,
      type: d.type,
      purpose: d.purpose,
      beds: Number(d.beds) || 0,
      baths: Number(d.baths) || 0,
      toilets: Number(d.toilets) || 0,
      areaSqm: Number(d.areaSqm) || 0,
      titleType: d.titleType,
      featured: d.featured,
      published: d.published,
      images: d.imageUrls.map((url) => ({ url, alt: d.title })),
      description: d.description.trim(),
      features: d.features,
      coordinates: { label: `${d.area.trim() || d.location}, Nigeria` },
      status: d.status,
      videoUrl: d.videoUrl.trim() || undefined,
      isCustom: true,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  };

  const pages = Math.max(1, previews.length);
  const toggle = (key: "featured" | "published", label: string) => (
    <button
      type="button"
      onClick={() => set(key, !d[key])}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        d[key] ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#EAB308]" : "border-white/10 text-slate-400 hover:border-white/25"
      }`}
    >
      {label}
      <span className={`relative h-5 w-9 rounded-full transition ${d[key] ? "bg-[#D4AF37]" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${d[key] ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Image editor */}
      <div>
        <p className={labelCls}>Photos (max 8)</p>
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <img src={previews[Math.min(imgIdx, previews.length - 1)]} alt="" className="h-52 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {previews.length} photo{previews.length === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-2">
              <button onClick={() => setImgIdx((imgIdx - 1 + pages) % pages)} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70" aria-label="Previous image">
                <CaretLeft weight="bold" className="h-4 w-4" />
              </button>
              <button onClick={() => setImgIdx((imgIdx + 1) % pages)} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70" aria-label="Next image">
                <CaretRight weight="bold" className="h-4 w-4" />
              </button>
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => fileRef.current?.click()} className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-4 text-sm font-bold text-[#080E1A] transition hover:brightness-110">
            <UploadSimple weight="bold" className="h-4 w-4" /> Upload photos
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
          <button onClick={() => setLibOpen((v) => !v)} className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${libOpen ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#EAB308]" : "border-white/10 text-slate-300 hover:border-[#EAB308]/50 hover:text-[#EAB308]"}`}>
            <ImageSquare weight="bold" className="h-4 w-4" /> Preset library
          </button>
        </div>
        {libOpen && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {PRESET_IMAGES.map((u) => (
              <button key={u} onClick={() => addImages([u])} className={`relative overflow-hidden rounded-lg border-2 transition ${d.imageUrls.includes(u) ? "border-[#D4AF37]" : "border-transparent hover:border-white/30"}`}>
                <img src={u} alt="" className="h-14 w-full object-cover" />
                {d.imageUrls.includes(u) && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[#080E1A]">
                    <Check weight="bold" className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        {d.imageUrls.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {d.imageUrls.map((u, i) => (
              <span key={`${i}-${u.slice(0, 24)}`} className="relative">
                <img src={u} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <button onClick={() => removeImage(u)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600" aria-label="Remove image">
                  <X weight="bold" className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <input
            value={d.newImageUrl}
            onChange={(e) => set("newImageUrl", e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && d.newImageUrl.trim()) { e.preventDefault(); addImages([d.newImageUrl.trim()]); set("newImageUrl", ""); } }}
            placeholder="Paste an image URL and press Enter…"
            className={inputCls}
          />
          <button
            onClick={() => { if (d.newImageUrl.trim()) { addImages([d.newImageUrl.trim()]); set("newImageUrl", ""); } }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-[#EAB308]/50 hover:text-[#EAB308]"
            aria-label="Add image URL"
          >
            <LinkSimple weight="bold" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <Field l="Building / Property Title *">
          <input value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Luxury 5 Bedroom Fully Detached Duplex" className={inputCls} />
        </Field>
        <div className={gridCls}>
          <Field l="Location">
            <select value={d.location} onChange={(e) => set("location", e.target.value)} className={selectCls(d.location)}>
              {LOCATIONS.filter((l) => l !== "All Nigeria").map((l) => (
                <option key={l} value={l} className="bg-[#0A1120]">{l}</option>
              ))}
            </select>
          </Field>
          <Field l="Area / Estate (optional)">
            <input value={d.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Lakowe, Oniru, Chevron…" className={inputCls} />
          </Field>
        </div>
        <div className={gridCls}>
          <Field l="Property type">
            <select value={d.type} onChange={(e) => set("type", e.target.value as PropertyType)} className={inputCls}>
              {["Duplex", "Apartment", "Land", "Penthouse", "Terrace", "Commercial"].map((t) => (
                <option key={t} value={t} className="bg-[#0A1120]">{t}</option>
              ))}
            </select>
          </Field>
          <Field l="Purpose">
            <select value={d.purpose} onChange={(e) => set("purpose", e.target.value as Purpose)} className={inputCls}>
              <option value="sale" className="bg-[#0A1120]">For Sale</option>
              <option value="rent" className="bg-[#0A1120]">For Rent</option>
              <option value="shortlet" className="bg-[#0A1120]">Shortlet</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#EAB308]">
          <CurrencyNgn weight="bold" className="h-4 w-4" /> Pricing (₦)
        </p>
        <div className={gridCls}>
          <Field l="Sale / rental price (₦) *">
            <input type="number" min={0} value={d.priceNumeric || ""} onChange={(e) => set("priceNumeric", Number(e.target.value))} placeholder="e.g. 165000000" className={inputCls} />
          </Field>
          <Field l="Price unit / frequency">
            <select value={d.priceUnit} onChange={(e) => set("priceUnit", e.target.value)} className={inputCls}>
              {PRICE_UNITS.map((u) => (
                <option key={u} value={u} className="bg-[#0A1120]">{u}</option>
              ))}
            </select>
          </Field>
          <Field l="Promo / discount price (₦, optional)">
            <input type="number" min={0} value={d.discountPrice || ""} onChange={(e) => set("discountPrice", Number(e.target.value))} placeholder="e.g. 148000000" className={inputCls} />
          </Field>
          <Field l="Promotional badge">
            <select value={d.badge} onChange={(e) => set("badge", e.target.value as PromoBadge)} className={inputCls}>
              <option value="" className="bg-[#0A1120]">None</option>
              {PROMO_BADGES.map((b) => (
                <option key={b} value={b} className="bg-[#0A1120]">{b}</option>
              ))}
            </select>
          </Field>
        </div>
        {(d.discountPrice > 0 || d.priceUnit !== "outright") && (
          <p className="mt-3 rounded-xl bg-[#080E1A]/60 px-3 py-2 text-xs text-[#EAB308]">
            Live display: {fmtNgn(d.discountPrice > 0 ? d.discountPrice : d.priceNumeric)}
            {d.priceUnit !== "outright" ? ` / ${d.priceUnit}` : ""}
            {d.discountPrice > 0 ? ` (was ${fmtNgn(d.priceNumeric)})` : ""}
          </p>
        )}
      </div>

      {/* Specs */}
      <div className={gridCls}>
        {([["beds", "Bedrooms"], ["baths", "Bathrooms"], ["toilets", "Toilets"], ["areaSqm", "Area (sqm)"]] as const).map(([key, label]) => (
          <Field key={key} l={label}>
            <input type="number" min={0} value={d[key] || ""} onChange={(e) => set(key, Number(e.target.value))} className={inputCls} />
          </Field>
        ))}
      </div>

      {/* Docs & status */}
      <div className={gridCls}>
        <Field l="Title document">
          <select value={d.titleType} onChange={(e) => set("titleType", e.target.value)} className={inputCls}>
            {TITLE_TYPES.map((t) => (
              <option key={t} value={t} className="bg-[#0A1120]">{t}</option>
            ))}
          </select>
        </Field>
        <Field l="Status">
          <select value={d.status} onChange={(e) => set("status", e.target.value as Property["status"])} className={inputCls}>
            <option value="available" className="bg-[#0A1120]">Available</option>
            <option value="under-offer" className="bg-[#0A1120]">Under Offer</option>
            <option value="reserved" className="bg-[#0A1120]">Reserved</option>
            <option value="sold" className="bg-[#0A1120]">Sold</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {toggle("featured", "Featured listing")}
        {toggle("published", "Publish to catalog")}
      </div>

      <Field l="Description">
        <textarea
          value={d.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder="Describe the property, estate, proximity to key landmarks…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
        />
      </Field>

      {/* Features */}
      <div>
        <label className={labelCls}>Key amenities</label>
        <div className="flex gap-2">
          <input
            value={d.featureInput}
            onChange={(e) => set("featureInput", e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
            placeholder="e.g. 24/7 estate security"
            className={inputCls}
          />
          <button onClick={addFeature} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-[#EAB308]/50 hover:text-[#EAB308]" aria-label="Add amenity">
            <Plus weight="bold" className="h-4 w-4" />
          </button>
        </div>
        {d.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {d.features.map((f) => (
              <span key={f} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                {f}
                <button onClick={() => set("features", d.features.filter((x) => x !== f))} aria-label={`Remove ${f}`}>
                  <X weight="bold" className="h-3 w-3 text-slate-400 hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Field l="Video tour URL (optional)">
        <input value={d.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtube.com/watch?v=…" className={inputCls} />
      </Field>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="h-12 rounded-xl border border-white/10 px-6 text-sm font-semibold text-slate-300 transition hover:border-[#EAB308]/50 hover:text-[#EAB308]">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!d.title.trim() || d.priceNumeric <= 0 || d.imageUrls.length === 0}
          className="h-12 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-7 text-sm font-bold text-[#080E1A] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {initial ? "Save changes" : "Publish building"}
        </button>
      </div>
    </div>
  );
}