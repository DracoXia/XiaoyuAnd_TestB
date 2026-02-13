import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('should render brand name', () => {
    render(<HeroSection />);
    expect(screen.getByText('小屿和')).toBeInTheDocument();
  });

  it('should render English brand name', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Xiaoyu And/i)).toBeInTheDocument();
  });

  it('should render tagline in Chinese', () => {
    render(<HeroSection />);
    expect(screen.getByText('线香即入口')).toBeInTheDocument();
  });

  it('should render tagline in English', () => {
    render(<HeroSection />);
    expect(screen.getByText('Incense First')).toBeInTheDocument();
  });

  it('should render version info', () => {
    render(<HeroSection />);
    expect(screen.getByText(/v2\.3/)).toBeInTheDocument();
  });

  it('should render last updated date', () => {
    render(<HeroSection />);
    expect(screen.getByText(/2026-02-13/)).toBeInTheDocument();
  });

  it('should have full viewport height class', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('h-screen');
  });
});
