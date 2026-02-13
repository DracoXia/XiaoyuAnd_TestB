import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StrategySection } from './StrategySection';

describe('StrategySection', () => {
  it('should render section title', () => {
    render(<StrategySection />);
    expect(screen.getByText(/三阶段/)).toBeInTheDocument();
  });

  it('should render subtitle about hardware and traffic', () => {
    render(<StrategySection />);
    expect(screen.getByText(/硬件即入口/)).toBeInTheDocument();
  });

  it('should render all 3 stages', () => {
    render(<StrategySection />);
    expect(screen.getByText('点亮孤岛')).toBeInTheDocument();
    expect(screen.getByText('连接群岛')).toBeInTheDocument();
    expect(screen.getByText('构建屿宙')).toBeInTheDocument();
  });

  it('should render stage English names', () => {
    render(<StrategySection />);
    expect(screen.getByText('Early Stage')).toBeInTheDocument();
    expect(screen.getByText('Middle Stage')).toBeInTheDocument();
    expect(screen.getByText('Late Stage')).toBeInTheDocument();
  });

  it('should render strategic goals for each stage', () => {
    render(<StrategySection />);
    expect(screen.getByText(/单品爆破/)).toBeInTheDocument();
    expect(screen.getByText(/品类扩张/)).toBeInTheDocument();
    expect(screen.getByText(/生态闭环/)).toBeInTheDocument();
  });

  it('should have full viewport height class', () => {
    const { container } = render(<StrategySection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('h-screen');
  });
});
