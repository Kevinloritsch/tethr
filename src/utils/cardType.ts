export type CardType = 'top' | 'middle' | 'bottom' | 'solo';

export function getCardType(index: number, total: number): CardType {
  if (total === 1) return 'solo';
  if (index === 0) return 'top';
  if (index === total - 1) return 'bottom';
  return 'middle';
}
