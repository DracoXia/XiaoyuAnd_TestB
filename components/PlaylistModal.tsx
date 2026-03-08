/**
 * PlaylistModal - 歌单导入弹窗组件
 *
 * 功能：
 * 1. 引导用户导入网易云音乐 / Apple Music 歌单
 * 2. 四步流程：欢迎 → 平台选择 → 链接输入 → 成功
 * 3. 内嵌播放器支持
 */

import React, { useState, useEffect } from 'react';
import { X, Music, Gift, Sparkles, ArrowLeft, HelpCircle, Check, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { GuideStep, MusicPlatform, PlaylistInfo, PLATFORM_CONFIGS, XIAOYU_SONGS } from '../lib/music/types';
import { parseMusicLink, getEmbeddedPlayerUrl } from '../lib/music';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistSet: (playlist: PlaylistInfo | null) => void;
  existingPlaylist?: PlaylistInfo | null;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  onPlaylistSet,
  existingPlaylist,
}) => {
  const [step, setStep] = useState<GuideStep>('welcome');
  const [selectedPlatform, setSelectedPlatform] = useState<MusicPlatform | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importedPlaylist, setImportedPlaylist] = useState<PlaylistInfo | null>(existingPlaylist);
  const [showHelp, setShowHelp] = useState(false);

  // 弹窗打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setImportedPlaylist(existingPlaylist);
      // 如果已有歌单，显示管理页面；否则显示欢迎页
      setStep(existingPlaylist ? 'manage' : 'welcome');
      setSelectedPlatform(null);
      setLinkInput('');
      setLinkError(null);
      setShowHelp(false);
    }
  }, [isOpen, existingPlaylist]);

  // 如果弹窗关闭，不渲染
  if (!isOpen) return null;

  // 处理平台选择
  const handlePlatformSelect = (platform: MusicPlatform) => {
    const config = PLATFORM_CONFIGS.find(p => p.id === platform);
    if (config?.comingSoon) {
      return; // Coming Soon 的平台不可点击
    }
    setSelectedPlatform(platform);

    // 小屿和音乐库 - 跳转到歌曲列表页面
    if (platform === 'xiaoyu') {
      setStep('xiaoyu-library');
      return;
    }

    setStep('link');
  };

  // 处理链接导入
  const handleImportLink = async () => {
    if (!linkInput.trim()) {
      setLinkError('请输入歌单链接');
      return;
    }

    const result = parseMusicLink(linkInput.trim());

    if (!result.success || !result.playlistId || !result.platform) {
      setLinkError(result.error || '无法解析链接');
      return;
    }

    setIsLoading(true);
    setLinkError(null);

    try {
      // 模拟获取歌单信息（实际需要调用 API）
      const playlist: PlaylistInfo = {
        id: result.playlistId,
        platform: result.platform,
        name: '我的歌单',
        coverUrl: '',
        trackCount: 0,
        tracks: [],
      };

      setImportedPlaylist(playlist);
      setStep('success');
    } catch (error) {
      setLinkError('导入失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理完成
  const handleComplete = () => {
    onPlaylistSet(importedPlaylist);
    onClose();
  };

  // 处理删除歌单
  const handleRemovePlaylist = () => {
    setImportedPlaylist(null);
    onPlaylistSet(null);
    onClose();
  };

  // 返回上一步
  const handleBack = () => {
    switch (step) {
      case 'link':
        setStep('platform');
        setSelectedPlatform(null);
        setLinkInput('');
        setLinkError(null);
        break;
      case 'xiaoyu-library':
        setStep('platform');
        break;
      case 'platform':
        // 如果已有歌单，返回管理页；否则返回欢迎页
        setStep(existingPlaylist ? 'manage' : 'welcome');
        break;
      default:
        break;
    }
  };

  // 处理小屿和音乐库歌曲选择
  const handleXiaoyuSongSelect = (song: typeof XIAOYU_SONGS[0]) => {
    if (!song.available) return;

    const playlist: PlaylistInfo = {
      id: song.id,
      platform: 'xiaoyu',
      name: song.name,
      coverUrl: '',
      trackCount: 1,
      tracks: [],
      description: song.description,
    };
    setImportedPlaylist(playlist);
    setStep('success');
  };

  // 渲染欢迎页
  const renderWelcome = () => (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-dopamine-orange/20 flex items-center justify-center mb-6">
        <Music className="w-10 h-10 text-dopamine-orange" />
      </div>
      <h2 className="text-2xl font-bold text-ink-gray mb-3">
        把你喜欢的音乐带进疗愈时光
      </h2>
      <p className="text-ink-light mb-8 max-w-sm">
        小屿支持导入你的私人歌单，让熟悉的旋律陪伴每一次呼吸。
      </p>
      <div className="w-full space-y-3">
        <button
          onClick={() => setStep('platform')}
          className="w-full py-4 rounded-2xl bg-ink-gray text-white font-bold text-lg transition-all hover:bg-ink-gray/90 active:scale-[0.98]"
        >
          开始设置
        </button>
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gray-100 text-ink-light font-bold text-lg transition-all hover:bg-gray-200 active:scale-[0.98]"
        >
          稍后再说
        </button>
      </div>
    </div>
  );

  // 渲染管理页面（已有歌单时显示）
  const renderManage = () => (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-dopamine-orange/20 flex items-center justify-center mb-6">
        <Music className="w-10 h-10 text-dopamine-orange" />
      </div>

      <h2 className="text-2xl font-bold text-ink-gray mb-2">我的歌单</h2>

      <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: importedPlaylist?.platform === 'netease'
                ? '#C20C0C20'
                : importedPlaylist?.platform === 'xiaoyu'
                ? '#F59E0B20'
                : importedPlaylist?.platform === 'gift'
                ? '#EC489920'
                : '#FC3C4420'
            }}
          >
            {importedPlaylist?.platform === 'netease' ? (
              <Music className="w-5 h-5" style={{ color: '#C20C0C' }} />
            ) : importedPlaylist?.platform === 'xiaoyu' ? (
              <Sparkles className="w-5 h-5" style={{ color: '#F59E0B' }} />
            ) : importedPlaylist?.platform === 'gift' ? (
              <Gift className="w-5 h-5" style={{ color: '#EC4899' }} />
            ) : (
              <Music className="w-5 h-5" style={{ color: '#FC3C44' }} />
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-ink-gray truncate">
              {importedPlaylist?.name || '私人歌单'}
            </div>
            <div className="text-sm text-ink-light">
              {importedPlaylist?.platform === 'netease' && '网易云音乐'}
              {importedPlaylist?.platform === 'xiaoyu' && '小屿和音乐库'}
              {importedPlaylist?.platform === 'gift' && (importedPlaylist?.description || '朋友的礼物')}
              {importedPlaylist?.trackCount && ` · ${importedPlaylist.trackCount} 首`}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={() => setStep('platform')}
          className="w-full py-4 rounded-2xl bg-dopamine-orange text-white font-bold text-lg transition-all hover:bg-dopamine-orange/90 active:scale-[0.98]"
        >
          更换歌单
        </button>
        <button
          onClick={handleRemovePlaylist}
          className="w-full py-4 rounded-2xl bg-gray-100 text-red-500 font-bold text-lg transition-all hover:bg-red-50 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          删除歌单
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 text-ink-light font-medium"
        >
          取消
        </button>
      </div>
    </div>
  );

  // 渲染平台选择页
  const renderPlatformSelect = () => (
    <div className="flex flex-col items-center text-center p-6">
      <h2 className="text-2xl font-bold text-ink-gray mb-2">选择你的音乐平台</h2>
      <p className="text-ink-light mb-8">从以下平台导入你的歌单</p>

      <div className="w-full space-y-4">
        {PLATFORM_CONFIGS.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handlePlatformSelect(platform.id)}
            disabled={platform.comingSoon}
            className={`
              w-full p-4 rounded-2xl flex items-center gap-4 transition-all
              ${platform.comingSoon
                ? 'bg-gray-50 opacity-60 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 active:scale-[0.98] border border-gray-100'}
            `}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${platform.color}20` }}
            >
              {platform.id === 'netease' && <Music className="w-6 h-6" style={{ color: platform.color }} />}
              {platform.id === 'gift' && <Gift className="w-6 h-6" style={{ color: platform.color }} />}
              {platform.id === 'xiaoyu' && <Sparkles className="w-6 h-6" style={{ color: platform.color }} />}
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-ink-gray">{platform.name}</div>
              {platform.comingSoon && (
                <div className="text-xs text-ink-light">Coming Soon</div>
              )}
            </div>
            {platform.comingSoon && (
              <span className="text-xs bg-gray-200 text-ink-light px-2 py-1 rounded-full">
                敬请期待
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // 渲染小屿和音乐库歌曲列表
  const renderXiaoyuLibrary = () => (
    <div className="flex flex-col p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100">
          <Sparkles className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink-gray">小屿和音乐库</h2>
          <p className="text-sm text-ink-light">选择一首音乐陪伴你的疗愈时光</p>
        </div>
      </div>

      <div className="w-full space-y-3">
        {XIAOYU_SONGS.map((song) => (
          <button
            key={song.id || song.name}
            onClick={() => handleXiaoyuSongSelect(song)}
            disabled={!song.available}
            className={`
              w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left
              ${song.available
                ? 'bg-white hover:bg-amber-50 active:scale-[0.98] border border-gray-100'
                : 'bg-gray-50 opacity-60 cursor-not-allowed'}
            `}
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${song.available ? 'bg-amber-100' : 'bg-gray-200'}
            `}>
              {song.available ? (
                <Music className="w-5 h-5 text-amber-500" />
              ) : (
                <Music className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className={`font-bold ${song.available ? 'text-ink-gray' : 'text-ink-light'}`}>
                {song.name}
              </div>
              <div className="text-sm text-ink-light">{song.description}</div>
            </div>
            {!song.available && (
              <span className="text-xs bg-gray-200 text-ink-light px-2 py-1 rounded-full">
                Coming Soon
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // 渲染链接输入页
  const renderLinkInput = () => (
    <div className="flex flex-col items-center text-center p-6">
      <h2 className="text-2xl font-bold text-ink-gray mb-2">粘贴歌单分享链接</h2>
      <p className="text-ink-light mb-6">
        {selectedPlatform === 'netease' && '从网易云音乐 App 分享歌单，复制链接'}
        {selectedPlatform === 'gift' && '朋友的礼物将通过 NFC 赠送'}
      </p>

      <div className="w-full mb-4">
        <input
          type="text"
          value={linkInput}
          onChange={(e) => {
            setLinkInput(e.target.value);
            setLinkError(null);
          }}
          placeholder="粘贴歌单链接或嵌入代码..."
          className="w-full p-4 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-dopamine-orange focus:outline-none transition-colors text-left"
        />
        {linkError && (
          <p className="text-red-500 text-sm mt-2 text-left">{linkError}</p>
        )}
      </div>

      <div className="w-full mb-4 text-left">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-sm text-ink-light hover:text-ink-gray transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>如何获取歌单链接？</span>
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHelp && (
          <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-ink-light space-y-3">
            {selectedPlatform === 'netease' && (
              <>
                <p className="font-medium text-ink-gray">网易云音乐：</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>打开网易云音乐网页版 (music.163.com)</li>
                  <li>进入你想分享的歌单页面</li>
                  <li>点击"生成外链播放器"</li>
                  <li>复制 iframe 代码或歌单链接粘贴到此处</li>
                </ol>
                <p className="text-xs text-ink-light/70 mt-2">
                  提示：也可以直接粘贴歌单页面链接，如 music.163.com/playlist?id=xxx
                </p>
              </>
            )}
            {selectedPlatform === 'apple' && (
              <>
                <p className="font-medium text-ink-gray">朋友的礼物：</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>在主界面点击赠送按钮</li>
                  <li>填写赠言和选择歌单</li>
                  <li>扫描 NFC 完成赠送</li>
                </ol>
              </>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleImportLink}
        disabled={isLoading}
        className="w-full py-4 rounded-2xl bg-ink-gray text-white font-bold text-lg transition-all hover:bg-ink-gray/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            导入中...
          </>
        ) : (
          '导入歌单'
        )}
      </button>
    </div>
  );

  // 渲染成功页
  const renderSuccess = () => (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-dopamine-green/20 flex items-center justify-center mb-6">
        <Check className="w-10 h-10 text-dopamine-green" />
      </div>
      <h2 className="text-2xl font-bold text-ink-gray mb-3">歌单已导入</h2>
      {importedPlaylist && (
        <p className="text-ink-light mb-8">
          「{importedPlaylist.name}」共 {importedPlaylist.trackCount || '若干'} 首
        </p>
      )}
      <p className="text-sm text-ink-light mb-8">
        下次进入沉浸时，将自动播放你的私人歌单。
      </p>
      <button
        onClick={handleComplete}
        className="w-full py-4 rounded-2xl bg-dopamine-orange text-white font-bold text-lg transition-all hover:bg-dopamine-orange/90 active:scale-[0.98]"
      >
        完成
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
          {step !== 'welcome' && step !== 'success' && step !== 'manage' && (
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-ink-gray" />
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-ink-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="pb-8">
          {step === 'welcome' && renderWelcome()}
          {step === 'manage' && renderManage()}
          {step === 'platform' && renderPlatformSelect()}
          {step === 'xiaoyu-library' && renderXiaoyuLibrary()}
          {step === 'link' && renderLinkInput()}
          {step === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
