import React, { useState, useMemo } from 'react';
import StageTopBar from './components/StageTopBar';
import { DNA_TOPICS } from './data/dnaTopics.js';
import { MITOCHONDRIA_TOPICS } from './data/mitochondriaTopics.js';
import Sidebar from './components/Sidebar.jsx';
import DnaStage from './components/DnaStage.jsx';
import MitochondriaStage from './components/MitochondriaStage.jsx';
import InfoCard from './components/InfoCard.jsx';
import IndexLanding from './components/IndexLanding.jsx';

export default function App() {
  const [view, setView] = useState('landing');
  const [activeStage, setActiveStage] = useState('b-dna');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(DNA_TOPICS[0].id);
  const [selectedRung, setSelectedRung] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [isSpinning, setIsSpinning] = useState(true);
  const [metabolicRate] = useState(1);
  const [showElectrons] = useState(true);
  const [showProtons] = useState(true);
  const [showATP] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('overview');

  const currentTopics = activeStage === 'b-dna' ? DNA_TOPICS : MITOCHONDRIA_TOPICS;
  const activeIndex = useMemo(
    () => Math.max(0, currentTopics.findIndex((topic) => topic.id === activeTopicId)),
    [activeTopicId, activeStage, currentTopics]
  );

  const activeTopic = currentTopics[activeIndex];

  const handleSelectTopic = (topicId) => {
    setActiveTopicId(topicId);
    if (
      activeStage !== 'b-dna' ||
      (topicId !== 'at-pair' && topicId !== 'gc-pair' && topicId !== 'hydrogen-bonds')
    ) {
      setSelectedRung(null);
    }
    setSelectedPart(null);
  };

  const handleSelectPart = (partTopicId, part) => {
    setActiveTopicId(partTopicId);
    if (activeStage === 'b-dna') {
      setSelectedRung(part || null);
      setSelectedPart(null);
    } else {
      const topic = MITOCHONDRIA_TOPICS.find((item) => item.id === partTopicId);
      setSelectedRung(null);
      setSelectedPart(part || { id: topic?.partKey ?? partTopicId });
    }
    setInfoOpen(true);
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + currentTopics.length) % currentTopics.length;
    handleSelectTopic(currentTopics[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % currentTopics.length;
    handleSelectTopic(currentTopics[nextIdx].id);
  };

  const handleLaunchDna = () => {
    setView('b-dna');
    setActiveStage('b-dna');
    setActiveTopicId(DNA_TOPICS[0].id);
    setSelectedRung(null);
    setSelectedPart(null);
    setInfoOpen(false);
  };

  const handleLaunchMitochondria = () => {
    setView('mitochondria');
    setActiveStage('mitochondria');
    setActiveTopicId(MITOCHONDRIA_TOPICS[0].id);
    setSelectedRung(null);
    setSelectedPart(null);
    setCameraPreset('overview');
    setInfoOpen(false);
  };

  const handleBackToTopics = () => {
    setView('landing');
    setInfoOpen(false);
  };

  const handleSelectTopicAndClose = (topicId) => {
    handleSelectTopic(topicId);
    setSidebarOpen(false);
  };

  if (view === 'landing') {
    return (
      <IndexLanding
        onLaunchDna={handleLaunchDna}
        onLaunchMitochondria={handleLaunchMitochondria}
      />
    );
  }

  const infoCard = (
    <InfoCard
      topic={activeTopic}
      topicIndex={activeIndex}
      totalTopics={currentTopics.length}
      onPrev={handlePrev}
      onNext={handleNext}
      selectedRung={activeStage === 'b-dna' ? selectedRung : null}
    />
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#060913] text-slate-100">
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
        topics={currentTopics}
        activeTopicId={activeTopicId}
        onSelectTopic={handleSelectTopicAndClose}
        isSpinning={isSpinning}
        onToggleSpin={() => setIsSpinning((prev) => !prev)}
        selectedRung={activeStage === 'b-dna' ? selectedRung : null}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setSidebarOpen(false)}
        open={sidebarOpen}
        onOpenMobile={() => setSidebarOpen(true)}
      />

      <main className="flex h-full min-w-0 flex-1 flex-col">
        <StageTopBar
          activeStage={activeStage}
          onBackToTopics={handleBackToTopics}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          infoOpen={infoOpen}
          onToggleInfo={() => setInfoOpen((prev) => !prev)}
        />

        <div className="relative flex min-h-0 w-full flex-1">
          {/* 3D Canvas fills remaining width */}
          <div className="relative h-full min-w-0 w-full flex-1">
            {activeStage === 'b-dna' ? (
              <DnaStage
                activeTopicId={activeTopicId}
                selectedRung={selectedRung}
                isSpinning={isSpinning}
                onSelectPart={handleSelectPart}
                onResetSelection={() => setSelectedRung(null)}
              />
            ) : (
              <MitochondriaStage
                activeTopicId={activeTopicId}
                selectedPart={selectedPart}
                isSpinning={isSpinning}
                metabolicRate={metabolicRate}
                showElectrons={showElectrons}
                showProtons={showProtons}
                showATP={showATP}
                cameraPreset={cameraPreset}
                onSelectPart={handleSelectPart}
                onResetSelection={() => setSelectedPart(null)}
                onCameraPresetChange={setCameraPreset}
              />
            )}
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
