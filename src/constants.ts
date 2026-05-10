export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30;

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Tetromino {
  shape: number[][];
  color: string;
  glowColor: string;
  metalName: string;
}

export const TETROMINOS: Record<TetrominoType, Tetromino> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#FFD700', // Gold
    glowColor: 'rgba(255, 215, 0, 0.4)',
    metalName: 'Gold',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#E5E4E2', // Platinum
    glowColor: 'rgba(229, 228, 226, 0.4)',
    metalName: 'Platinum',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#CD7F32', // Bronze
    glowColor: 'rgba(205, 127, 50, 0.4)',
    metalName: 'Bronze',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#C0C0C0', // Silver
    glowColor: 'rgba(192, 192, 192, 0.4)',
    metalName: 'Silver',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#B76E79', // Rose Gold
    glowColor: 'rgba(183, 110, 121, 0.4)',
    metalName: 'Rose Gold',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#CED1D2', // Palladium
    glowColor: 'rgba(206, 209, 210, 0.4)',
    metalName: 'Palladium',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#800000', // Deep Copper
    glowColor: 'rgba(128, 0, 0, 0.4)',
    metalName: 'Copper',
  },
};

export const COLORS = {
  board: '#0f0202',
  grid: '#121214',
  border: '#1A1A1C',
};
