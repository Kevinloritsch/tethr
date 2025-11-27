import { cn } from '@/utils/cn';

describe('cn utility', () => {
  it('combines class names correctly', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('merges tailwind classes', () => {
    const result = cn('px-4 py-2', 'px-8');
    expect(result).toContain('px-8');
    expect(result).toContain('py-2');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn(isActive && 'bg-blue-500', 'text-white');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
  });

  it('handles false conditions', () => {
    const isActive = false;
    const result = cn(isActive && 'bg-blue-500', 'text-white');
    expect(result).toContain('text-white');
    expect(result).not.toContain('false');
  });

  it('handles empty strings', () => {
    const result = cn('px-4', '', 'py-2');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('handles undefined values', () => {
    const result = cn('px-4', undefined, 'py-2');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('returns string type', () => {
    const result = cn('test-class');
    expect(typeof result).toBe('string');
  });
});
