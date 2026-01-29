'use client';

import { CreateOrderForm } from '@/components/orders/CreateOrderForm';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SciFiBackground from '@/components/SciFiBackground';

export default function SellPage() {
  const t = useTranslations('sell');
  const router = useRouter();
  
  return (
    <div className="min-h-screen relative">
      <SciFiBackground />
      {/* Hero Section - Apple Style */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                {t('title')}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CreateOrderForm onSwitchToManage={() => router.push('/account')} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
