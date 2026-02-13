import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PhilosophySection } from './PhilosophySection';

describe('PhilosophySection', () => {
  it('renders the subtitle "Incense First"', () => {
    render(<PhilosophySection />);
    expect(screen.getByText(/Incense First/i)).toBeInTheDocument();
  });

  it('renders contrast points with traditional vs our approach', () => {
    render(<PhilosophySection />);
    // Check for traditional approaches
    expect(screen.getByText(/App 控制一切/)).toBeInTheDocument();
    expect(screen.getByText(/用户需要学习操作/)).toBeInTheDocument();

    // Check for our approaches
    expect(screen.getByText(/物理入口，App 为伴侣/)).toBeInTheDocument();
    expect(screen.getByText(/点香即开始，零学习成本/)).toBeInTheDocument();
  });

  it('renders the main description about physical-first approach', () => {
    render(<PhilosophySection />);
    expect(screen.getByText(/物理世界的优先性/)).toBeInTheDocument();
  });
});
