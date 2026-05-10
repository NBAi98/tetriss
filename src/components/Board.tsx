import React, { useRef, useEffect } from 'react';
import { COLS, ROWS, BLOCK_SIZE, TETROMINOS, COLORS, TetrominoType } from '../constants';
import { Grid } from '../hooks/useTetris';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface BoardProps {
  grid: Grid;
  activePiece: {
    pos: { x: number; y: number };
    type: TetrominoType;
    shape: number[][];
  } | null;
  isClearing?: boolean;
}

const Board: React.FC<BoardProps> = ({ grid, activePiece, isClearing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    if (isClearing) {
      flashRef.current = 15;
      // Spawn particles for "explosion"
      // Find rows that were cleared (this is tricky because we only get the new grid)
      // For now, let's just spawn particles at the bottom 1/3 of the board or random positions
      // A better way would be to pass which lines were cleared, but since we don't have that easily,
      // let's just spawn a big blast.
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * COLS * BLOCK_SIZE,
          y: (ROWS - 2) * BLOCK_SIZE + Math.random() * 2 * BLOCK_SIZE,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.7) * 20,
          life: 1.0,
          color: ['#FFD700', '#C0C0C0', '#ffffff', '#00f0f0'][Math.floor(Math.random() * 4)],
          size: Math.random() * 4 + 2
        });
      }
    }
  }, [isClearing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBlock = (x: number, y: number, color: string, glowColor: string, isGhost = false) => {
      ctx.save();
      const baseX = x * BLOCK_SIZE;
      const baseY = y * BLOCK_SIZE;

      if (isGhost) {
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(baseX + 2, baseY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
      } else {
        ctx.shadowBlur = 10;
        ctx.shadowColor = glowColor;
        
        const gradient = ctx.createLinearGradient(baseX, baseY, baseX + BLOCK_SIZE, baseY + BLOCK_SIZE);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(0.51, color);
        gradient.addColorStop(1, color);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        const r = 4;
        if (ctx.roundRect) {
          ctx.roundRect(baseX + 2, baseY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4, r);
        } else {
          // Fallback for older browsers
          ctx.rect(baseX + 2, baseY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
        }
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(baseX + 6, baseY + 6);
        ctx.lineTo(baseX + BLOCK_SIZE - 12, baseY + 6);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(baseX + 4, baseY + 4, BLOCK_SIZE - 8, BLOCK_SIZE - 8, r);
        } else {
          ctx.rect(baseX + 4, baseY + 4, BLOCK_SIZE - 8, BLOCK_SIZE - 8);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    const animate = () => {
      // Clear
      ctx.fillStyle = COLORS.board;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Flash
      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashRef.current / 30})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashRef.current -= 0.5;
      }

      // Grid
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
        ctx.stroke();
      }

      // Static Pieces
      grid.forEach((row, y) => {
        row.forEach((color, x) => {
          if (color) {
            drawBlock(x, y, color, color + '80');
          }
        });
      });

      // Active & Ghost
      if (activePiece) {
        let ghostY = activePiece.pos.y;
        const checkCollision = (y: number) => {
          for (let row = 0; row < activePiece.shape.length; row++) {
            for (let col = 0; col < activePiece.shape[row].length; col++) {
              if (activePiece.shape[row][col] !== 0) {
                const newX = activePiece.pos.x + col;
                const newY = y + row;
                if (newY >= ROWS || (newY >= 0 && grid[newY][newX] !== null)) return true;
              }
            }
          }
          return false;
        };
        while (!checkCollision(ghostY + 1)) ghostY++;

        const tetromino = TETROMINOS[activePiece.type];
        activePiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              drawBlock(activePiece.pos.x + x, ghostY + y, tetromino.color, tetromino.glowColor, true);
              drawBlock(activePiece.pos.x + x, activePiece.pos.y + y, tetromino.color, tetromino.glowColor);
            }
          });
        });
      }

      // Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.8; // gravity
        p.life -= 0.02;
        
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        return p.life > 0;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [grid, activePiece]);

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-red-600/10 blur-2xl rounded-xl"></div>
      <div className="relative p-1 bg-[#050505] rounded-xl border-4 border-[#1A1A1C] shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
          className="rounded-sm"
        />
      </div>
    </div>
  );
};

export default Board;
