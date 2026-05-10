import React from 'react';
import { TETROMINOS, TetrominoType } from '../constants';

interface PiecePreviewProps {
  type: TetrominoType | null;
  label: string;
}

const PiecePreview: React.FC<PiecePreviewProps> = ({ type, label }) => {
  const tetromino = type ? TETROMINOS[type] : null;

  return (
    <div className="flex flex-col p-6 bg-[#121214] border border-white/5 rounded-2xl w-64 shadow-lg">
      <span className="text-[10px] uppercase tracking-widest text-[#E4E4E7]/40 font-bold mb-4">{label}</span>
      <div className="w-full h-24 flex flex-col items-center justify-center bg-black/40 rounded-lg relative overflow-hidden">
        {label === 'HOLD' && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />}
        {tetromino ? (
          <>
            <div 
              className="grid gap-[2px] mb-2" 
              style={{ 
                gridTemplateColumns: `repeat(${tetromino.shape[0].length}, 1fr)`,
              }}
            >
              {tetromino.shape.map((row, y) => 
                row.map((value, x) => (
                  <div 
                    key={`${y}-${x}`}
                    className="w-3 h-3 rounded-sm"
                    style={{ 
                      backgroundColor: value ? tetromino.color : 'transparent',
                      boxShadow: value ? `0 0 10px ${tetromino.glowColor}` : 'none'
                    }}
                  />
                ))
              )}
            </div>
            <span className="text-[8px] font-mono font-bold text-white/60 tracking-widest">{tetromino.metalName}</span>
          </>
        ) : (
          <div className="text-white/10 text-xs uppercase tracking-widest">Empty</div>
        )}
      </div>
    </div>
  );
};

export default PiecePreview;
