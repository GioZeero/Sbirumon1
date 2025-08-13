
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransitionWrapper;

    