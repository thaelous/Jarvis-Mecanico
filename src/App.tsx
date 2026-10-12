import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { MECHANICAL_MODELS } from './cad/models';
import {
  PartRuntimeState,
  RenderMode,
  ThemeMode,
  TransformToolMode,
} from './types/cad';
import { CADViewport, ViewportTelemetry } from './cad/CADViewport';
import { HUDHeader } from './components/HUDHeader';
import { PartsListPanel } from './components/PartsListPanel';
import { PartDetailsHUD } from './components/PartDetailsHUD';
import { AssembleControlsBar } from './components/AssembleControlsBar';
import { TutorialGuideHUD } from './components/TutorialGuideHUD';
import { HelpModal } from './components/HelpModal';
import { sound } from './utils/audio';

export default function App() {
  // Current active mechanical model (Frenos de Disco, Eje, Transmisión, Amortiguador, Pistón)
  const [currentModelId, setCurrentModelId] = useState<string>('brake');
  const activeModelDef = MECHANICAL_MODELS[currentModelId] || MECHANICAL_MODELS['brake'];

  // Theme Mode: Default to Light Mode (CAD Industrial Clean SolidWorks #e2e8f0 / #1d4ed8)
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  // Selection & interaction modes (clean initial state)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [explodeProgress, setExplodeProgress] = useState<number>(0.0);
  const [renderMode, setRenderMode] = useState<RenderMode>('pbr');
  const [toolMode, setToolMode] = useState<TransformToolMode>('orbit');
  const [showGizmo, setShowGizmo] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [showGhostSilhouette, setShowGhostSilhouette] = useState<boolean>(true);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);
  const [showPartsTree, setShowPartsTree] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [cameraPresetTrigger, setCameraPresetTrigger] = useState<string | null>(null);

  // Kinematic Real Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [resetViewTrigger, setResetViewTrigger] = useState<number>(0);
  const [snapAllTrigger, setSnapAllTrigger] = useState<number>(0);

  // Physics engine toggle (Cannon.js)
  const [physicsEnabled, setPhysicsEnabled] = useState<boolean>(false);

  // Guided Tutorial state
  const [isTutorialActive, setIsTutorialActive] = useState<boolean>(false);
  const [tutorialMode, setTutorialMode] = useState<'assemble' | 'disassemble'>('assemble');
  const [tutorialStepIndex, setTutorialStepIndex] = useState<number>(0);
  const [tutorialPaused, setTutorialPaused] = useState<boolean>(false);

  // Runtime states for parts of active model
  const [partStates, setPartStates] = useState<Map<string, PartRuntimeState>>(new Map());
  const [telemetry, setTelemetry] = useState<ViewportTelemetry | undefined>(undefined);

  // Ref to cancel ongoing animation
  const animFrameRef = useRef<number | null>(null);

  // Sound enable state sync
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Sync light-mode and dark-mode classes on body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (themeMode === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      } else {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      }
    }
  }, [themeMode]);

  // Toggle Theme Mode
  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toggle 3D Info Labels
  const handleToggleLabels = () => {
    setShowLabels((prev) => !prev);
  };

  // Reset selection, explode progress and camera when switching model
  const handleSelectModel = (id: string) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsSimulating(false);
    setIsTutorialActive(false);
    setSelectedPartId(null);
    setExplodeProgress(0.0);
    setCameraPresetTrigger('iso');
    setTimeout(() => setCameraPresetTrigger(null), 120);
    setCurrentModelId(id);
  };

  // Toggle part visibility
  const handleToggleVisibility = useCallback((partId: string) => {
    setPartStates((prev) => {
      const updated = new Map(prev);
      const st = updated.get(partId);
      if (st) {
        updated.set(partId, { ...st, isVisible: !st.isVisible });
      }
      return updated;
    });
  }, []);

  // Isolate part
  const handleIsolatePart = useCallback((partId: string) => {
    setPartStates((prev) => {
      const updated = new Map(prev);
      const currentlyOnlyOne = Array.from(updated.values()).filter((s) => s.isVisible).length === 1;

      updated.forEach((val, key) => {
        if (currentlyOnlyOne) {
          updated.set(key, { ...val, isVisible: true });
        } else {
          updated.set(key, { ...val, isVisible: key === partId });
        }
      });
      return updated;
    });
    setSelectedPartId(partId);
  }, []);

  // Show all parts
  const handleShowAllParts = useCallback(() => {
    setPartStates((prev) => {
      const updated = new Map(prev);
      updated.forEach((val, key) => {
        updated.set(key, { ...val, isVisible: true });
      });
      return updated;
    });
  }, []);

  // Snap a specific part directly to its nominal zero target
  const handleSnapPart = useCallback((partId: string) => {
    setPartStates((prev) => {
      const updated = new Map(prev);
      const st = updated.get(partId);
      const partDef = activeModelDef.createParts().parts.find((p) => p.id === partId);
      if (st && partDef && st.meshGroup) {
        st.meshGroup.position.set(...partDef.defaultPosition);
        st.meshGroup.rotation.set(...partDef.defaultRotation);
        sound.playSnap();
        updated.set(partId, {
          ...st,
          isSnapped: true,
          distanceToTarget: 0,
        });
      }
      return updated;
    });
  }, [activeModelDef]);

  // ⚡ Acoplar Todo: Triggers 500ms smooth cubic ease-out animation in render loop
  const handleSnapAll = useCallback(() => {
    setIsSimulating(false);
    setSnapAllTrigger(Date.now());
  }, []);

  // Explode a single part along its vector
  const handleExplodePart = useCallback((partId: string) => {
    setPartStates((prev) => {
      const updated = new Map(prev);
      const st = updated.get(partId);
      const partDef = activeModelDef.createParts().parts.find((p) => p.id === partId);
      if (st && partDef && st.meshGroup) {
        const dx = partDef.defaultPosition[0] + partDef.explodeVector[0] * (partDef.explodeDistance || 2.5);
        const dy = partDef.defaultPosition[1] + partDef.explodeVector[1] * (partDef.explodeDistance || 2.5);
        const dz = partDef.defaultPosition[2] + partDef.explodeVector[2] * (partDef.explodeDistance || 2.5);
        st.meshGroup.position.set(dx, dy, dz);
        updated.set(partId, {
          ...st,
          isSnapped: false,
          distanceToTarget: Math.hypot(dx - partDef.defaultPosition[0], dy - partDef.defaultPosition[1], dz - partDef.defaultPosition[2]),
        });
      }
      return updated;
    });
  }, [activeModelDef]);

  // Continuous Explosion Slider Handler (Direct mathematical lerpVectors, 0% to 100%)
  const handleExplodeChange = useCallback((progress: number) => {
    setExplodeProgress(progress);
    if (progress > 0) {
      setIsSimulating(false);
    }
  }, []);

  // Mechanical Kinematic Simulation Toggle
  const handleToggleSimulating = useCallback(() => {
    setIsSimulating((prev) => {
      const next = !prev;
      if (next) {
        sound.playSnap();
        setExplodeProgress(0.0);
      }
      return next;
    });
  }, []);

  // Reiniciar Vista (~450ms smooth camera & target reset without altering part states)
  const handleResetView = () => {
    sound.playClick(600);
    setResetViewTrigger(Date.now());
  };

  // Tutorial Flow Methods
  const activeTutorialSteps =
    tutorialMode === 'assemble' ? activeModelDef.assemblySteps : activeModelDef.disassemblySteps;

  const currentTutorialStep = activeTutorialSteps[tutorialStepIndex] || null;

  const handleStartTutorial = (mode: 'assemble' | 'disassemble') => {
    setTutorialMode(mode);
    setTutorialStepIndex(0);
    setTutorialPaused(false);
    setIsTutorialActive(true);

    if (mode === 'assemble') {
      setExplodeProgress(0.7);
    } else {
      setExplodeProgress(0.0);
    }

    const firstStep = mode === 'assemble' ? activeModelDef.assemblySteps[0] : activeModelDef.disassemblySteps[0];
    if (firstStep) {
      setSelectedPartId(firstStep.partId);
      setToolMode('translate');
    }
  };

  const handleNextTutorialStep = () => {
    if (tutorialStepIndex < activeTutorialSteps.length - 1) {
      const nextIdx = tutorialStepIndex + 1;
      setTutorialStepIndex(nextIdx);
      const step = activeTutorialSteps[nextIdx];
      setSelectedPartId(step.partId);
    } else {
      sound.playAssemblyComplete();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#06b6d4', '#10b981', '#f59e0b', '#38bdf8'],
        });
      } catch {}
    }
  };

  const handlePrevTutorialStep = () => {
    if (tutorialStepIndex > 0) {
      const prevIdx = tutorialStepIndex - 1;
      setTutorialStepIndex(prevIdx);
      const step = activeTutorialSteps[prevIdx];
      setSelectedPartId(step.partId);
    }
  };

  const handleAutoCompleteStep = () => {
    if (!currentTutorialStep) return;
    const partId = currentTutorialStep.partId;

    if (currentTutorialStep.action === 'assemble') {
      handleSnapPart(partId);
    } else {
      handleExplodePart(partId);
    }

    setTimeout(() => {
      handleNextTutorialStep();
    }, 400);
  };

  // Check if active tutorial step was completed by user
  useEffect(() => {
    if (!isTutorialActive || tutorialPaused || !currentTutorialStep) return;

    const state = partStates.get(currentTutorialStep.partId);
    if (!state) return;

    if (currentTutorialStep.action === 'assemble' && state.isSnapped) {
      const timer = setTimeout(() => {
        handleNextTutorialStep();
      }, 600);
      return () => clearTimeout(timer);
    } else if (currentTutorialStep.action === 'disassemble' && !state.isSnapped && state.distanceToTarget > 1.2) {
      const timer = setTimeout(() => {
        handleNextTutorialStep();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isTutorialActive, tutorialPaused, currentTutorialStep, partStates]);

  // Overall assembly percentage
  const parts = activeModelDef.createParts().parts;
  const snappedCount = parts.filter((p) => {
    const st = partStates.get(p.id);
    return st ? st.isSnapped : true;
  }).length;
  const assemblyPercentage = Math.round((snappedCount / (parts.length || 1)) * 100);

  const selectedPartConfig = selectedPartId
    ? parts.find((p) => p.id === selectedPartId) || null
    : null;
  const selectedRuntimeState = selectedPartId ? partStates.get(selectedPartId) || null : null;

  const isLight = themeMode === 'light';

  return (
    <div
      className={`fixed inset-0 w-screen h-screen overflow-hidden font-mono select-none transition-colors duration-200 ${
        isLight ? 'bg-[#e2e8f0] text-slate-800' : 'bg-[#07090e] text-slate-100 blueprint-grid-subtle'
      }`}
    >
      {/* 1. PREPONDERANCIA ABSOLUTA DEL MODELO 3D: Canvas WebGL ocupa el 100% del Viewport (width: 100vw; height: 100vh; position: fixed; inset: 0;) */}
      <div
        className="fixed inset-0 w-screen h-screen z-0 overflow-hidden"
        style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0 }}
      >
        <CADViewport
          modelDef={activeModelDef}
          selectedPartId={selectedPartId}
          onSelectPart={(id) => {
            setSelectedPartId(id);
            if (id && toolMode === 'orbit') {
              setToolMode('translate');
            }
          }}
          explodeProgress={explodeProgress}
          renderMode={renderMode}
          themeMode={themeMode}
          toolMode={toolMode}
          showGizmo={showGizmo}
          showLabels={showLabels}
          showGhostSilhouette={showGhostSilhouette}
          physicsEnabled={physicsEnabled}
          tutorialTargetPartId={isTutorialActive && currentTutorialStep ? currentTutorialStep.partId : null}
          partStates={partStates}
          onUpdatePartStates={setPartStates}
          onSnapPart={(id) => {
            handleSnapPart(id);
          }}
          onUpdateTelemetry={setTelemetry}
          cameraPresetTrigger={cameraPresetTrigger}
          isSimulating={isSimulating}
          onSetSimulating={setIsSimulating}
          resetViewTrigger={resetViewTrigger}
          snapAllTrigger={snapAllTrigger}
          onExplodeChange={handleExplodeChange}
        />
      </div>

      {/* 2. Top Header flotante (Mobile-First: compacto con menú desplegable "⚙️ Herramientas") */}
      <HUDHeader
        currentModelId={currentModelId}
        onSelectModel={handleSelectModel}
        renderMode={renderMode}
        onSetRenderMode={setRenderMode}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        showLabels={showLabels}
        onToggleLabels={handleToggleLabels}
        showGhostSilhouette={showGhostSilhouette}
        onToggleGhostSilhouette={() => setShowGhostSilhouette((prev) => !prev)}
        showTelemetry={showTelemetry}
        onToggleTelemetry={() => setShowTelemetry((prev) => !prev)}
        showPartsTree={showPartsTree}
        onTogglePartsTree={() => setShowPartsTree((prev) => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        physicsEnabled={physicsEnabled}
        onTogglePhysics={() => setPhysicsEnabled(!physicsEnabled)}
        isTutorialActive={isTutorialActive}
        onStartTutorial={handleStartTutorial}
        onOpenHelp={() => setHelpOpen(true)}
        onSetCameraPreset={(preset) => {
          setCameraPresetTrigger(preset);
          setTimeout(() => setCameraPresetTrigger(null), 100);
        }}
        assemblyPercentage={assemblyPercentage}
        telemetry={telemetry}
      />

      {/* 3. Panel Lateral de Componentes (Off-canvas Drawer, nunca bloquea permanentemente la visión) */}
      <PartsListPanel
        modelDef={activeModelDef}
        partStates={partStates}
        selectedPartId={selectedPartId}
        onSelectPart={(id) => {
          setSelectedPartId(id);
          if (id && toolMode === 'orbit') {
            setToolMode('translate');
          }
        }}
        onToggleVisibility={handleToggleVisibility}
        onIsolatePart={handleIsolatePart}
        onSnapPart={handleSnapPart}
        onShowAllParts={handleShowAllParts}
        themeMode={themeMode}
        isOpen={showPartsTree}
        onToggleOpen={() => setShowPartsTree((prev) => !prev)}
      />

      {/* 4. Panel Derecho de Telemetría & Detalles (Desplegable y Dismissible) */}
      <PartDetailsHUD
        isOpen={showTelemetry}
        onClose={() => setShowTelemetry(false)}
        partConfig={selectedPartConfig}
        runtimeState={selectedRuntimeState}
        modelDef={activeModelDef}
        telemetry={telemetry}
        assemblyPercentage={assemblyPercentage}
        physicsEnabled={physicsEnabled}
        onSnapPart={handleSnapPart}
        onExplodePart={handleExplodePart}
        themeMode={themeMode}
      />

      {/* 5. Guided Tutorial Interactive Floating HUD */}
      <TutorialGuideHUD
        isActive={isTutorialActive}
        isPaused={tutorialPaused}
        mode={tutorialMode}
        steps={activeTutorialSteps}
        currentStepIndex={tutorialStepIndex}
        onPauseToggle={() => setTutorialPaused(!tutorialPaused)}
        onNextStep={handleNextTutorialStep}
        onPrevStep={handlePrevTutorialStep}
        onAutoCompleteStep={handleAutoCompleteStep}
        onResetTutorial={() => setTutorialStepIndex(0)}
        onExitTutorial={() => setIsTutorialActive(false)}
      />

      {/* 6. Botonera Inferior Táctil Ergonómica (Safe Area, 1 sola línea compacta) */}
      <AssembleControlsBar
        explodeProgress={explodeProgress}
        onExplodeChange={handleExplodeChange}
        onResetView={handleResetView}
        toolMode={toolMode}
        onSetToolMode={setToolMode}
        showGizmo={showGizmo}
        onToggleGizmo={() => setShowGizmo(!showGizmo)}
        isSimulating={isSimulating}
        onToggleSimulating={handleToggleSimulating}
        onSnapAll={handleSnapAll}
        themeMode={themeMode}
      />

      {/* 7. Modal de Ayuda */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
