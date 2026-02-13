import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductLineupSection } from './ProductLineupSection';

describe('ProductLineupSection', () => {
  it('should render section title', () => {
    render(<ProductLineupSection />);
    expect(screen.getByText('线香产品规格')).toBeInTheDocument();
  });

  it('should render all 3 products', () => {
    render(<ProductLineupSection />);
    expect(screen.getByText('晚巷')).toBeInTheDocument();
    expect(screen.getByText('听荷')).toBeInTheDocument();
    expect(screen.getByText('小院')).toBeInTheDocument();
  });

  it('should render product English names', () => {
    render(<ProductLineupSection />);
    expect(screen.getByText('Evening Alley')).toBeInTheDocument();
    expect(screen.getByText('Listening to Lotus')).toBeInTheDocument();
    expect(screen.getByText('Small Yard')).toBeInTheDocument();
  });

  it('should render product slogans', () => {
    render(<ProductLineupSection />);
    expect(screen.getByText('和温柔在一起')).toBeInTheDocument();
    expect(screen.getByText('和清静在一起')).toBeInTheDocument();
    expect(screen.getByText('和自在在一起')).toBeInTheDocument();
  });

  it('should render product vibes', () => {
    render(<ProductLineupSection />);
    expect(screen.getByText(/安抚/)).toBeInTheDocument();
    expect(screen.getByText(/澄澈/)).toBeInTheDocument();
    expect(screen.getByText(/呼吸/)).toBeInTheDocument();
  });

  it('should have full viewport height class', () => {
    const { container } = render(<ProductLineupSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('h-screen');
  });
});
