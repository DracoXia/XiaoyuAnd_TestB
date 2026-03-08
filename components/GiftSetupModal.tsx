/**
 * GiftSetupModal - 赠送设置弹窗组件
 *
 * 功能：
 * 1. 设置赠送名称和赠言
 * 2. 粘贴网易云歌单链接
 * 3. 扫描 NFC 完成绑定
 */

import React, { useState } from 'react';
import { X, Gift, Music, Loader2, Check, HelpCircle } from 'lucide-react';
import type { GiftFormData } from '../lib/gift/types';
import { createGift, checkNfcBound } from '../lib/gift/api';
import { scanNFC, isNFCSupported, mockNFCScan } from '../lib/nfc/reader';
import { parseMusicLink } from '../lib/music';

interface GiftSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type SetupStep = 'form' | 'scan' | 'success';

const GiftSetupModal: React.FC<GiftSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<SetupStep>('form');
  const [formData, setFormData] = useState<GiftFormData>({
    giverName: '',
    message: '',
    playlistUrl: '',
  });
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [playlistPreview, setPlaylistPreview] = useState<{ id: string; name: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // 处理歌单链接输入
  const handlePlaylistChange = (url: string) => {
    setFormData({ ...formData, playlistUrl: url });
    setPlaylistError(null);
    setPlaylistPreview(null);

    if (!url.trim()) return;

    // 解析链接
    const result = parseMusicLink(url.trim());
    if (result.success && result.playlistId && result.platform === 'netease') {
      setPlaylistPreview({
        id: result.playlistId,
        name: '网易云歌单',
      });
    } else if (url.includes('music.163.com')) {
      setPlaylistError('无法解析此链接，请检查是否为有效的歌单链接');
    }
  };

  // 验证表单
  const isFormValid = () => {
    return (
      formData.giverName.trim().length > 0 &&
      formData.giverName.trim().length <= 20 &&
      formData.message.trim().length <= 200 &&
      formData.playlistUrl.trim().length > 0 &&
      playlistPreview !== null
    );
  };

  // 进入扫描步骤
  const handleNextToScan = () => {
    if (!isFormValid()) return;
    setStep('scan');
    setScanError(null);
  };

  // 执行 NFC 扫描
  const handleScan = async () => {
    setIsScanning(true);
    setScanError(null);

    try {
      // 开发环境使用模拟扫描
      const result = import.meta.env.DEV
        ? await mockNFCScan()
        : await scanNFC();

      if (!result.success || !result.nfcId) {
        setScanError(result.error || '扫描失败');
        setIsScanning(false);
        return;
      }

      // 检查 NFC 是否已绑定
      const isBound = await checkNfcBound(result.nfcId);
      if (isBound) {
        setScanError('此 NFC 已绑定过赠送，请使用新的 NFC');
        setIsScanning(false);
        return;
      }

      // 创建赠送记录
      await createGift({
        nfcId: result.nfcId,
        giverName: formData.giverName.trim(),
        message: formData.message.trim(),
        playlistUrl: formData.playlistUrl.trim(),
        playlistId: playlistPreview!.id,
        playlistName: playlistPreview!.name,
      });

      setStep('success');
      onSuccess?.();
    } catch (error) {
      console.error('[GiftSetup] Error:', error);
      setScanError(error instanceof Error ? error.message : '操作失败');
    } finally {
      setIsScanning(false);
    }
  };

  // 关闭并重置
  const handleClose = () => {
    setStep('form');
    setFormData({ giverName: '', message: '', playlistUrl: '' });
    setPlaylistError(null);
    setPlaylistPreview(null);
    setScanError(null);
    onClose();
  };

  // 渲染表单步骤
  const renderForm = () => (
    <div className="flex flex-col p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-100">
          <Gift className="w-6 h-6 text-pink-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink-gray">把一首歌，送给重要的人</h2>
          <p className="text-sm text-ink-light">写下想说的话，保存到产品中</p>
        </div>
      </div>

      {/* 赠送名称 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-ink-gray mb-2">
          这份礼物的名字 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.giverName}
          onChange={(e) => setFormData({ ...formData, giverName: e.target.value })}
          placeholder="如：来自小明的祝福"
          maxLength={20}
          className="w-full p-4 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-pink-300 focus:outline-none transition-colors"
        />
        <p className="text-xs text-ink-light mt-1 text-right">
          {formData.giverName.length}/20
        </p>
      </div>

      {/* 赠言 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-ink-gray mb-2">
          想对TA说的话
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="写一句祝福的话..."
          maxLength={200}
          rows={3}
          className="w-full p-4 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-pink-300 focus:outline-none transition-colors resize-none"
        />
        <p className="text-xs text-ink-light mt-1 text-right">
          {formData.message.length}/200
        </p>
      </div>

      {/* 歌单链接 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-ink-gray mb-2">
          一首陪伴的歌 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.playlistUrl}
          onChange={(e) => handlePlaylistChange(e.target.value)}
          placeholder="粘贴网易云音乐歌单链接..."
          className="w-full p-4 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-pink-300 focus:outline-none transition-colors"
        />
        {playlistError && (
          <p className="text-red-500 text-sm mt-2">{playlistError}</p>
        )}
        {playlistPreview && (
          <div className="flex items-center gap-2 mt-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm">已识别歌单</span>
          </div>
        )}
      </div>

      <button
        onClick={handleNextToScan}
        disabled={!isFormValid()}
        className="w-full py-4 rounded-2xl bg-pink-500 text-white font-bold text-lg transition-all hover:bg-pink-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        保存到产品
      </button>
    </div>
  );

  // 渲染扫描步骤
  const renderScan = () => (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-6">
        {isScanning ? (
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
        ) : (
          <Gift className="w-10 h-10 text-pink-500" />
        )}
      </div>

      <h2 className="text-xl font-bold text-ink-gray mb-2">
        {isScanning ? '正在绑定...' : '扫描产品 NFC'}
      </h2>

      <p className="text-ink-light mb-6 max-w-sm">
        {isScanning
          ? '请将产品 NFC 靠近设备'
          : '扫描产品上的 NFC 标签，绑定后将无法更改'}
      </p>

      {scanError && (
        <div className="w-full p-4 rounded-2xl bg-red-50 text-red-500 text-sm mb-4">
          {scanError}
        </div>
      )}

      {!isNFCSupported() && (
        <div className="w-full p-4 rounded-2xl bg-yellow-50 text-yellow-700 text-sm mb-4 flex items-start gap-2">
          <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>您的设备不支持 NFC，开发环境下将使用模拟扫描</span>
        </div>
      )}

      <button
        onClick={handleScan}
        disabled={isScanning}
        className="w-full py-4 rounded-2xl bg-pink-500 text-white font-bold text-lg transition-all hover:bg-pink-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isScanning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            扫描中...
          </>
        ) : (
          '开始扫描'
        )}
      </button>

      <button
        onClick={() => setStep('form')}
        disabled={isScanning}
        className="w-full py-3 text-ink-light font-medium mt-3 disabled:opacity-50"
      >
        返回修改
      </button>
    </div>
  );

  // 渲染成功步骤
  const renderSuccess = () => (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <Check className="w-10 h-10 text-green-500" />
      </div>

      <h2 className="text-2xl font-bold text-ink-gray mb-3">赠送设置成功</h2>

      <p className="text-ink-light mb-8 max-w-sm">
        您已成功设置赠送歌单，现在可以将产品赠送给朋友了。
        朋友扫描 NFC 后即可看到您的赠言和歌单。
      </p>

      <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 text-left">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-5 h-5 text-pink-500" />
          <span className="font-bold text-ink-gray">{formData.giverName}</span>
        </div>
        {formData.message && (
          <p className="text-ink-light text-sm italic">"{formData.message}"</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-ink-light text-sm">
          <Music className="w-4 h-4" />
          <span>{playlistPreview?.name}</span>
        </div>
      </div>

      <button
        onClick={handleClose}
        className="w-full py-4 rounded-2xl bg-pink-500 text-white font-bold text-lg transition-all hover:bg-pink-600 active:scale-[0.98]"
      >
        完成
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isScanning && !isSubmitting) handleClose();
      }}
    >
      <div className="w-full max-w-md mx-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="relative p-4 flex items-center">
          <div className="flex-1" />
          <button
            onClick={handleClose}
            disabled={isScanning || isSubmitting}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-ink-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="pb-8">
          {step === 'form' && renderForm()}
          {step === 'scan' && renderScan()}
          {step === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default GiftSetupModal;
