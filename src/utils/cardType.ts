export type CardType = 'top' | 'middle' | 'bottom' | 'solo';

export function getCardType(index: number, total: number): CardType {
  if (total === 1) return 'solo';
  if (index === 0) return 'top';
  if (index === total - 1) return 'bottom';
  return 'middle';
}

export const roundedMap: Record<CardType, string> = {
  top: 'rounded-t-2xl',
  middle: '',
  bottom: 'rounded-b-2xl',
  solo: 'rounded-2xl',
};
