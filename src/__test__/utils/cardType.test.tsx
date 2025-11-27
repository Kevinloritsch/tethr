import { getCardType, roundedMap } from '@/utils/cardType';

describe('cardType utility', () => {
  it('returns solo for single item', () => {
    const result = getCardType(0, 1);
    expect(result).toBe('solo');
  });

  it('returns top for first item in list', () => {
    const result = getCardType(0, 3);
    expect(result).toBe('top');
  });

  it('returns middle for middle items', () => {
    const result = getCardType(1, 3);
    expect(result).toBe('middle');
  });

  it('returns bottom for last item', () => {
    const result = getCardType(2, 3);
    expect(result).toBe('bottom');
  });

  it('returns bottom for last item in 2-item list', () => {
    const result = getCardType(1, 2);
    expect(result).toBe('bottom');
  });

  it('rounds map contains all card types', () => {
    expect(roundedMap.top).toBeDefined();
    expect(roundedMap.middle).toBeDefined();
    expect(roundedMap.bottom).toBeDefined();
    expect(roundedMap.solo).toBeDefined();
  });

  it('rounded map values are strings', () => {
    Object.values(roundedMap).forEach((value) => {
      expect(typeof value).toBe('string');
    });
  });
});
