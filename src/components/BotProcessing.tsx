import { motion } from "framer-motion";

export default function BotProcessing({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-[100%]"
    >
      <motion.span
        className="text-[13px] text-gray-500 italic px-2 py-1 inline-block"
        animate={{
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}
