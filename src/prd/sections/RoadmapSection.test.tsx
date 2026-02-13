import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RoadmapSection } from './RoadmapSection';

describe('RoadmapSection', () => {
  it('renders section title', () => {
    render(<RoadmapSection />);
    expect(screen.getByText(/功能开发路线图/)).toBeInTheDocument();
  });

  it('renders feature priorities', () => {
    render(<RoadmapSection />);
    const p0Tags = screen.getAllByText(/P0/);
    expect(p0Tags.length).toBeGreaterThan(0);
  });

  it('renders feature names', () => {
    render(<RoadmapSection />);
    expect(screen.getByText(/NFC 唤醒/)).toBeInTheDocument();
    expect(screen.getByText(/双层音频系统/)).toBeInTheDocument();
    expect(screen.getByText(/AI 治愈回信/)).toBeInTheDocument();
  });

  it('renders feature statuses', () => {
    render(<RoadmapSection />);
    // Check for status indicators
    const completedElements = screen.getAllByText(/已完成/i);
    const inProgressElements = screen.getAllByText(/进行中/i);
    expect(completedElements.length).toBeGreaterThan(0);
    expect(inProgressElements.length).toBeGreaterThan(0);
  });
});
