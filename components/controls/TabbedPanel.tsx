'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabbedPanelProps {
  tabs: Tab[];
  defaultTab?: string;
}

/**
 * Tabbed panel component for rotating control sections
 * Keeps UI compact by showing one section at a time
 */
export function TabbedPanel({ tabs, defaultTab }: TabbedPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="flex flex-col h-full">
      {/* Tab buttons */}
      <div className="flex gap-1 bg-gray-800 rounded-t-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all
              ${activeTab === tab.id
                ? 'bg-white text-gray-900'
                : 'bg-transparent text-white/60 hover:text-white/80'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white/90 backdrop-blur rounded-b-xl shadow-xl border-2 border-gray-800 border-t-0 overflow-auto"
      >
        {activeContent}
      </motion.div>
    </div>
  );
}
