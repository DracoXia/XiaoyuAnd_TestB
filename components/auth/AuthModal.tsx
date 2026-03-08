/**
 * AuthModal - 登录/注册 Modal 组件
 *
 * 功能：
 * 1. 手机号输入界面
 * 2. 验证码界面（V1 展示"开发中"提示）
 * 3. UI 与现有 App 保持统一
 */

import React, { useState } from 'react';
import { X, Phone, Loader2, Construction } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'phone' | 'dev-notice';

/**
 * 验证中国手机号格式
 */
const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 格式化手机号显示（隐藏中间4位）
 */
const maskPhoneNumber = (phone: string): string => {
  if (phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 如果 Modal 关闭，不渲染
  if (!isOpen) return null;

  const isPhoneValid = validatePhoneNumber(phoneNumber);

  // 获取验证码
  const handleGetCode = async () => {
    if (!isPhoneValid) return;

    setIsLoading(true);

    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsLoading(false);

    // V1 版本：显示开发中提示
    setStep('dev-notice');
  };

  // 关闭开发中提示，返回手机号输入
  const handleDevNoticeClose = () => {
    setStep('phone');
  };

  // 渲染手机号输入页
  const renderPhoneInput = () => (
    <div className="flex flex-col items-center text-center p-6">
      {/* 图标 */}
      <div className="w-20 h-20 rounded-full bg-dopamine-orange/20 flex items-center justify-center mb-6">
        <Phone className="w-10 h-10 text-dopamine-orange" />
      </div>

      {/* 标题 */}
      <h2 className="text-2xl font-bold text-ink-gray mb-2">登录 / 注册</h2>
      <p className="text-ink-light mb-8">用手机号开启专属疗愈之旅</p>

      {/* 手机号输入 */}
      <div className="w-full mb-4">
        <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3">
          <span className="text-ink-gray font-medium mr-2">+86</span>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="请输入手机号"
            className="flex-1 bg-transparent outline-none text-ink-gray placeholder:text-ink-light/50"
            maxLength={11}
          />
        </div>
      </div>

      {/* 获取验证码按钮 */}
      <button
        onClick={handleGetCode}
        disabled={!isPhoneValid || isLoading}
        className="w-full py-4 rounded-2xl bg-dopamine-orange text-white font-bold text-lg transition-all hover:bg-dopamine-orange/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            处理中...
          </>
        ) : (
          '获取验证码'
        )}
      </button>

      {/* 分隔线 */}
      <div className="w-full flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-ink-light text-sm">或</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 稍后再说按钮 */}
      <button
        onClick={onClose}
        className="w-full py-4 rounded-2xl bg-gray-100 text-ink-light font-bold text-lg transition-all hover:bg-gray-200 active:scale-[0.98]"
      >
        稍后再说
      </button>

      {/* 用户协议提示 */}
      <p className="text-xs text-ink-light mt-6">
        登录即表示同意{' '}
        <span className="text-dopamine-orange">用户协议</span>
        {' '}和{' '}
        <span className="text-dopamine-orange">隐私政策</span>
      </p>
    </div>
  );

  // 渲染开发中提示页
  const renderDevNotice = () => (
    <div className="flex flex-col items-center text-center p-6">
      {/* 图标 */}
      <div className="w-20 h-20 rounded-full bg-dopamine-blue/20 flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-dopamine-blue" />
      </div>

      {/* 标题 */}
      <h2 className="text-2xl font-bold text-ink-gray mb-2">功能开发中</h2>
      <p className="text-ink-light mb-2">手机登录功能即将上线</p>
      <p className="text-sm text-ink-light mb-8">敬请期待！</p>

      {/* 隐藏显示的手机号 */}
      <p className="text-sm text-ink-light/70 mb-6">
        您输入的手机号：{maskPhoneNumber(phoneNumber)}
      </p>

      {/* 我知道了按钮 */}
      <button
        onClick={handleDevNoticeClose}
        className="w-full py-4 rounded-2xl bg-dopamine-blue text-white font-bold text-lg transition-all hover:bg-dopamine-blue/90 active:scale-[0.98]"
      >
        我知道了
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md mx-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header with close button */}
        <div className="relative p-4 flex items-center">
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5 text-ink-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="pb-8">
          {step === 'phone' && renderPhoneInput()}
          {step === 'dev-notice' && renderDevNotice()}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
