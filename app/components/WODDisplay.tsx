'use client';

import { motion } from 'framer-motion';
import { WODOutput } from '@/lib/types';

interface WODDisplayProps {
  wod: WODOutput | null;
}

export default function WODDisplay({ wod }: WODDisplayProps) {
  if (!wod) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200"
    >
      {/* Header */}
      <div className="bg-black text-white p-5">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-black mb-3 leading-tight"
        >
          {wod.wod_title}
        </motion.h2>
        <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
          <span className="bg-red-600 px-3 py-1 rounded-full font-bold">{wod.format}</span>
          {wod.time_cap_minutes && (
            <span className="bg-gray-700 px-3 py-1 rounded-full font-semibold">
              {wod.time_cap_minutes} min cap
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6 pb-24">
        {wod.sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="border-l-4 border-red-600 pl-4"
          >
            <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">
              {section.name}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <motion.li
                  key={itemIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 + itemIndex * 0.05 }}
                  className="text-base text-gray-800 leading-relaxed font-medium"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}

        {wod.equipment && wod.equipment.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-5 border-t-2 border-gray-200"
          >
            <h3 className="text-lg font-black text-gray-900 mb-3 uppercase">Equipment</h3>
            <div className="flex flex-wrap gap-2">
              {wod.equipment.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-full text-sm font-semibold border-2 border-gray-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {wod.notes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-5 border-t-2 border-gray-200"
          >
            <h3 className="text-lg font-black text-gray-900 mb-2 uppercase">Notes</h3>
            <p className="text-base text-gray-700 leading-relaxed font-medium">{wod.notes}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
