import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Trophy, ArrowRight, ArrowLeft, ArrowDown } from 'lucide-react';
import { useTetris } from './hooks/useTetris';
import Board from './components/Board';
import PiecePreview from './components/PiecePreview';

export default function App() {
  const {
    grid,
    activePiece,
    nextPiece,
    holdPiece,
    score,
    lines,
    level,
    lastClearedLines,
    gameOver,
    isPaused,
    setIsPaused,
    move,
    attemptRotate,
    hardDrop,
    hold,
    resetGame,
  } = useTetris();

  // Combo/Message state
  const [showCombo, setShowCombo] = React.useState(false);

  useEffect(() => {
    if (lastClearedLines > 0) {
      setShowCombo(true);
      const timer = setTimeout(() => setShowCombo(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lastClearedLines]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':
        move({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        move({ x: 1, y: 0 });
        break;
      case 'ArrowDown':
        move({ x: 0, y: 1 });
        break;
      case 'ArrowUp':
        attemptRotate();
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
      case 'c':
      case 'C':
      case 'Shift':
        hold();
        break;
      case 'p':
      case 'P':
        setIsPaused(prev => !prev);
        break;
    }
  }, [move, attemptRotate, hardDrop, hold, gameOver, setIsPaused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-[#1a0505] text-[#E4E4E7] flex flex-col font-sans selection:bg-red-500/30 overflow-x-hidden overflow-y-auto relative">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-red-900/15 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-white/10 bg-[#1a0505]/80 backdrop-blur-md shrink-0 sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-800 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
            <span className="font-black text-white text-xl">T</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tighter uppercase italic">Neon Tetra <span className="text-red-400">v2.0</span></h1>
        </div>
        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Session Level</p>
            <p className="text-xl font-mono leading-none">{level < 10 ? `0${level}` : level}</p>
          </div>
          <button 
            onClick={() => setIsPaused(prev => !prev)}
            className="px-4 md:px-6 py-2 bg-white text-black font-bold uppercase text-[10px] md:text-xs tracking-widest rounded-full hover:bg-red-400 transition-colors cursor-pointer active:scale-95 z-50 pointer-events-auto"
          >
            {isPaused ? 'Resume' : 'Pause Game'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row p-6 md:p-12 space-y-8 lg:space-y-0 lg:space-x-12 items-center lg:items-start justify-center">
        
        {/* Left Sidebar: Controls & Hold */}
        <div className="w-full max-w-64 space-y-6 shrink-0 order-2 lg:order-1">
          <div className="p-6 bg-[#121214] border border-white/5 rounded-2xl">
            <h3 className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-4">Controller Guide</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase">Move</span>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">← / →</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase">Rotate</span>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">↑</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase">Soft Drop</span>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">↓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60 uppercase">Hard Drop</span>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">SPACE</span>
              </div>
            </div>
          </div>
          
          <PiecePreview type={holdPiece} label="HOLD" />
        </div>

        {/* Center: Game Board */}
        <div className="relative order-1 lg:order-2 shrink-0">
          <Board grid={grid} activePiece={activePiece} isClearing={lastClearedLines > 0} />
          
          {/* Combo Alert */}
          <AnimatePresence>
            {showCombo && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1.2 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
              >
                <div className="bg-red-600 text-white px-4 py-1 rounded-full font-black uppercase italic tracking-tighter shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                  {lastClearedLines === 4 ? 'TETRA BLAST!' : `+${lastClearedLines} LINES`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlays */}
          <AnimatePresence>
            {(gameOver || isPaused) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 flex items-center justify-center rounded-xl backdrop-blur-[4px] bg-black/70"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-6 p-8 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl text-center min-w-[280px]"
                >
                  {gameOver ? (
                    <>
                      <div className="bg-[#f00000]/20 p-4 rounded-full">
                        <Trophy className="w-12 h-12 text-[#f00000]" />
                      </div>
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter">GAME OVER</h2>
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Final Score</span>
                        <motion.span 
                          key={score}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-3xl font-mono font-bold text-red-500"
                        >
                          {score.toLocaleString()}
                        </motion.span>
                      </div>
                      <button 
                        onClick={resetGame}
                        className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold uppercase text-xs tracking-widest hover:bg-red-500 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        Restart
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-red-500/20 p-4 rounded-full animate-pulse">
                        <Pause className="w-12 h-12 text-red-400" />
                      </div>
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">PAUSED</h2>
                      <button 
                        onClick={() => setIsPaused(false)}
                        className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Resume
                      </button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Next & Stats */}
        <div className="w-full max-w-64 space-y-6 shrink-0 order-3">
          <PiecePreview type={nextPiece} label="NEXT PIECE" />

          <div className="space-y-4">
            <div className="p-6 bg-[#121214] border border-white/5 rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
               <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Current Score</p>
               <AnimatePresence mode="wait">
                 <motion.p 
                   key={score}
                   initial={{ opacity: 0.5, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-4xl font-mono font-bold tracking-tight text-white"
                 >
                   {score.toLocaleString()}
                 </motion.p>
               </AnimatePresence>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#121214] border border-white/5 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Level</p>
                <p className="text-2xl font-bold">{level}</p>
              </div>
              <div className="p-4 bg-[#121214] border border-white/5 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Lines</p>
                <p className="text-2xl font-bold text-red-500">{lines}</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl border border-white/10">
              <h3 className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-2">Pro Tip</h3>
              <p className="text-xs leading-relaxed text-white/90 italic">"Clearing 4 lines simultaneously triggers a 'Neon-Blast' bonus multiplier."</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 bg-[#0a0000] border-t border-white/5 px-6 md:px-12 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold shrink-0">
        <span className="hidden sm:inline">Arcade Status: Operational</span>
        <span>© 2026 NEON TETRA SYSTEMS</span>
        <span className="hidden sm:inline">Lat: 12ms</span>
      </footer>
    </div>
  );
}

