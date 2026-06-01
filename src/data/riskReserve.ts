import type { RiskReserve } from '../types/finance';

export const riskReserves: RiskReserve[] = [
  { id: '1', depositDate: '15/01/2026', amount: 1_000_000_000, expiryDate: '30/06/2026', notes: 'Dự phòng quý 2', status: 'approaching' },
  { id: '2', depositDate: '01/03/2026', amount: 1_000_000_000, expiryDate: '30/09/2026', notes: 'Dự phòng quý 3', status: 'safe' },
];

export const totalRiskReserve = 2_000_000_000;
export const nearestExpiry    = '30/06/2026';
