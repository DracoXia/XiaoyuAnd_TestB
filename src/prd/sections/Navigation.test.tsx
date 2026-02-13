import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Navigation } from './Navigation';

describe('Navigation', () => {
  it('renders navigation container with sticky positioning', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('sticky');
    expect(nav).toHaveClass('top-0');
  });

  it('renders all navigation links', () => {
    render(<Navigation />);
    // Check for all section links
    expect(screen.getByText('品牌')).toBeInTheDocument();
    expect(screen.getByText('核心理念')).toBeInTheDocument();
    expect(screen.getByText('Kano模型')).toBeInTheDocument();
    expect(screen.getByText('核心假设')).toBeInTheDocument();
    expect(screen.getByText('用户流程')).toBeInTheDocument();
    expect(screen.getByText('产品规格')).toBeInTheDocument();
    expect(screen.getByText('战略路径')).toBeInTheDocument();
    expect(screen.getByText('路线图')).toBeInTheDocument();
    expect(screen.getByText('商业模式')).toBeInTheDocument();
  });

  it('has correct href anchors for each section', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: '品牌' })).toHaveAttribute('href', '#hero');
    expect(screen.getByRole('link', { name: '核心理念' })).toHaveAttribute('href', '#philosophy');
    expect(screen.getByRole('link', { name: 'Kano模型' })).toHaveAttribute('href', '#kano');
    expect(screen.getByRole('link', { name: '核心假设' })).toHaveAttribute('href', '#hypotheses');
    expect(screen.getByRole('link', { name: '用户流程' })).toHaveAttribute('href', '#userflow');
    expect(screen.getByRole('link', { name: '产品规格' })).toHaveAttribute('href', '#products');
    expect(screen.getByRole('link', { name: '战略路径' })).toHaveAttribute('href', '#strategy');
    expect(screen.getByRole('link', { name: '路线图' })).toHaveAttribute('href', '#roadmap');
    expect(screen.getByRole('link', { name: '商业模式' })).toHaveAttribute('href', '#business');
  });

  it('has glass-morphism styling', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('backdrop-blur-md');
  });
});
