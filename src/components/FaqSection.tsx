import React, { useState } from 'react';
import { ChevronDown, Truck, RotateCcw, Sparkles, HelpCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  id: string;
  category: 'shipping' | 'returns' | 'products';
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'shipping' | 'returns' | 'products'>('all');

  const faqs: FAQItem[] = [
    {
      id: 'faq_1',
      category: 'shipping',
      question: 'How much does shipping cost and how long does it take?',
      answer: 'Delivery fees are UGX 7,000 for areas within Kampala and UGX 3,000 for Entebbe. For other upcountry destinations across Uganda, distance courier rates apply. Deliveries within Kampala & Entebbe typically arrive within 24 hours, while upcountry delivery takes 2–3 business days with live tracking updates.',
    },
    {
      id: 'faq_2',
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'No, we operate and ship exclusively within Uganda. This allows us to ensure rapid dispatch, responsive logistics, and reliable support using local transport networks.',
    },
    {
      id: 'faq_3',
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We host a hassle-free, simulated lifetime return program. If you are not fully satisfied with your curated minimalist item, you can initiate a return at any point for store credits or refunds.',
    },
    {
      id: 'faq_4',
      category: 'returns',
      question: 'How do I initiate a return?',
      answer: 'Simply tap our digital helpdesk or contact us. We will instantly email you a pre-paid digital shipping label so you can package and return the product securely at zero cost.',
    },
    {
      id: 'faq_5',
      category: 'products',
      question: 'How should I care for my Merino Wool/Eucalyptus garments?',
      answer: 'To preserve the delicate, active fibers, we recommend hand washing cold with mild organic detergents or machine washing delicate cold. Lay flat to dry out of raw sunlight. Avoid tumble dryers and bleach.',
    },
    {
      id: 'faq_6',
      category: 'products',
      question: 'How do I clean and maintain my Ceramic Matte vases?',
      answer: 'Gently wipe with a damp microfiber cloth to clear airborne dust and preserve the sandy grit texture. Avoid highly abrasive metal scrubbing pads or harsh acidic cleansers.',
    },
    {
      id: 'faq_7',
      category: 'products',
      question: 'Are the premium items authentic minimalist designs?',
      answer: 'Yes. Every item in the PrimeStockUG catalog is sourced or designed focusing on extreme geometric precision, minimalist aesthetics, high sustainability metrics, and professional daily utility.',
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq-accordion-section" className="border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 py-16 px-4 md:px-8 transition-colors duration-250">
      <div className="mx-auto max-w-4xl">
        {/* Header Title */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-orange-700 dark:text-orange-400 border border-orange-150/55 dark:border-orange-900/50">
            <HelpCircle className="h-3 w-3" />
            Support Centric Help
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
            Everything you need to know about our premium shipping parameters across Uganda, lifetime return metrics, and organic care guidelines.
          </p>
        </div>

        {/* Filter Navigation Rails - Orange Themed */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Questions', icon: HelpCircle },
            { id: 'shipping', label: 'Shipping', icon: Truck },
            { id: 'returns', label: 'Returns', icon: RotateCcw },
            { id: 'products', label: 'Products & Care', icon: Package },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  setOpenId(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 dark:bg-orange-600 border-orange-500 dark:border-orange-600 text-slate-950 font-black shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Accordions Container */}
        <div className="space-y-3 font-sans">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'border-orange-200 dark:border-orange-900/50 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-slate-150 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between text-left p-4 sm:p-5 focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                      isOpen ? 'bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-455' : 'bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-500'
                    }`}>
                      {faq.category === 'shipping' && <Truck className="h-4 w-4" />}
                      {faq.category === 'returns' && <RotateCcw className="h-4 w-4" />}
                      {faq.category === 'products' && <Package className="h-4 w-4" />}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-450 shrink-0 transition-transform duration-300 ml-4 ${
                      isOpen ? 'rotate-180 text-orange-500' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-1 pl-12 border-t border-slate-50 dark:border-slate-800/50">
                        <p className="text-xs sm:text-xs leading-relaxed text-slate-550 dark:text-slate-400 whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
