import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanoModelSection } from './KanoModelSection';

describe('KanoModelSection', () => {
  it('should render section title', () => {
    render(<KanoModelSection />);
    expect(screen.getByText('Kano模型需求分析')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<KanoModelSection />);
    expect(screen.getByText(/焦虑都市白领/)).toBeInTheDocument();
  });

  it('should render all 6 Kano features', () => {
    render(<KanoModelSection />);
    expect(screen.getByText(/NFC一触即连/)).toBeInTheDocument();
    expect(screen.getByText(/线香品质/)).toBeInTheDocument();
    expect(screen.getByText(/点火即入口/)).toBeInTheDocument();
    expect(screen.getByText(/音频分层/)).toBeInTheDocument();
    expect(screen.getByText(/漂流瓶/)).toBeInTheDocument();
    expect(screen.getByText(/传统社区/)).toBeInTheDocument();
  });

  it('should render Kano category labels', () => {
    render(<KanoModelSection />);
    // Must-be
    expect(screen.getAllByText(/基本型|Must-be/i).length).toBeGreaterThan(0);
    // One-dimensional
    expect(screen.getAllByText(/期望型|One-dimensional/i).length).toBeGreaterThan(0);
    // Delighter
    expect(screen.getAllByText(/兴奋型|Delighter/i).length).toBeGreaterThan(0);
    // Reverse
    expect(screen.getAllByText(/反向型|Reverse/i).length).toBeGreaterThan(0);
  });

  it('should have full viewport height class', () => {
    const { container } = render(<KanoModelSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('h-screen');
  });
});
