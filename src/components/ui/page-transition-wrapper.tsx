"use client";

import { motion, AnimatePresence } from "framer-motion";

const PageTransitionWrapper = ({
  children,
  transitionKey,
}: {
  children: React.ReactNode;
  transitionKey: string;
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransitionWrapper;
