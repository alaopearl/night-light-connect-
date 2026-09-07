import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WhatsappLogo, Phone, List, X, ShieldCheck, Star } from "@phosphor-icons/react";
import { COMPANY, PHONE_LINK, WHATSAPP_LINK, NAV_LINKS } from "../constants";
import logo from "../assets/Night light.jpeg";

interface NavbarProps {
  onNavigate: (id: string) => void;
  onAdmin: () => void;
}

export default function Navbar({ onNavigate, onAdmin }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    setOpen(false);
    onNavigate(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#080E1A]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand mark: nocturnal beacon + architectural crown */}
        <button onClick={() => go("home")} className="group flex items-center gap-2.5 text-left">
          <img
            src={logo}
            alt="Night Light Connect logo"
            className="h-10 w-10 rounded-xl object-cover shadow-[0_0_24px_rgba(212,175,55,0.35)] transition-transform duration-300 group-hover:scale-105"
          />
          <span className="leading-tight">
            <span className="block font-serif text-[15px] font-bold tracking-wide text-white sm:text-base">
              Night Light <span className="text-[#EAB308]">Connect</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Real Estate, Lagos
            </span>
          </span>
        </button>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-[#EAB308]"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onAdmin();
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-[#EAB308]"
          >
            <ShieldCheck weight="duotone" className="h-4 w-4" />
            Admin Portal
          </button>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <a
            href={PHONE_LINK}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-200 transition hover:border-[#EAB308]/50 hover:text-[#EAB308]"
            aria-label="Call Night Light Connect"
          >
            <Phone weight="bold" className="h-4 w-4" />
          </a>
          <a
            href={WHATSAPP_LINK("Hello Night Light Connect! I’d like to enquire about your properties.")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110"
          >
            <WhatsappLogo weight="fill" className="h-4 w-4" />
            WhatsApp Us
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X weight="bold" className="h-5 w-5" /> : <List weight="bold" className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/5 bg-[#0A1120] lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-[#EAB308]"
                >
                  {l.label}
                  <Star weight="fill" className="h-3 w-3 text-[#D4AF37]/50" />
                </button>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  onAdmin();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-[#EAB308]"
              >
                <ShieldCheck weight="duotone" className="h-4 w-4 text-[#EAB308]" />
                Admin Portal
              </button>
              <div className="grid grid-cols-2 gap-2 pt-3">
                <a
                  href={PHONE_LINK}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Phone weight="bold" className="h-4 w-4" />
                  Call us
                </a>
                <a
                  href={WHATSAPP_LINK("Hello Night Light Connect! I’d like to enquire about your properties.")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-3 text-sm font-semibold text-white"
                >
                  <WhatsappLogo weight="fill" className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
              <p className="pt-2 text-center text-[11px] text-slate-500">{COMPANY.address}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}