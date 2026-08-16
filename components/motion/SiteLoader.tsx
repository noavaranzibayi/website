"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";

export default function SiteLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const timer = setTimeout(() => setShow(false), 750);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={() => { document.documentElement.style.overflow = ""; }}>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <BrandLogo alt="" size="xxl" surface="dark" />
            </motion.div>
            <motion.div
              className="h-1 w-24 overflow-hidden rounded-full bg-white/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <motion.div
                className="h-full w-1/3 rounded-full bg-gold-400"
                animate={{ x: ["-100%", "220%"] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
