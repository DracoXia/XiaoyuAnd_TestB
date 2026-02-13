import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HypothesesSection } from './HypothesesSection';

describe('HypothesesSection', () => {
  it('renders section title', () => {
    render(<HypothesesSection />);
    expect(screen.getByText(/核心假设与验证体系/)).toBeInTheDocument();
  });

  it('renders all three hypothesis types', () => {
    render(<HypothesesSection />);
    // Check for hypothesis type titles
    expect(screen.getByText(/行为假设/)).toBeInTheDocument();
    expect(screen.getByText(/情感假设/)).toBeInTheDocument();
    expect(screen.getByText(/社交假设/)).toBeInTheDocument();
  });

  it('renders English titles for hypotheses', () => {
    render(<HypothesesSection />);
    expect(screen.getByText(/Behavioral Hypothesis/)).toBeInTheDocument();
    expect(screen.getByText(/Emotional Hypothesis/)).toBeInTheDocument();
    expect(screen.getByText(/Social Hypothesis/)).toBeInTheDocument();
  });

  it('renders risk points', () => {
    render(<HypothesesSection />);
    // There are 3 hypotheses, each with a risk point
    const riskPoints = screen.getAllByText(/风险点/);
    expect(riskPoints.length).toBeGreaterThan(0);
  });

  it('renders metrics with targets', () => {
    render(<HypothesesSection />);
    expect(screen.getByText(/NFC 激活率/)).toBeInTheDocument();
    expect(screen.getByText(/复购率/)).toBeInTheDocument();
  });
});
