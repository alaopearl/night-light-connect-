import { WhatsappLogo, Phone, MapPin, Envelope, Clock, Star } from "@phosphor-icons/react";
import { COMPANY, PHONE_LINK, WHATSAPP_LINK, NAV_LINKS } from "../constants";

interface FooterProps {
  onNavigate: (id: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-white/5 bg-[#060B14]">
      {/* CTA band */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1B33] via-[#0B132B] to-[#080E1A] p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#25D366]/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#EAB308]">Ready when you are</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            Let&apos;s find the right property for your family or portfolio.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
            Talk to a live agent today — get honest advice, verified titles and Lagos&apos; best
            opportunities, all in one conversation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={WHATSAPP_LINK("Hello Night Light Connect! I’d like to start a conversation about properties.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
            >
              <WhatsappLogo weight="fill" className="h-5 w-5" />
              Chat on WhatsApp — 09133172414
            </a>
            <a
              href={PHONE_LINK}
              className="flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-[#EAB308] transition hover:bg-white/10"
            >
              <Phone weight="bold" className="h-5 w-5" />
              Call — 07080210062
            </a>
          </div>
        </div>
      </div>

      {/* Link grid */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#EAB308] to-[#B8860B] text-[#080E1A] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M12 2.5 4 6.2v5.3c0 4.6 3.4 8.6 8 10 4.6-1.4 8-5.4 8-10V6.2l-8-3.7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M12 8.5v4.5M9.25 10.75h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 17.5c-.5-.6-1.6-1.5-3-2.1 1.4 1 2.8 1.4 3 1.4s1.6-.4 3-1.4c-1.4.6-2.5 1.5-3 2.1Z" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className="font-serif text-lg font-bold text-white">
              Night Light <span className="text-[#EAB308]">Connect</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            A premium Nigerian real estate company connecting buyers, renters and investors with
            verified, high-value properties across Lekki, Ajah and beyond.
          </p>
          <div className="mt-5 flex items-center gap-1 text-[#EAB308]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} weight="fill" className="h-4 w-4" />
            ))}
            <span className="ml-2 text-xs text-slate-400">Trusted by 450+ clients</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Company</h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => onNavigate(l.id)}
                  className="text-sm text-slate-400 transition hover:text-[#EAB308]"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-[#EAB308]" />
              <span>{COMPANY.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone weight="bold" className="h-4 w-4 shrink-0 text-[#EAB308]" />
              <a href={PHONE_LINK} className="transition hover:text-[#EAB308]">
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <WhatsappLogo weight="fill" className="h-4 w-4 shrink-0 text-[#EAB308]" />
              <a
                href={WHATSAPP_LINK("Hello Night Light Connect!")}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[#EAB308]"
              >
                {COMPANY.whatsappNumber}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Envelope weight="bold" className="h-4 w-4 shrink-0 text-[#EAB308]" />
              <a href={`mailto:${COMPANY.email}`} className="transition hover:text-[#EAB308]">
                {COMPANY.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Office Hours</h3>
          <div className="mt-4 flex items-start gap-2.5">
            <Clock weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-[#EAB308]" />
            <p className="text-sm leading-relaxed text-slate-400">
              {COMPANY.hours}
              <br />
              <span className="text-slate-500">Virtual inspections available on request.</span>
            </p>
          </div>
          <p className="mt-6 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
            <span className="font-semibold text-[#EAB308]">Quick tip:</span> Send your budget and
            preferred location on WhatsApp and we&apos;ll shortlist options within hours.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Night Light Connect. All rights reserved.</p>
          <p>Lagos, Nigeria — Premium Real Estate, Verified.</p>
        </div>
      </div>
    </footer>
  );
}