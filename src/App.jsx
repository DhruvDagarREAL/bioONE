import React, { useState, useMemo } from 'react';
import { DNA_TOPICS } from './data/dnaTopics.js';
import Sidebar from './components/Sidebar.jsx';
import DnaStage from './components/DnaStage.jsx';
import InfoCard from './components/InfoCard.jsx';

export default function App() {
  const [activeTopicId, setActiveTopicId] = useState(DNA_TOPICS[0].id);
  const [selectedRung, setSelectedRung] = useState(null);
  const [isSpinning, setIsSpinning] = useState(true);

  const activeIndex = useMemo(
    () => Math.max(0, DNA_TOPICS.findIndex((t) => t.id === activeTopicId)),
    [activeTopicId]
  );

  const activeTopic = DNA_TOPICS[activeIndex];

  const handleSelectTopic = (topicId) => {
    setActiveTopicId(topicId);
    if (topicId !== 'at-pair' && topicId !== 'gc-pair' && topicId !== 'hydrogen-bonds') {
      setSelectedRung(null);
    }
  };

  const handleSelectPart = (partTopicId, rung) => {
    setActiveTopicId(partTopicId);
    setSelectedRung(rung || null);
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + DNA_TOPICS.length) % DNA_TOPICS.length;
    handleSelectTopic(DNA_TOPICS[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % DNA_TOPICS.length;
    handleSelectTopic(DNA_TOPICS[nextIdx].id);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050814] text-slate-100">
      {/* Left Topic Sidebar */}
      <Sidebar
        topics={DNA_TOPICS}
        activeTopicId={activeTopicId}
        onSelectTopic={handleSelectTopic}
        isSpinning={isSpinning}
        onToggleSpin={() => setIsSpinning((prev) => !prev)}
        selectedRung={selectedRung}
      />

      {/* Central Glowing 3D Stage + Right Frosted-Glass Info Card */}
      <main className="relative flex-1 overflow-hidden">
        <DnaStage
          activeTopicId={activeTopicId}
          selectedRung={selectedRung}
          isSpinning={isSpinning}
          onSelectPart={handleSelectPart}
          onResetSelection={() => setSelectedRung(null)}
        />

        {/* Floating Frosted-Glass Card on the Right */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center p-5">
          <InfoCard
            topic={activeTopic}
            topicIndex={activeIndex}
            totalTopics={DNA_TOPICS.length}
            onPrev={handlePrev}
            onNext={handleNext}
            selectedRung={selectedRung}
          />
        </div>
      </main>
    </div>
  );
}
