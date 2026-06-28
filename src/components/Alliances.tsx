import { motion } from 'motion/react';

const logos = [
  "INTA",
  "IICA",
  "Endeavor",
  "Ministerios P. N.",
  "Red de Innovación"
];

export default function Alliances() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-[#0B0910] border-y border-slate-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-10 opacity-80">
          Respaldado por instituciones líderes
        </p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 grayscale opacity-40">
          {logos.map((logo, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-xl md:text-2xl font-display font-bold hover:opacity-100 hover:text-slate-900 dark:text-white hover:grayscale-0 transition-all duration-300 cursor-default tracking-tight"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
