import React, { useState, useMemo } from 'react';
import StageTopBar from './components/StageTopBar';
import { DNA_TOPICS } from './data/dnaTopics.js';
import Sidebar from './components/Sidebar.jsx';
import DnaStage from './components/DnaStage.jsx';
import InfoCard from './components/InfoCard.jsx';
import IndexLanding from './components/IndexLanding.jsx';

export default function App() {
  const [view, setView] = useState('index');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
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
    setInfoOpen(true);
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + DNA_TOPICS.length) % DNA_TOPICS.length;
    handleSelectTopic(DNA_TOPICS[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % DNA_TOPICS.length;
    handleSelectTopic(DNA_TOPICS[nextIdx].id);
  };

  const handleLaunchDna = () => setView('stage');

  const handleBackToTopics = () => {
    setView('index');
    setInfoOpen(false);
  };

  const handleSelectTopicAndClose = (topicId) => {
    handleSelectTopic(topicId);
    setSidebarOpen(false);
  };

  if (view === 'index') {
    return <IndexLanding onLaunchDna={handleLaunchDna} />;
  }

  const infoCard = (
    <InfoCard
      topic={activeTopic}
      topicIndex={activeIndex}
      totalTopics={DNA_TOPICS.length}
      onPrev={handlePrev}
      onNext={handleNext}
      selectedRung={selectedRung}
    />
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050814] text-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar — desktop collapsible + mobile slide-over */}
      <Sidebar
        topics={DNA_TOPICS}
        activeTopicId={activeTopicId}
        onSelectTopic={handleSelectTopicAndClose}
        isSpinning={isSpinning}
        onToggleSpin={() => setIsSpinning((prev) => !prev)}
        selectedRung={selectedRung}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setSidebarOpen(false)}
        open={sidebarOpen}
        onOpenMobile={() => setSidebarOpen(true)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <StageTopBar
          onBackToTopics={handleBackToTopics}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          infoOpen={infoOpen}
          onToggleInfo={() => setInfoOpen((prev) => !prev)}
        />

        <div className="relative flex min-h-0 flex-1">
          {/* 3D Canvas fills remaining width */}
          <div className="relative min-w-0 flex-1">
            <DnaStage
              activeTopicId={activeTopicId}
              selectedRung={selectedRung}
              isSpinning={isSpinning}
              onSelectPart={handleSelectPart}
              onResetSelection={() => setSelectedRung(null)}
            />
          </div>

          {/* Frosted-Glass Info Card rail — sibling of canvas, zero overlap */}
          {infoOpen && (
            <aside className="w-[360px] shrink-0 border-l border-white/10 bg-slate-900/40 p-4 backdrop-blur-2xl xl:flex xl:w-[384px] xl:p-5">
              {infoCard}
            </aside>
          )}
        </div>
      </main>

      {/* Mobile info drawer */}
      {infoOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setInfoOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-[360px] max-w-full bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_-24px_60px_-15px_rgba(0,0,0,0.85)] animate-slide-in">
            {infoCard}
          </div>
        </div>
      )}
    </div>
  );
}
