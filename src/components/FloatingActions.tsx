import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WhatsappLogo, Phone, CalendarPlus } from "@phosphor-icons/react";
import { WHATSAPP_LINK, PHONE_LINK } from "../constants";

interface FloatingActionsProps {
  onInspect: () => void;
}

export default function FloatingActions({ onInspect }: FloatingActionsProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 border border-[#D7D5CB] bg-[#F3F0E7]/95 p-1.5 shadow-[0_8px_24px_rgba(16,32,24,0.14)] backdrop-blur sm:bottom-6 sm:right-6"
    >
      <motion.button
        onClick={onInspect}
        className="flex h-10 w-10 items-center justify-center text-[#8A6817] transition hover:bg-white"
        aria-label="Schedule an inspection"
        title="Schedule an inspection"
      >
        <CalendarPlus weight="bold" className="h-4 w-4" />
      </motion.button>

      <motion.a
        href={PHONE_LINK}
        className="flex h-10 w-10 items-center justify-center text-[#35453A] transition hover:bg-white"
        aria-label="Call Night Light Connect"
        title="Call Night Light Connect"
      >
        <Phone weight="bold" className="h-4 w-4" />
      </motion.a>

      <motion.a
        href={WHATSAPP_LINK("Hello Night Light Connect! I’m interested in your properties.")}
        target="_blank"
        rel="noreferrer"
        className="flex h-10 w-10 items-center justify-center bg-[#147D58] text-white transition hover:bg-[#0F6245]"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <WhatsappLogo weight="fill" className="h-4 w-4" />
      </motion.a>
    </motion.div>
  );
}