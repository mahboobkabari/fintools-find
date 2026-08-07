import { describe, it, expect } from 'vitest';
import WinnerCard from '../WinnerCard.jsx';
import ComparisonMatrix from '../ComparisonMatrix.jsx';
import ProsConsGrid from '../ProsConsGrid.jsx';
import CalculatorCTA from '../CalculatorCTA.jsx';

describe('Comparison UI Components Suite', () => {
  it('validates WinnerCard function contract', () => {
    expect(typeof WinnerCard).toBe('function');
    const result = WinnerCard({ winner: null, optionA: {}, optionB: {} });
    expect(result).toBeNull();
  });

  it('validates ComparisonMatrix function contract', () => {
    expect(typeof ComparisonMatrix).toBe('function');
    const result = ComparisonMatrix({ matrix: [], optionA: {}, optionB: {} });
    expect(result).toBeNull();
  });

  it('validates ProsConsGrid function contract', () => {
    expect(typeof ProsConsGrid).toBe('function');
    const result = ProsConsGrid({ prosCons: null, optionA: {}, optionB: {} });
    expect(result).toBeNull();
  });

  it('validates CalculatorCTA function contract', () => {
    expect(typeof CalculatorCTA).toBe('function');
  });
});
