import { useState, useEffect, useCallback, useRef } from 'react';
import { COLS, ROWS, TETROMINOS, TetrominoType } from '../constants';

export type Grid = (string | null)[][];

const createEmptyGrid = (): Grid => 
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const getRandomTetromino = (): TetrominoType => {
  const keys = Object.keys(TETROMINOS) as TetrominoType[];
  return keys[Math.floor(Math.random() * keys.length)];
};

export const useTetris = () => {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [activePiece, setActivePiece] = useState<{
    pos: { x: number; y: number };
    type: TetrominoType;
    shape: number[][];
  } | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType>(getRandomTetromino());
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastClearedLines, setLastClearedLines] = useState(0);

  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const dropCounterRef = useRef<number>(0);

  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setNextPiece(getRandomTetromino());
    setHoldPiece(null);
    setCanHold(true);
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    spawnPiece();
  }, []);

  const spawnPiece = useCallback((typeOverride?: TetrominoType) => {
    const type = typeOverride || nextPiece;
    const shape = TETROMINOS[type].shape;
    const pos = {
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0
    };

    if (checkCollision(pos, shape)) {
      setGameOver(true);
      return;
    }

    setActivePiece({ pos, type, shape });
    if (!typeOverride) {
      setNextPiece(getRandomTetromino());
    }
  }, [nextPiece]);

  const checkCollision = (pos: { x: number; y: number }, shape: number[][], currentGrid: Grid = grid) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;

          if (
            newX < 0 || 
            newX >= COLS || 
            newY >= ROWS ||
            (newY >= 0 && currentGrid[newY][newX] !== null)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (shape: number[][]) => {
    const newShape = shape[0].map((_, index) => 
      shape.map(col => col[index]).reverse()
    );
    return newShape;
  };

  const attemptRotate = useCallback(() => {
    if (!activePiece || gameOver || isPaused) return;

    const newShape = rotate(activePiece.shape);
    // Wall kick simple version
    let offset = 0;
    if (checkCollision({ x: activePiece.pos.x, y: activePiece.pos.y }, newShape)) {
        offset = activePiece.pos.x > COLS / 2 ? -1 : 1;
        if (checkCollision({ x: activePiece.pos.x + offset, y: activePiece.pos.y }, newShape)) {
            return;
        }
    }

    setActivePiece(prev => prev ? { ...prev, pos: { ...prev.pos, x: prev.pos.x + offset }, shape: newShape } : null);
  }, [activePiece, gameOver, isPaused, grid]);

  const move = useCallback((dir: { x: number; y: number }) => {
    if (!activePiece || gameOver || isPaused) return;

    const newPos = {
      x: activePiece.pos.x + dir.x,
      y: activePiece.pos.y + dir.y
    };

    if (!checkCollision(newPos, activePiece.shape)) {
      setActivePiece(prev => prev ? { ...prev, pos: newPos } : null);
      return true;
    }

    if (dir.y > 0) {
      lockPiece();
    }
    return false;
  }, [activePiece, gameOver, isPaused, grid]);

  const lockPiece = useCallback(() => {
    if (!activePiece) return;

    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const gridY = activePiece.pos.y + y;
            const gridX = activePiece.pos.x + x;
            if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
              newGrid[gridY][gridX] = TETROMINOS[activePiece.type].color;
            }
          }
        });
      });

      // Clear lines
      let linesCleared = 0;
      const filteredGrid = newGrid.filter(row => {
        const isFull = row.every(cell => cell !== null);
        if (isFull) linesCleared++;
        return !isFull;
      });

      while (filteredGrid.length < ROWS) {
        filteredGrid.unshift(Array(COLS).fill(null));
      }

      if (linesCleared > 0) {
        const linePoints = [0, 40, 100, 300, 1200];
        setScore(src => src + linePoints[linesCleared] * level);
        setLastClearedLines(linesCleared);
        setTimeout(() => setLastClearedLines(0), 500); // Clear effect after 500ms
        setLines(l => {
          const newLines = l + linesCleared;
          if (Math.floor(newLines / 10) > level - 1) {
            setLevel(lv => lv + 1);
          }
          return newLines;
        });
      }

      return filteredGrid;
    });

    setActivePiece(null);
    setCanHold(true);
    spawnPiece();
  }, [activePiece, level, spawnPiece]);

  const hardDrop = useCallback(() => {
    if (!activePiece || gameOver || isPaused) return;
    
    let currentY = activePiece.pos.y;
    while (!checkCollision({ x: activePiece.pos.x, y: currentY + 1 }, activePiece.shape)) {
      currentY++;
    }
    
    setActivePiece(prev => prev ? { ...prev, pos: { ...prev.pos, y: currentY } } : null);
    // Force a lock on next tick or manually trigger it
    // Using a microtask to ensure state update is processed
    setTimeout(lockPiece, 0);
  }, [activePiece, gameOver, isPaused, lockPiece]);

  const hold = useCallback(() => {
    if (!activePiece || !canHold || gameOver || isPaused) return;

    const currentType = activePiece.type;
    if (holdPiece) {
      setHoldPiece(currentType);
      spawnPiece(holdPiece);
    } else {
      setHoldPiece(currentType);
      setActivePiece(null);
      spawnPiece();
    }
    setCanHold(false);
  }, [activePiece, holdPiece, canHold, gameOver, isPaused, spawnPiece]);

  // Game cycle
  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const dropInterval = Math.max(100, 1000 - (level - 1) * 100);

    const update = (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      dropCounterRef.current += deltaTime;
      if (dropCounterRef.current >= dropInterval) {
        move({ x: 0, y: 1 });
        dropCounterRef.current = 0;
      }

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameOver, isPaused, level, move]);

  // Initial spawn
  useEffect(() => {
    spawnPiece();
  }, []);

  return {
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
  };
};
