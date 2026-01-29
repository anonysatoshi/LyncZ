'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

/**
 * Pitch-deck "LyncZ vs Traditional P2P" comparison table (from investors-backup).
 * Rendered in the "LyncZ is Live" blog post.
 */
export default function TraditionalP2PVsLyncZTable() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="my-12"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 flex-wrap text-slate-800 dark:text-white">
        <Image src="/logo.svg" alt="LyncZ" width={100} height={30} className="h-7 w-auto dark:invert" />
        <span>vs Traditional &ldquo;P2P&rdquo;</span>
      </h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-800/60 dark:to-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-700/40 overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-base min-w-[500px]">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-500/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-500/20">
                <th className="text-left py-5 px-6 font-semibold text-slate-700 dark:text-slate-200">
                  Feature
                </th>
                <th className="text-center py-5 px-6 font-semibold text-slate-500 dark:text-slate-400">
                  Traditional &ldquo;P2P&rdquo;
                </th>
                <th className="text-center py-5 px-6">
                  <div className="flex justify-center">
                    <Image
                      src="/logo.svg"
                      alt="LyncZ"
                      width={80}
                      height={24}
                      className="h-6 w-auto dark:invert"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-purple-100/50 dark:border-purple-700/30 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors">
                <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-200">
                  Architecture
                </td>
                <td className="text-center py-5 px-6 text-slate-500 dark:text-slate-400">
                  Centralized platform
                </td>
                <td className="text-center py-5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Fully trustless & permissionless
                </td>
              </tr>
              <tr className="border-t border-purple-100/50 dark:border-purple-700/30 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors">
                <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-200">
                  Post Sell Orders
                </td>
                <td className="text-center py-5 px-6 text-slate-500 dark:text-slate-400">
                  $10K-$100K deposit required
                </td>
                <td className="text-center py-5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Anyone. No barriers.
                </td>
              </tr>
              <tr className="border-t border-purple-100/50 dark:border-purple-700/30 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors">
                <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-200">
                  Middleman Spread
                </td>
                <td className="text-center py-5 px-6 text-slate-500 dark:text-slate-400">
                  2-3% to brokers
                </td>
                <td className="text-center py-5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  0%
                </td>
              </tr>
              <tr className="border-t border-purple-100/50 dark:border-purple-700/30 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors">
                <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-200">
                  Human Effort
                </td>
                <td className="text-center py-5 px-6 text-slate-500 dark:text-slate-400">
                  Stay online, verify manually
                </td>
                <td className="text-center py-5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Fully automatic.
                </td>
              </tr>
              <tr className="border-t border-purple-100/50 dark:border-purple-700/30 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors">
                <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-200">
                  Disputes
                </td>
                <td className="text-center py-5 px-6 text-slate-500 dark:text-slate-400">
                  Common. Manual resolution.
                </td>
                <td className="text-center py-5 px-6">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                    None.
                  </span>
                  <span className="block text-xs text-slate-400 dark:text-slate-500 mt-1">
                    The magic of cryptography.
                  </span>
                </td>
              </tr>
              <tr className="border-t border-purple-100/50 dark:border-purple-700/30 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors">
                <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-200">
                  Settlement Time
                </td>
                <td className="text-center py-5 px-6 text-slate-500 dark:text-slate-400">
                  10+ minutes
                </td>
                <td className="text-center py-5 px-6">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                    &lt;1 minute
                  </span>
                  <span className="block text-xs text-slate-400 dark:text-slate-500 mt-1">
                    *Currently &lt;4 min
                  </span>
                </td>
              </tr>
              <tr className="border-t border-purple-100/50 dark:border-purple-700/30 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors">
                <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-200">
                  Buyer Privacy
                </td>
                <td className="text-center py-5 px-6 text-slate-500 dark:text-slate-400">
                  Info exposed
                </td>
                <td className="text-center py-5 px-6">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                    ZK-Protected
                  </span>
                  <span className="block text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Zero-knowledge privacy
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.section>
  );
}
