/**
 * AuthModal 组件测试
 * TDD - 测试覆盖：组件渲染、手机号验证、开发中提示
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthModal from '../AuthModal';

describe('AuthModal', () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('渲染测试', () => {
    it('当 isOpen=false 时不应该渲染', () => {
      render(<AuthModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('登录 / 注册')).toBeNull();
    });

    it('当 isOpen=true 时应该渲染 Modal', () => {
      render(<AuthModal {...defaultProps} />);
      expect(screen.getByText('登录 / 注册')).toBeInTheDocument();
      expect(screen.getByText('用手机号开启专属疗愈之旅')).toBeInTheDocument();
    });

    it('应该显示手机号输入框', () => {
      render(<AuthModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('请输入手机号')).toBeInTheDocument();
    });

    it('应该显示获取验证码按钮', () => {
      render(<AuthModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /获取验证码/i })).toBeInTheDocument();
    });

    it('应该显示稍后再说按钮', () => {
      render(<AuthModal {...defaultProps} />);
      expect(screen.getByText('稍后再说')).toBeInTheDocument();
    });
  });

  describe('手机号验证', () => {
    it('无效手机号应该禁用获取验证码按钮', () => {
      render(<AuthModal {...defaultProps} />);
      const input = screen.getByPlaceholderText('请输入手机号');
      const button = screen.getByRole('button', { name: /获取验证码/i });

      fireEvent.change(input, { target: { value: '' } });
      expect(button).toBeDisabled();

      fireEvent.change(input, { target: { value: '123' } });
      expect(button).toBeDisabled();
    });

    it('有效手机号应该启用获取验证码按钮', () => {
      render(<AuthModal {...defaultProps} />);
      const input = screen.getByPlaceholderText('请输入手机号');
      const button = screen.getByRole('button', { name: /获取验证码/i });

      fireEvent.change(input, { target: { value: '13800138000' } });
      expect(button).not.toBeDisabled();
    });
  });

  describe('开发中提示', () => {
    it('点击获取验证码后应该显示开发中提示', async () => {
      render(<AuthModal {...defaultProps} />);
      const input = screen.getByPlaceholderText('请输入手机号');
      const button = screen.getByRole('button', { name: /获取验证码/i });

      fireEvent.change(input, { target: { value: '13800138000' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('功能开发中')).toBeInTheDocument();
      });
    });

    it('开发中提示应该有我知道了按钮', async () => {
      render(<AuthModal {...defaultProps} />);
      const input = screen.getByPlaceholderText('请输入手机号');
      const button = screen.getByRole('button', { name: /获取验证码/i });

      fireEvent.change(input, { target: { value: '13800138000' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /我知道了/i })).toBeInTheDocument();
      });
    });

    it('点击我知道了应该返回手机号输入页', async () => {
      render(<AuthModal {...defaultProps} />);
      const input = screen.getByPlaceholderText('请输入手机号');
      const getCodeButton = screen.getByRole('button', { name: /获取验证码/i });

      fireEvent.change(input, { target: { value: '13800138000' } });
      fireEvent.click(getCodeButton);

      await waitFor(() => {
        const okButton = screen.getByRole('button', { name: /我知道了/i });
        fireEvent.click(okButton);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('请输入手机号')).toBeInTheDocument();
      });
    });
  });

  describe('关闭功能', () => {
    it('点击稍后再说应该调用 onClose', () => {
      render(<AuthModal {...defaultProps} />);
      const skipButton = screen.getByText('稍后再说');
      fireEvent.click(skipButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
