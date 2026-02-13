import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserFlowSection } from './UserFlowSection';

describe('UserFlowSection', () => {
  it('renders section title', () => {
    render(<UserFlowSection />);
    expect(screen.getByText(/用户体验地图/)).toBeInTheDocument();
  });

  it('renders NFC entry flow', () => {
    render(<UserFlowSection />);
    expect(screen.getByText(/NFC 入口/)).toBeInTheDocument();
    expect(screen.getByText(/NFC Entry/)).toBeInTheDocument();
  });

  it('renders Dashboard entry flow', () => {
    render(<UserFlowSection />);
    expect(screen.getByText(/Dashboard 入口/)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard Entry/)).toBeInTheDocument();
  });

  it('renders flow steps with actions', () => {
    render(<UserFlowSection />);
    // Check for some step actions - using getAllByText since some actions appear in multiple flows
    const immerseActions = screen.getAllByText(/沉浸疗愈/);
    expect(immerseActions.length).toBeGreaterThan(0);
    expect(screen.getByText(/点燃线香/)).toBeInTheDocument();
    expect(screen.getByText(/NFC 触碰/)).toBeInTheDocument();
  });

  it('renders touchpoints', () => {
    render(<UserFlowSection />);
    // Some touchpoints appear in multiple flows
    const audioTouchpoints = screen.getAllByText(/双层音频/);
    expect(audioTouchpoints.length).toBeGreaterThan(0);
    expect(screen.getByText(/物理线香/)).toBeInTheDocument();
  });
});
