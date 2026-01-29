'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, Upload, ArrowRight, Play } from 'lucide-react';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function HowLyncZWorksDemo() {
  const t = useTranslations('blog');

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={stagger}
      className="my-12 rounded-2xl bg-gradient-to-br from-blue-50/80 via-purple-50/50 to-pink-50/80 dark:from-slate-800/60 dark:via-purple-900/20 dark:to-slate-800/60 border border-purple-200/50 dark:border-purple-700/30 p-6 md:p-8"
    >
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
        {t('demoSectionTitle')}
      </h3>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-2 mb-8">
        <motion.div
          variants={item}
          className="flex items-center gap-4 p-4 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex-1"
        >
          <motion.div
            className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Wallet className="w-6 h-6" />
          </motion.div>
          <div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
            <p className="text-sm font-medium text-slate-800 dark:text-white">
              {t('demoStep1')}
            </p>
          </div>
        </motion.div>
        <motion.div variants={item} className="flex justify-center text-slate-300 dark:text-slate-500 shrink-0 md:rotate-0">
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6 rotate-90 md:rotate-0" />
        </motion.div>
        <motion.div
          variants={item}
          className="flex items-center gap-4 p-4 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex-1"
        >
          <motion.div
            className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <CreditCard className="w-6 h-6" />
          </motion.div>
          <div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">2</span>
            <p className="text-sm font-medium text-slate-800 dark:text-white">
              {t('demoStep2')}
            </p>
          </div>
        </motion.div>
        <motion.div variants={item} className="flex justify-center text-slate-300 dark:text-slate-500 shrink-0 md:rotate-0">
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6 rotate-90 md:rotate-0" />
        </motion.div>
        <motion.div
          variants={item}
          className="flex items-center gap-4 p-4 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex-1"
        >
          <motion.div
            className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Upload className="w-6 h-6" />
          </motion.div>
          <div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">3</span>
            <p className="text-sm font-medium text-slate-800 dark:text-white">
              {t('demoStep3')}
            </p>
          </div>
        </motion.div>
      </div>
      <motion.div variants={item} className="text-center">
        <Link
          href="/#how-it-works"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
        >
          <Play className="w-4 h-4" />
          {t('seeAnimatedDemo')}
        </Link>
      </motion.div>
    </motion.section>
  );
}
