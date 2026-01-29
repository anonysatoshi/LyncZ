'use client';

import { motion } from 'framer-motion';

const FLOATING_ELEMENTS: { text: string; size: string }[] = [
  { text: 'y² = x³ + 7', size: 'sm' },
  { text: 'H(m)', size: 'sm' },
  { text: 'π', size: 'sm' },
  { text: 'σ', size: 'sm' },
  { text: '✓', size: 'sm' },
];

// SVG visual elements for cryptographic concepts
const CryptoVisuals = () => (
  <>
    {/* Elliptic Curve Visual */}
    <motion.svg
      className="absolute w-36 h-36 md:w-52 md:h-52 opacity-20 dark:opacity-30"
      style={{ left: '8%', top: '25%' }}
      viewBox="0 0 120 120"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.95, 1, 0.95] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Axes */}
      <line x1="10" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-purple-500" />
      <line x1="60" y1="10" x2="60" y2="110" stroke="currentColor" strokeWidth="0.5" className="text-purple-500" />
      {/* Curve shape */}
      <path
        d="M 25 60 Q 35 20, 60 20 Q 85 20, 95 60 Q 85 100, 60 100 Q 35 100, 25 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-purple-500"
      />
      {/* Points P, Q, R */}
      <circle cx="40" cy="35" r="3" fill="currentColor" className="text-blue-500" />
      <text x="32" y="30" fontSize="8" fill="currentColor" className="text-blue-500">P</text>
      <circle cx="80" cy="35" r="3" fill="currentColor" className="text-pink-500" />
      <text x="84" y="30" fontSize="8" fill="currentColor" className="text-pink-500">Q</text>
      <circle cx="60" cy="85" r="3" fill="currentColor" className="text-emerald-500" />
      <text x="64" y="90" fontSize="8" fill="currentColor" className="text-emerald-500">R</text>
      {/* Line through P and Q */}
      <line x1="30" y1="40" x2="90" y2="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" className="text-slate-400" />
    </motion.svg>

    {/* Merkle Tree Visual */}
    <motion.svg
      className="absolute w-28 h-28 md:w-40 md:h-40 opacity-15 dark:opacity-25"
      style={{ right: '12%', top: '35%' }}
      viewBox="0 0 100 100"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    >
      {/* Root */}
      <circle cx="50" cy="15" r="6" fill="currentColor" className="text-blue-500" />
      {/* Level 1 */}
      <circle cx="30" cy="40" r="5" fill="currentColor" className="text-purple-500" />
      <circle cx="70" cy="40" r="5" fill="currentColor" className="text-purple-500" />
      {/* Level 2 */}
      <circle cx="20" cy="65" r="4" fill="currentColor" className="text-pink-500" />
      <circle cx="40" cy="65" r="4" fill="currentColor" className="text-pink-500" />
      <circle cx="60" cy="65" r="4" fill="currentColor" className="text-pink-500" />
      <circle cx="80" cy="65" r="4" fill="currentColor" className="text-pink-500" />
      {/* Lines */}
      <line x1="50" y1="21" x2="30" y2="35" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
      <line x1="50" y1="21" x2="70" y2="35" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
      <line x1="30" y1="45" x2="20" y2="61" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
      <line x1="30" y1="45" x2="40" y2="61" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
      <line x1="70" y1="45" x2="60" y2="61" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
      <line x1="70" y1="45" x2="80" y2="61" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
    </motion.svg>

    {/* Digital Signature Visual */}
    <motion.svg
      className="absolute w-24 h-24 md:w-32 md:h-32 opacity-15 dark:opacity-20"
      style={{ left: '5%', bottom: '25%' }}
      viewBox="0 0 80 80"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.1, 0.2, 0.1], rotate: [0, 5, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    >
      {/* Document */}
      <rect x="15" y="10" width="35" height="45" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
      <line x1="20" y1="20" x2="45" y2="20" stroke="currentColor" strokeWidth="1" className="text-slate-300" />
      <line x1="20" y1="28" x2="45" y2="28" stroke="currentColor" strokeWidth="1" className="text-slate-300" />
      <line x1="20" y1="36" x2="35" y2="36" stroke="currentColor" strokeWidth="1" className="text-slate-300" />
      {/* Signature curve */}
      <path
        d="M 50 55 Q 55 45, 60 50 Q 65 55, 70 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-purple-500"
      />
      {/* Checkmark */}
      <circle cx="62" cy="25" r="10" fill="currentColor" className="text-emerald-500/30" />
      <path d="M 57 25 L 60 28 L 68 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" />
    </motion.svg>

    {/* SHA-256 Visual */}
    <motion.svg
      className="absolute w-28 h-28 md:w-36 md:h-36 opacity-15 dark:opacity-20"
      style={{ right: '8%', bottom: '30%' }}
      viewBox="0 0 100 100"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
    >
      {/* Input arrow */}
      <rect x="5" y="40" width="25" height="20" rx="2" fill="currentColor" className="text-blue-500/40" />
      <text x="10" y="54" fontSize="8" fill="currentColor" className="text-blue-500">m</text>
      {/* Arrow */}
      <line x1="32" y1="50" x2="42" y2="50" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
      <polygon points="42,47 48,50 42,53" fill="currentColor" className="text-slate-400" />
      {/* Hash box */}
      <rect x="50" y="35" width="30" height="30" rx="4" fill="currentColor" className="text-purple-500/30" />
      <text x="56" y="54" fontSize="7" fill="currentColor" className="text-purple-500">H</text>
      {/* Output */}
      <line x1="82" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
      <text x="55" y="78" fontSize="6" fill="currentColor" className="text-pink-500">256 bits</text>
    </motion.svg>

    {/* Hypercube Visual - Boolean Hypercube with binary labels */}
    <motion.svg
      className="absolute w-32 h-32 md:w-44 md:h-44 opacity-20 dark:opacity-25"
      style={{ right: '20%', top: '12%' }}
      viewBox="0 0 100 100"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.15, 0.25, 0.15], rotate: [0, 8, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
    >
      {/* Outer cube (front face - 0xx) */}
      <rect x="15" y="15" width="35" height="35" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-blue-500" />
      {/* Inner cube (back face - 1xx) */}
      <rect x="35" y="35" width="35" height="35" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-pink-500" />
      {/* Connecting lines (4D projection edges) */}
      <line x1="15" y1="15" x2="35" y2="35" stroke="currentColor" strokeWidth="0.8" className="text-purple-400" />
      <line x1="50" y1="15" x2="70" y2="35" stroke="currentColor" strokeWidth="0.8" className="text-purple-400" />
      <line x1="15" y1="50" x2="35" y2="70" stroke="currentColor" strokeWidth="0.8" className="text-purple-400" />
      <line x1="50" y1="50" x2="70" y2="70" stroke="currentColor" strokeWidth="0.8" className="text-purple-400" />
      
      {/* Vertex dots - outer cube (front) */}
      <circle cx="15" cy="15" r="2.5" fill="currentColor" className="text-blue-400" />
      <circle cx="50" cy="15" r="2.5" fill="currentColor" className="text-blue-400" />
      <circle cx="15" cy="50" r="2.5" fill="currentColor" className="text-blue-400" />
      <circle cx="50" cy="50" r="2.5" fill="currentColor" className="text-blue-400" />
      
      {/* Vertex dots - inner cube (back) */}
      <circle cx="35" cy="35" r="2.5" fill="currentColor" className="text-pink-400" />
      <circle cx="70" cy="35" r="2.5" fill="currentColor" className="text-pink-400" />
      <circle cx="35" cy="70" r="2.5" fill="currentColor" className="text-pink-400" />
      <circle cx="70" cy="70" r="2.5" fill="currentColor" className="text-pink-400" />
      
      {/* Binary labels - outer cube vertices (0xx) */}
      <text x="5" y="12" fontSize="5" fill="currentColor" className="text-blue-500 font-mono">000</text>
      <text x="51" y="12" fontSize="5" fill="currentColor" className="text-blue-500 font-mono">001</text>
      <text x="5" y="56" fontSize="5" fill="currentColor" className="text-blue-500 font-mono">010</text>
      <text x="51" y="56" fontSize="5" fill="currentColor" className="text-blue-500 font-mono">011</text>
      
      {/* Binary labels - inner cube vertices (1xx) */}
      <text x="25" y="32" fontSize="5" fill="currentColor" className="text-pink-500 font-mono">100</text>
      <text x="72" y="32" fontSize="5" fill="currentColor" className="text-pink-500 font-mono">101</text>
      <text x="25" y="76" fontSize="5" fill="currentColor" className="text-pink-500 font-mono">110</text>
      <text x="72" y="76" fontSize="5" fill="currentColor" className="text-pink-500 font-mono">111</text>
    </motion.svg>
  </>
);

export default function SciFiBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"
        style={{ left: '-10%', top: '20%' }}
        animate={{ 
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"
        style={{ right: '-5%', bottom: '10%' }}
        animate={{ 
          x: [0, -30, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
      
      {/* Crypto visuals */}
      <CryptoVisuals />
      
      {/* Floating text elements */}
      {FLOATING_ELEMENTS.map((el, i) => {
        const colorClass = i % 3 === 0 
          ? 'text-purple-400/20 dark:text-purple-400/15' 
          : i % 3 === 1 
          ? 'text-blue-400/20 dark:text-blue-400/15' 
          : 'text-pink-400/20 dark:text-pink-400/15';
        
        return (
          <motion.div
            key={i}
            className={`absolute font-mono text-2xl md:text-3xl select-none ${colorClass}`}
            style={{
              left: `${10 + (i * 20) % 70}%`,
              top: `${15 + (i * 18) % 60}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0.4, 0.3, 0],
            }}
            transition={{
              duration: 15 + (i * 3),
              repeat: Infinity,
              delay: i * 2,
              ease: 'easeInOut'
            }}
          >
            {el.text}
          </motion.div>
        );
      })}
    </div>
  );
}
