/**
 * GiftReceivedModal - 收礼弹窗组件
 *
 * 功能：
 * 1. 显示赠送者的赠言和歌单
 * 2. 领取后将歌单添加到用户的音乐选项
 */

import React, { useState, useEffect } from 'react';
import { X, Gift, Music, Loader2, Check, Sparkles } from 'lucide-react';
import type { Gift } from '../lib/gift/types';
import { getGiftByNfcId, redeemGift } from '../lib/gift/api';
import { scanNFC, isNFCSupported, mockNFCScan } from '../lib/nfc/reader';
import type { PlaylistInfo } from '../lib/music/types';

interface GiftReceivedModalProps {
  isOpen: boolean;
  onClose: () => void;
  nfcId?: string; // 如果已有 NFC ID，直接查询；否则需要扫描
  onGiftAccepted?: (playlist: PlaylistInfo) => void;
}

type ModalState = 'loading' | 'scanning' | 'show-gift' | 'accepting' | 'success' | 'error' | 'no-gift';

const GiftReceivedModal: React.FC<GiftReceivedModalProps> = ({
  isOpen,
  onClose,
  nfcId,
  onGiftAccepted,
}) => {
  const [state, setState] = useState<ModalState>('loading');
  const [gift, setGift] = useState<Gift | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptedPlaylist, setAcceptedPlaylist] = useState<PlaylistInfo | null>(null);

  // 加载礼物信息
  useEffect(() => {
    if (!isOpen) return;

    const loadGift = async () => {
      setState('loading');
      setError(null);

      try {
        let targetNfcId = nfcId;

        // 如果没有提供 NFC ID，需要扫描
        if (!targetNfcId) {
          setState('scanning');
          const result = import.meta.env.DEV
            ? await mockNFCScan()
            : await scanNFC();

          if (!result.success || !result.nfcId) {
            setError(result.error || '扫描失败');
            setState('error');
            return;
          }
          targetNfcId = result.nfcId;
        }

        // 查询礼物
        const giftData = await getGiftByNfcId(targetNfcId);

        if (!giftData) {
          setState('no-gift');
          return;
        }

        if (giftData.status === 'redeemed') {
          setError('此礼物已被领取');
          setState('error');
          return;
        }

        setGift(giftData);
        setState('show-gift');
      } catch (err) {
        console.error('[GiftReceived] Error:', err);
        setError(err instanceof Error ? err.message : '加载失败');
        setState('error');
      }
    };

    loadGift();
  }, [isOpen, nfcId]);

  if (!isOpen) return null;

  // 接受礼物
  const handleAccept = async () => {
    if (!gift) return;

    setState('accepting');

    try {
      // 领取礼物
      const redeemedGift = await redeemGift(gift.nfcId);

      // 创建播放列表信息
      const playlist: PlaylistInfo = {
        id: redeemedGift.playlistId,
        platform: 'netease', // 礼物歌单来自网易云
        name: redeemedGift.playlistName || '朋友赠送的歌单',
        coverUrl: '',
        trackCount: 0,
        tracks: [],
        description: `来自「${redeemedGift.giverName}」的礼物`,
      };

      setAcceptedPlaylist(playlist);
      setState('success');
      onGiftAccepted?.(playlist);
    } catch (err) {
      console.error('[GiftReceived] Accept error:', err);
      setError(err instanceof Error ? err.message : '领取失败');
      setState('error');
    }
  };

  // 关闭
  const handleClose = () => {
    setState('loading');
    setGift(null);
    setError(null);
    setAcceptedPlaylist(null);
    onClose();
  };

  // 渲染加载状态
  const renderLoading = () => (
    <div className="flex flex-col items-center text-center p-6">
      <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
      <p className="text-ink-light">正在加载礼物...</p>
    </div>
  );

  // 渲染扫描状态
  const renderScanning = () => (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-6">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-ink-gray mb-2">正在扫描 NFC</h2>
      <p className="text-ink-light">请将 NFC 标签靠近设备...</p>
    </div>
  );

  // 渲染无礼物状态
  const renderNoGift = () => (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Gift className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-ink-gray mb-3">暂无礼物</h2>
      <p className="text-ink-light mb-6">此 NFC 尚未绑定赠送，无法领取。</p>
      <button
        onClick={handleClose}
        className="w-full py-4 rounded-2xl bg-gray-100 text-ink-gray font-bold text-lg"
      >
        关闭
      </button>
    </div>
  );

  // 渲染错误状态
  const renderError = () => (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <X className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-ink-gray mb-3">出错了</h2>
      <p className="text-ink-light mb-6">{error || '未知错误'}</p>
      <button
        onClick={handleClose}
        className="w-full py-4 rounded-2xl bg-gray-100 text-ink-gray font-bold text-lg"
      >
        关闭
      </button>
    </div>
  );

  // 渲染礼物展示
  const renderShowGift = () => (
    <div className="flex flex-col p-6">
      {/* 礼物图标 */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-amber-100 flex items-center justify-center mb-4">
          <Gift className="w-10 h-10 text-pink-500" />
        </div>
        <Sparkles className="w-6 h-6 text-amber-400 -mt-2 mb-2" />
        <h2 className="text-2xl font-bold text-ink-gray">{gift?.giverName}</h2>
      </div>

      {/* 赠言 */}
      {gift?.message && (
        <div className="bg-gradient-to-br from-pink-50 to-amber-50 rounded-2xl p-4 mb-4">
          <p className="text-ink-gray text-center italic">"{gift.message}"</p>
        </div>
      )}

      {/* 歌单预览 */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <Music className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-ink-gray">{gift?.playlistName || '网易云歌单'}</div>
            <div className="text-sm text-ink-light">来自网易云音乐</div>
          </div>
        </div>
      </div>

      {/* 接受按钮 */}
      <button
        onClick={handleAccept}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-lg transition-all active:scale-[0.98]"
      >
        收下礼物
      </button>
    </div>
  );

  // 渲染接受中状态
  const renderAccepting = () => (
    <div className="flex flex-col items-center text-center p-6">
      <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
      <p className="text-ink-light">正在领取礼物...</p>
    </div>
  );

  // 渲染成功状态
  const renderSuccess = () => (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <Check className="w-10 h-10 text-green-500" />
      </div>

      <h2 className="text-2xl font-bold text-ink-gray mb-3">礼物已收下</h2>

      <p className="text-ink-light mb-6 max-w-sm">
        歌单已添加到您的音乐选项，下次沉浸时可以选择播放。
      </p>

      <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 text-left">
        <div className="flex items-center gap-3">
          <Music className="w-5 h-5 text-pink-500" />
          <span className="font-bold text-ink-gray">{acceptedPlaylist?.name}</span>
        </div>
      </div>

      <button
        onClick={handleClose}
        className="w-full py-4 rounded-2xl bg-pink-500 text-white font-bold text-lg transition-all hover:bg-pink-600 active:scale-[0.98]"
      >
        开始体验
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && state !== 'accepting') handleClose();
      }}
    >
      <div className="w-full max-w-md mx-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="relative p-4 flex items-center">
          <div className="flex-1" />
          <button
            onClick={handleClose}
            disabled={state === 'accepting'}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-ink-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="pb-8">
          {state === 'loading' && renderLoading()}
          {state === 'scanning' && renderScanning()}
          {state === 'no-gift' && renderNoGift()}
          {state === 'error' && renderError()}
          {state === 'show-gift' && renderShowGift()}
          {state === 'accepting' && renderAccepting()}
          {state === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default GiftReceivedModal;
