import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const sections = [
  {
    id: 'verse',
    title: 'Ezekiel 4:1-3 — The Blueprint',
    content: `"Now, son of man, take a clay tablet, put it in front of you and draw the city of Jerusalem on it. Then lay siege to it..." — Ezekiel 4:1-3

This verse becomes our metaphor: each button in the system UI draws its own version of the city — a new program context laid like a brick. Every interaction pushes out foreign code (non-believers), enforcing digital sanctity.`
  },
  {
    id: 'autopilot',
    title: 'Autopilot Layer',
    content: 'The Rogers AI autopilot observes current screen state and rewrites the next context live — page transitions don’t change the screen, they *write over it* like a scroll. The visual stays static; only the content and purpose evolve.'
  },
  {
    id: 'chatbot',
    title: 'Chat Bot System',
    content: 'Rogers provides live narration, interpreting the user’s actions through the Ezekiel lens. It suggests paths, records all outputs, and overlays future-predicted states like a divine script unraveling in real time.'
  },
  {
    id: 'animation',
    title: '3D Animation (Chorus Loop)',
    content: 'Each button press triggers a short 3D visual — a refrain, a cycle, a symbolic loop. Think of it as the chorus in a prophetic song: the divine cycle returns each time a layer is invoked.'
  }
];

export default function EzekielSystemUI() {
  const [activeSection, setActiveSection] = useState('verse');

  return (
    <div className="p-6 bg-black text-white min-h-screen font-mono">
      <h1 className="text-2xl font-bold mb-4">Infinity OS — Ezekiel Siege UI</h1>
      <div className="flex space-x-2 mb-6">
        {sections.map(section => (
          <Button
            key={section.id}
            variant={section.id === activeSection ? 'default' : 'outline'}
            onClick={() => setActiveSection(section.id)}
          >
            {section.title}
          </Button>
        ))}
      </div>
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.4 }}
        className="bg-white text-black p-4 rounded-xl shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-2">{sections.find(s => s.id === activeSection)?.title}</h2>
        <p>{sections.find(s => s.id === activeSection)?.content}</p>
      </motion.div>
    </div>
  );
}
