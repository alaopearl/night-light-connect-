import { motion } from "framer-motion";
import { WhatsappLogo, Phone, CalendarPlus } from "@phosphor-icons/react";
import { WHATSAPP_LINK, PHONE_LINK } from "../constants";

interface FloatingActionsProps {
  onInspect: () => void;
}

export default function FloatingActions({ onInspect }: FloatingActionsProps) {
  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Inspect */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
        onClick={onInspect}
        className="flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#0F172A]/95 px-4 py-3 text-sm font-semibold text-[#EAB308] shadow-xl backdrop-blur transition hover:bg-[#0F172A]"
        aria-label="Schedule an inspection"
      >
        <CalendarPlus weight="bold" className="h-5 w-5" />
        <span className="hidden sm:inline">Book Inspection</span>
      </motion.button>

      {/* Call */}
      <motion.a
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
        href={PHONE_LINK}
        className="flex h-13 w-13 items-center justify-center rounded-full border border-white/20 bg-[#0F172A] p-3.5 text-white shadow-xl transition hover:border-[#EAB308]/60 hover:text-[#EAB308]"
        aria-label="Call Night Light Connect"
      >
        <Phone weight="bold" className="h-6 w-6" />
      </motion.a>

      {/* WhatsApp */}
      <motion.a
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
        href={WHATSAPP_LINK("Hello Night Light Connect! I’m interested in your properties.")}
        target="_blank"
        rel="noreferrer"
        className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-4 font-semibold text-white shadow-[0_10px_40px_-8px_rgba(37,211,102,0.6)]"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
        <WhatsappLogo weight="fill" className="h-6 w-6" />
        <span className="text-sm">09133172414</span>
      </motion.a>
    </div>
  );
}