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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#D9D6CA] bg-[#F3F0E7]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand mark: nocturnal beacon + architectural crown */}
        <button onClick={() => go("home")} className="group flex items-center gap-2.5 text-left">
          <img
            src={logo}
            alt="Night Light Connect logo"
            className="h-10 w-10 rounded-sm object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="leading-tight">
            <span className="block font-serif text-[15px] font-bold tracking-wide text-[#102018] sm:text-base">
              Night Light <span className="text-[#8A6817]">Connect</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.16em] text-[#68736B]">
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
              className="rounded-sm px-2.5 py-2 text-[13px] font-medium text-[#35453A] transition hover:bg-white/70 hover:text-[#8A6817]"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onAdmin();
            }}
            className="flex items-center gap-1.5 rounded-sm px-2.5 py-2 text-[13px] font-medium text-[#35453A] transition hover:bg-white/70 hover:text-[#8A6817]"
          >
            <ShieldCheck weight="duotone" className="h-4 w-4" />
            Admin Portal
          </button>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <a
            href={PHONE_LINK}
            className="flex h-10 w-10 items-center justify-center border border-[#C7C6BA] text-[#35453A] transition hover:border-[#102018] hover:bg-white"
            aria-label="Call Night Light Connect"
          >
            <Phone weight="bold" className="h-4 w-4" />
          </a>
          <a
            href={WHATSAPP_LINK("Hello Night Light Connect! I’d like to enquire about your properties.")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#147D58] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F6245]"
          >
            <WhatsappLogo weight="fill" className="h-4 w-4" />
            WhatsApp Us
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center border border-[#C7C6BA] text-[#102018] lg:hidden"
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
            className="overflow-hidden border-t border-[#D9D6CA] bg-[#F3F0E7] lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="flex w-full items-center justify-between border-b border-[#E0DDD3] px-4 py-3 text-left text-sm font-medium text-[#35453A] transition hover:bg-white/70 hover:text-[#8A6817]"
                >
                  {l.label}
                  <Star weight="fill" className="h-3 w-3 text-[#A87912]/50" />
                </button>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  onAdmin();
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-[#35453A] transition hover:bg-white/70 hover:text-[#8A6817]"
              >
                <ShieldCheck weight="duotone" className="h-4 w-4 text-[#A87912]" />
                Admin Portal
              </button>
              <div className="grid grid-cols-2 gap-2 pt-3">
                <a
                  href={PHONE_LINK}
                  className="flex items-center justify-center gap-2 border border-[#C7C6BA] px-4 py-3 text-sm font-semibold text-[#24372B]"
                >
                  <Phone weight="bold" className="h-4 w-4" />
                  Call us
                </a>
                <a
                  href={WHATSAPP_LINK("Hello Night Light Connect! I’d like to enquire about your properties.")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#147D58] px-4 py-3 text-sm font-semibold text-white"
                >
                  <WhatsappLogo weight="fill" className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
              <p className="pt-2 text-center text-[11px] text-[#68736B]">{COMPANY.address}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}