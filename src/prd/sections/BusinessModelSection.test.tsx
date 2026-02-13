import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BusinessModelSection } from './BusinessModelSection';

describe('BusinessModelSection', () => {
  it('renders section title', () => {
    render(<BusinessModelSection />);
    expect(screen.getByText(/商业模式/)).toBeInTheDocument();
  });

  it('renders subtitle about Mi Home model', () => {
    render(<BusinessModelSection />);
    expect(screen.getByText(/米家模式演变/)).toBeInTheDocument();
  });

  it('renders revenue streams', () => {
    render(<BusinessModelSection />);
    expect(screen.getByText(/线香耗材/)).toBeInTheDocument();
    expect(screen.getByText(/生活周边/)).toBeInTheDocument();
    expect(screen.getByText(/智能硬件/)).toBeInTheDocument();
    expect(screen.getByText(/内容\/服务订阅/)).toBeInTheDocument();
  });

  it('renders summary about hardware as entry point', () => {
    render(<BusinessModelSection />);
    // Summary text appears twice (in summary box and footer)
    const hardwareElements = screen.getAllByText(/硬件即入口/);
    expect(hardwareElements.length).toBeGreaterThan(0);
  });
});
